import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { InfoRow, type InfoRowStatus } from "@/components/InfoRow";

const KB_IN_MB = 1024;
const KB_IN_GB = 1024 * 1024;
const KB_IN_TB = 1024 * 1024 * 1024;

type StorageInfoCardProps = {
  title?: string;
  path?: string;
  totalKb?: number | string | null;
  freeKb?: number | string | null;
  color?: string;
};

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === "") return 0;

  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const getPercent = (value: number, total: number): number => {
  if (total <= 0) return 0;
  return Number(((value / total) * 100).toFixed(2));
};

const formatStorageFromKb = (value: unknown): string => {
  const kb = toNumber(value);

  if (kb <= 0) return "-";

  if (kb >= KB_IN_TB) {
    return `${(kb / KB_IN_TB).toFixed(2)} TB`;
  }

  if (kb >= KB_IN_GB) {
    return `${(kb / KB_IN_GB).toFixed(2)} GB`;
  }

  if (kb >= KB_IN_MB) {
    return `${(kb / KB_IN_MB).toFixed(2)} MB`;
  }

  return `${kb.toFixed(2)} KB`;
};

const getStorageStatusByUsedPercent = (
  usedPercent: number
): InfoRowStatus => {
  if (usedPercent <= 0) return "normal";
  if (usedPercent >= 70) return "critical";
  if (usedPercent >= 50) return "warning";
  return "success";
};

const getStorageStatusText = (usedPercent: number): string => {
  if (usedPercent <= 0) return "Unknown";
  if (usedPercent >= 70) return "Critical";
  if (usedPercent >= 50) return "Warning";
  return "Healthy";
};

const getStatusIcon = (status: InfoRowStatus) => {
  if (status === "critical") {
    return <AlertTriangle size={16} className="text-red-400" />;
  }

  if (status === "warning") {
    return <AlertTriangle size={16} className="text-yellow-400" />;
  }

  if (status === "success") {
    return <CheckCircle2 size={16} className="text-emerald-400" />;
  }

  return <HelpCircle size={16} className="text-slate-400" />;
};

export function StorageInfoCard({
  title = "Storage Info",
  path,
  totalKb,
  freeKb,
  color = "text-white",
}: StorageInfoCardProps) {
  const total = toNumber(totalKb);
  const free = toNumber(freeKb);

  const used = Math.max(total - free, 0);

  const freePercent = getPercent(free, total);
  const usedPercent = getPercent(used, total);

  const status = getStorageStatusByUsedPercent(usedPercent);
  const statusText = getStorageStatusText(usedPercent);

  return (
    <div className="rounded-xl border bg-[#18212d] p-3 shadow-lg">
      <div
        className={`mb-2 flex items-center justify-between text-sm font-semibold uppercase tracking-wide underline ${color}`}
      >
        <span>{title}</span>
        {getStatusIcon(status)}
      </div>

      <div className="space-y-1 text-xs">
        {path ? <InfoRow k="Path" v={path} /> : null}

        <InfoRow
          k="Total Space"
          v={formatStorageFromKb(total)}
        /> 

        <InfoRow
          k="Free Space"
          v={formatStorageFromKb(free)}
        />

        <InfoRow
          k="Status"
          v={statusText}
          status={status}
        /> 

        <InfoRow
          k="Free Space"
          v={`${freePercent}% Free`}
          progress={freePercent}
          progressLabel="Free Space"
        />
      </div>
    </div>
  );
}