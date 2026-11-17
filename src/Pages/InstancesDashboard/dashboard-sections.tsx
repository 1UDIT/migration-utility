import { AlertTriangle, ArrowBigUp, CheckCircle2, Server, SquareDashedBottomCode, UploadCloud } from "lucide-react";
import { IoMdCloseCircleOutline } from "react-icons/io";

import { InfoRow } from "@/components/InfoRow.tsx";
import { KpiCard } from "@/components/ui/KpiCard.tsx";
import { KpiStatus } from "@/components/ui/KpiStatus.tsx";
import { Button } from "@/components/ui/button.tsx";
import { bytesToGB, msToHuman, safe } from "@/components/Column/FetchColumnDetail.tsx";
import type { RunningInstance } from "./types.ts";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { MigrationActivityChart, type ActivityChartPoint } from "./MigrationActivityChart.tsx";


const mediaType = [
  { label: "ALTO-DISK", value: "alto-disk" },
  { label: "LTO", value: "LTO" },
  { label: "MT", value: "MT" }
]


type StatusFilter = "ALL" | "Running" | "NotActive" | "Stale";
type KpiState = {
  active: number;
  notActive: number;
  totalStorage: number;
  usedStoragePercentage: number;
  storageStatus: "Healthy" | "Warning" | "Critical" | "Info" | "Unknown";
  driveFreePercent: number;
};

export type ActivitySummary = {
  migrationCompleted: { count: number; isLoading: boolean };
  migrationFailed: { count: number; isLoading: boolean };
  decodedCompleted: { count: number; isLoading: boolean };
  decodedFailed: { count: number; isLoading: boolean };
};

const DATA_RANGES = [
  { value: "overall", label: "Overall (All Time)" },
  { value: "24-hours", label: "24 Hours" },
  { value: "1-hour", label: "1 Hour" },
] as const;

export type DataRange = (typeof DATA_RANGES)[number]["value"];
export type { KpiState, StatusFilter };

export function DashboardToolbar({
  query,
  status,
  nonActiveInstance,
  onQueryChange,
  onStatusChange,
  onRefresh,
}: {
  query: string;
  status: StatusFilter;
  nonActiveInstance: number;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-2xl font-bold text-white">Running Instances</div>
        <div className="text-sm text-white">Live view of current tape transfers</div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search instance / IP / drive"
            className="w-full rounded-xl border bg-white px-3 py-2 pr-8 outline-none focus:ring"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              title="Clear search"
              aria-label="Clear search"
            >
              <IoMdCloseCircleOutline size={18} />
            </button>
          )}
        </div>

        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
          className="rounded-xl border bg-white px-3 py-2 font-semibold"
          aria-label="Filter instances by status"
        >
          <option value="ALL">Status: All</option>
          <option value="Running">Running (&lt; {nonActiveInstance / 3600}h)</option>
          <option value="NotActive">Not Active</option>
          <option value="Stale">Stale (&gt; 24h)</option>
        </select>

        <button
          type="button"
          onClick={onRefresh}
          className="rounded-xl border bg-white px-3 py-2 hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

export function DashboardKpis({ kpi, nonActiveInstance }: { kpi: KpiState; nonActiveInstance: number }) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Active Instances"
        value={kpi.active}
        subtitle="Currently running"
        status="Info"
        icon={<CheckCircle2 size={20} />}
      />
      <KpiCard
        title={`Not Active (<${nonActiveInstance / 3600}h) Instances`}
        value={kpi.notActive}
        subtitle="Recently inactive"
        status={kpi.notActive > 0 ? "Warning" : "Healthy"}
        icon={<AlertTriangle size={20} />}
      />
      <KpiCard
        title="Total Storage"
        value={kpi.totalStorage ? `${kpi.totalStorage} TB` : "N/A"}
        subtitle={`${kpi.usedStoragePercentage}% used`}
        status={kpi.storageStatus}
        icon={<Server size={20} />}
        progress={kpi.driveFreePercent}
        progressLabel="Remaining Space"
      />
    </div>
  );
}


const LoadingDots = () => (
  <span className="inline-flex items-center">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="inline-block animate-bounce"
        style={{ animationDelay: `${i * 150}ms` }}
      >
        .
      </span>
    ))}
  </span>
);


export function MigrationActivitySummary({
  activitySummary,
  dataRange,
  collapsed,
  onRangeChange,
  onToggle,
  setMediaType,
  chartData,
  chartLoading,
}: {
  activitySummary: ActivitySummary;
  dataRange: DataRange;
  collapsed: boolean;
  onRangeChange: (range: DataRange) => void;
  onToggle: () => void;
  setMediaType: (value: string | null) => void;
  chartData: ActivityChartPoint[];
  chartLoading: boolean;
}) {
  return (
    <section className="mb-4 rounded-xl border border-slate-500 bg-[#18212d] p-4">
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-dashed border-slate-500 pb-2 text-sm font-semibold text-white">
        <span>Migration Activity Summary</span>
        <Select defaultValue={mediaType[0].value} onValueChange={(value) => setMediaType(value)}>
          <SelectTrigger className="w-48 border-slate-600 bg-[#111c2b] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {mediaType.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-[#111c2b] p-1">
            {DATA_RANGES.map(({ value, label }) => {
              const isActive = dataRange === value;
              return (
                <Button
                  key={value}
                  variant="ghost"
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onRangeChange(value)}
                  className={`h-8 min-w-[90px] rounded-md px-3 text-[12px] font-semibold transition ${isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-[#1b2a3d] hover:text-slate-200"
                    }`}
                >
                  {label}
                </Button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand migration summary" : "Collapse migration summary"}
          >
            <ArrowBigUp
              width={30}
              className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <KpiStatus
              title="Migration completed"
              value={activitySummary.migrationCompleted.isLoading ? <LoadingDots /> : activitySummary.migrationCompleted.count}
              subtitle={
                dataRange === "overall"
                  ? "All time"
                  : dataRange === "24-hours"
                    ? "Rolling last 24 hours"
                    : "Rolling last 1 hour"
              }
              status="Info"
              icon={<UploadCloud size={20} />}
            />
            <KpiStatus
              title="Migration Failed"
              value={activitySummary.migrationFailed.isLoading ? <LoadingDots /> : activitySummary.migrationFailed.count}
              subtitle={getRangeLabel(dataRange)}
              status={activitySummary.migrationFailed.count > 0 ? "Warning" : "Healthy"}
              icon={<UploadCloud size={20} />}
            />
            <KpiStatus
              title="Decoded completed"
              value={activitySummary.decodedCompleted.isLoading ? <LoadingDots /> : activitySummary.decodedCompleted.count}
              subtitle={getRangeLabel(dataRange)}
              status="Info"
              icon={<SquareDashedBottomCode size={20} />}
            />
            <KpiStatus
              title="Decoded Failed"
              value={activitySummary.decodedFailed.isLoading ? <LoadingDots /> : activitySummary.decodedFailed.count}
              subtitle={getRangeLabel(dataRange)}
              status={activitySummary.decodedFailed.count > 0 ? "Warning" : "Healthy"}
              icon={<SquareDashedBottomCode size={20} />}
            />
          </div>
          <div className="mt-4">
            <MigrationActivityChart
              data={chartData}
              isLoading={chartLoading}
            />
          </div>
        </>
      )}
    </section>
  );
}

function getRangeLabel(dataRange: DataRange) {
  if (dataRange === "overall") return "All time";
  if (dataRange === "24-hours") return "Rolling last 24 hours";
  return "Rolling last 1 hour";
}

export function InstanceDetailsPanel({
  instance,
  borderColor,
  statusColor,
  storageStatusColor,
  onClose,
}: {
  instance: RunningInstance | null;
  borderColor: string;
  statusColor: string;
  storageStatusColor: string;
  onClose: () => void;
}) {
  return (
    <aside className={`min-h-0 overflow-auto rounded-2xl border-4 bg-[#24303f] ${borderColor}`}>
      <div className={`sticky top-0 flex items-center justify-between border-b bg-[#24303f] px-4 py-3 ${borderColor}`}>
        <div className={`font-semibold ${statusColor}`}>{instance?.instanceName ?? "Select an instance"}</div>
        {instance && (
          <button type="button" onClick={onClose} aria-label="Close instance details">
            <IoMdCloseCircleOutline color="#ffffff" size={25} />
          </button>
        )}
      </div>

      {!instance ? (
        <div className="p-4 text-sm text-white">Click any row to view current/previous tape details.</div>
      ) : (
        <div className="space-y-4 p-4">
          <Section title="Storage Info" color={storageStatusColor}>
            <InfoRow k="Drive(Letter)" v={instance.driveLetter ? instance.driveLetter.toUpperCase() : "N/A"} />
            <InfoRow k="Total Space" v={instance.driveTotalSize !== null ? `${instance.driveTotalSize}TB` : "N/A"} />
            <InfoRow k="Free Space" v={instance.driveRemainingSize !== null ? `${instance.driveRemainingSize}TB` : "N/A"} />
            <InfoRow k="Status" v={instance.storageStatus} status={instance.storageStatus} />
            <InfoRow k="Storage Usage" v={instance.driveFreePercent !== null ? `${instance.driveFreePercent}% Free` : "N/A"} status={instance.storageStatus} progress={instance.driveUsedPercent} progressLabel="Used Space" />
          </Section>
          <Section title="Instance Info" color={statusColor}>
            <InfoRow k="IP" v={safe(instance.ip)} />
            <InfoRow k="Drive" v={safe(instance.driveNB)} />
            <InfoRow k="TID" v={safe(instance.tlID)} />
            <InfoRow k="Last Updated" v={instance.lastupdatedDate ? new Date(instance.lastupdatedDate).toLocaleString() : "-"} />
            <InfoRow k="Total Files" v={safe(instance.totalFiles)} />
          </Section>
          <Section title="File Info" color={statusColor}>
            <InfoRow k="File Name" v={safe(instance.startedDumpingObjectName)} />
            <InfoRow k="File Size" v={instance.startedDumpingObjectSize ? `${bytesToGB(instance.startedDumpingObjectSize)} GB` : "-"} />
            <InfoRow k="Prev Obj Throughput" v={safe(instance.previousObjectThroughput)} />
          </Section>
          <TapeSection title="Current Tape" color={statusColor} tape={instance.currentTape} started={instance.startTimeCurrentTape} transferred={instance.sizeTransferCurrentTape} duration={instance.durationCurrentTapeMS} throughput={instance.currentTapeThroughput} />
          <TapeSection title="Previous Tape" color={statusColor} tape={instance.previousTape} started={instance.startTimePreviousTape} transferred={instance.sizeTransferPreviousTape} duration={instance.durationPreviousTapeMS} throughput={instance.previousTapeThroughput} />
        </div>
      )}
    </aside>
  );
}

function TapeSection({ title, color, tape, started, transferred, duration, throughput }: { title: string; color: string; tape: string | null; started: string | null; transferred: number | null; duration: number | null; throughput: number | null }) {
  return (
    <Section title={title} color={color}>
      <InfoRow k="Tape" v={safe(tape)} />
      <InfoRow k="Started" v={safe(started)} />
      <InfoRow k="Transferred" v={`${bytesToGB(transferred)} GB`} />
      <InfoRow k="Duration" v={msToHuman(duration)} />
      <InfoRow k="Throughput" v={`${safe(throughput)} MB/s`} />
    </Section>
  );
}

function Section({ title, children, color }: { title: string; children: React.ReactNode; color: string }) {
  return (
    <div className="rounded-xl border bg-[#18212d] p-3 shadow-lg">
      <div className={`mb-2 text-sm font-semibold uppercase tracking-wide underline ${color}`}>{title}</div>
      <div className="space-y-1 text-xs">{children}</div>
    </div>
  );
}
