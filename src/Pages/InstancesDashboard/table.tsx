import React, { useEffect, useMemo, useState, Suspense, lazy } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { AlertTriangle, CheckCircle2, Server } from "lucide-react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaSortDown, FaSortUp } from "react-icons/fa";
import { toast } from "sonner";

import type { RootState } from "@/Redux/Store.tsx";
import type { RunningInstance } from "./types.ts";

import { fetchData } from "../Object_Details/HandleApiCall/Apicall.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import useKeyNavigationx from "@/hooks/useKeyNavigation.tsx";
import { useSelectionRow } from "@/hooks/useSelectionRow.tsx.tsx";
import FetchColumnDetail, {
  bytesToGB,
  msToHuman,
  safe,
} from "@/components/Column/FetchColumnDetail.tsx";
import { KpiCard } from "@/components/ui/KpiCard.tsx";
import { InfoRow } from "@/components/InfoRow.tsx";
import { StorageWarningBanner } from "@/components/ui/StorageWarningBanner.tsx";
import { GlobalStorageAlert } from "@/components/GlobalStorageAlert";
import {
  Dialog,
} from "@/components/ui/dialog"
const IndexPopup = lazy(() => import("@/Pages/UUID_Details/DialogPopup/Index"));

const KB_IN_TB = 1024 * 1024 * 1024;

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === "") return 0;

  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const kbToTb = (kb: number): number => {
  return kb / KB_IN_TB;
};

const formatKbToTb = (value: unknown): string => {
  const kb = toNumber(value);
  if (kb <= 0) return "0.00 TB";

  return `${kbToTb(kb).toFixed(2)} TB`;
};





export default function RunningInstancesDashboard() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<
    "ALL" | "Running" | "NotActive" | "Stale"
  >("ALL");

  const [selected, setSelected] = useState<RunningInstance | null>(null);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "ip", desc: false },
  ]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [hideStorageAlert, setHideStorageAlert] = useState(false);
  const [highlightedRows, SetMultipleRowsSelection] = useState<any[]>([]);
  const [Filter, setFilter] = useState<any>();
  const [previousSelection, setPreviousSelection] = useState<number | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RunningInstance | null>(null);

  const ipAddress = useSelector(
    (state: RootState) => state.tableDownClick.ipAddressStore
  );
  const apiPort = useSelector(
    (state: RootState) => state.tableDownClick.apiPort
  );

  const nonActiveInstance = useSelector(
    (state: RootState) => state.tableDownClick.nonActiveInstance
  );

  const { ColumnInstance } = FetchColumnDetail();

  const body = useMemo(() => {
    const { startDate, ...rest } = Filter ?? {};

    const filters: any = {
      ...rest,
    };

    if (q.trim() !== "") {
      filters.q = q.trim();
    }

    if (status !== "ALL") {
      filters.status = status;
    }

    return {
      filters,
      sorting,
      nonActiveInstance,
    };
  }, [Filter, sorting, status, q, nonActiveInstance]);

  const { data, isLoading, refetch, isFetched, dataUpdatedAt } = useQuery({
    queryKey: [
      "running_instances",
      pagination,
      body,
      sorting,
      nonActiveInstance,
    ],
    queryFn: async ({ signal }) => {
      const endpoint = `http://${ipAddress}:${apiPort}/Instance?page=${pagination.pageIndex + 1
        }&limit=${pagination.pageSize}`;

      return fetchData(endpoint, "POST", body, signal);
    },
    networkMode: "always",
    refetchInterval: 15000,
    retry: false,
  });

  const tableData = useMemo(() => {
    if (isLoading) return Array(10).fill({});

    return Array.isArray(data?.data) ? data.data : [];
  }, [isLoading, data]);


  const kpi = useMemo(() => {
    return {
      active: data?.activeInstance || 0,
      NotActive: data?.notActiveInstance || 0,
      totalStorage: data?.totalStorage || 0,
      usedStoragePercentage: data?.driveUsedPercent || 0,
      storageStatus: data?.storageStatus,
      freeStorage: data?.freeStorage || 0,
      driveFreePercent: data?.driveFreePercent || 0
    };
  }, [data]);

  useEffect(() => {
    setHideStorageAlert(false);
  }, [selected?.instanceName, selected?.storageStatus]);

  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = '';
    };
  }, [openDialog]);

  const tableColumns = useMemo(() => {
    if (!isLoading) return ColumnInstance;

    return ColumnInstance.map((column) => ({
      ...column,
      cell: () => (
        <div className="flex flex-col space-y-3">
          <Skeleton className="mt-1 h-[20px] w-full rounded-xl" />
        </div>
      ),
    }));
  }, [isLoading, ColumnInstance]);

  const getAgeSeconds = (dateValue: unknown): number => {
    if (!dateValue) return Number.MAX_SAFE_INTEGER;

    const time = new Date(String(dateValue)).getTime();

    if (Number.isNaN(time)) return Number.MAX_SAFE_INTEGER;

    return (Date.now() - time) / 1000;
  };

  const borderColor = useMemo(() => {
    if (!selected?.lastupdatedDate) return "border-slate-500";

    const diffSeconds = getAgeSeconds(selected.lastupdatedDate);

    if (diffSeconds <= nonActiveInstance) return "border-green-500";
    if (diffSeconds <= 86400) return "border-red-500";

    return "border-red-500";
  }, [selected, nonActiveInstance]);

  const statusColor = useMemo(() => {
    if (!selected?.lastupdatedDate) return "text-white border-gray-500";

    const diffSeconds = getAgeSeconds(selected.lastupdatedDate);

    if (diffSeconds <= nonActiveInstance) return "text-white";
    return "text-red-400 border-red-500";
  }, [selected, nonActiveInstance]);

  const storageStatusColor = useMemo(() => {
    const storageStatus = String(selected?.storageStatus ?? "").toLowerCase();

    if (storageStatus === "critical") {
      return "text-red-400";
    }

    if (storageStatus === "warning") {
      return "text-yellow-400";
    }

    if (storageStatus === "healthy") {
      return "text-green-400";
    }

    if (storageStatus === "unknown") {
      return "text-slate-300";
    }

    return "";
  }, [selected?.storageStatus]);

  const [keyNavigation, setActiveCursor] = useKeyNavigationx(
    tableData,
    setPreviousSelection,
    SetMultipleRowsSelection,
    (index) => {
      requestAnimationFrame(() => {
        document.getElementById(`row-${index}`)?.scrollIntoView({
          block: "center",
          behavior: "auto",
        });
      });
    }
  );

  useEffect(() => {
    if (!isLoading && tableData?.length) {
      setSelected(tableData[keyNavigation]);
    }
  }, [isLoading, tableData, keyNavigation]);

  const handleRowClick = (event: React.MouseEvent, id: number) => {
    useSelectionRow(
      event,
      id,
      SetMultipleRowsSelection,
      previousSelection,
      setPreviousSelection,
      isLoading
    );
  };

  const openTapeDetails = async (instance: RunningInstance) => {
    if (!instance.currentTape) {
      toast.error("Current tape is not available");
      return;
    }

    try {
      const endpoint = `http://${ipAddress}:${apiPort}/uuids?page=1&limit=50`;
      const uuidResult = await fetchData(endpoint, "POST", {
        filters: { UUID: instance.currentTape },
        sorting: [],
      });
      const matchingTape = uuidResult?.data?.find(
        (item: { UUID?: string }) => item.UUID === instance.currentTape
      );
      const mediaType = matchingTape?.mediaType;

      if (!mediaType) {
        toast.error(`Media type was not found for ${instance.currentTape}`);
        return;
      }

      setSelectedRow({ ...instance, mediaType });
      setOpenDialog(true);
    } catch (error) {
      console.error("Failed to load the tape media type", error);
      toast.error("Failed to load the tape media type");
    }
  };

  const table = useReactTable({
    data: tableData || [],
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    manualSorting: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination,
    },
  });

  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto p-2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div>
            <div className="text-2xl font-bold text-white">
              Running Instances
            </div>
            <div className="text-sm text-white">
              Live view of current tape transfers
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search instance / IP / drive"
              className="w-full rounded-xl border bg-white px-3 py-2 pr-8 outline-none focus:ring"
            />

            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                title="Clear"
              >
                <IoMdCloseCircleOutline size={18} />
              </button>
            )}
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            onFocus={(e) => e.target.blur()}
            className="rounded-xl border bg-white px-3 py-2 font-semibold"
          >
            <option value="ALL">Status: All</option>
            <option value="Running">
              Running (&lt; {nonActiveInstance / 3600}h)
            </option>
            <option value="NotActive">Not Active</option>
            <option value="Stale">Stale (&gt; 24h)</option>
          </select>

          <button
            onClick={() => refetch()}
            className="rounded-xl border bg-white px-3 py-2 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Instances"
          value={`${kpi.active}`}
          subtitle="Currently running"
          status="Info"
          icon={<CheckCircle2 size={20} />}
        />

        <KpiCard
          title={`Not Active (<${nonActiveInstance / 3600}h) Instances`}
          value={`${kpi.NotActive}`}
          subtitle="Recently inactive"
          status={kpi.NotActive > 0 ? "Warning" : "Healthy"}
          icon={<AlertTriangle size={20} />}
        />

        <KpiCard
          title="Total Storage"
          value={kpi.totalStorage ? `${(kpi.totalStorage)} TB` : "N/A"}
          subtitle={`${kpi.usedStoragePercentage}% used`}
          status={kpi.storageStatus}
          icon={<Server size={20} />}
          progress={kpi.driveFreePercent}
          progressLabel="Remaining Space"
        />
        {!hideStorageAlert && (
          <StorageWarningBanner
            status={selected?.storageStatus}
            instanceName={selected?.instanceName}
            usedPercent={selected?.driveUsedPercent}
            freePercent={selected?.driveFreePercent}
            onClose={() => setHideStorageAlert(true)}
          />
        )}
      </div>

      <GlobalStorageAlert rows={tableData} refreshKey={dataUpdatedAt} />
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] lg:w-full 2xl:w-[100%]">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-[#24303f]">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="font-semibold text-white">Instances</div>

            <div className="flex items-center gap-4 text-xs text-white">
              <div className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                <span>Updated</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                <span>&gt; {nonActiveInstance / 3600}h</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-gray-500" />
                <span>&gt; 24h</span>
              </div>
            </div>

            <div className="text-sm text-white">
              {!isFetched ? "Updating..." : `${tableData?.length ?? 0} rows`}
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead className="sticky top-0 z-50 bg-[#2d3d52] text-white drop-shadow-md">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          position: "relative",
                          width: header.getSize(),
                          fontSize: "clamp(0.8rem, 1.5vw, 1rem)",
                        }}
                        className="sticky top-0 bg-[#2d3d52] px-1.5 text-white drop-shadow-md"
                      >
                        <div className="flex w-full items-center justify-between">
                          <span
                            className="flex w-full items-center hover:border-r hover:border-[#414954]"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span className="w-[70%]">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>

                            <span className="flex w-[30%] justify-end pt-1">
                              {{
                                asc: (
                                  <FaSortUp className="h-4 w-4 font-bold text-red-500" />
                                ),
                                desc: (
                                  <FaSortDown className="h-4 w-4 font-bold text-red-500" />
                                ),
                              }[
                                header.column.getIsSorted() as string
                              ] ?? null}
                            </span>
                          </span>
                        </div>

                        {header.column.getCanResize() && (
                          <div
                            onDoubleClick={() => header.column.resetSize()}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`resizer ${header.column.getIsResizing()
                              ? "isResizing"
                              : ""
                              }`}
                          />
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map((row) => {
                  const isSelected = highlightedRows.includes(row.index);
                  const isCursor = keyNavigation === row.index && !isLoading;

                  const rowAgeSeconds = getAgeSeconds(
                    (row.original as RunningInstance).lastupdatedDate
                  );

                  return (
                    <tr
                      key={row.index}
                      id={`row-${row.index}`}
                      className={[
                        "h-7 font-medium",
                        !isSelected && !isCursor
                          ? rowAgeSeconds > 86400
                            ? "bg-gray-500 text-white"
                            : rowAgeSeconds > nonActiveInstance
                              ? "bg-[#f7545485] text-white"
                              : "odd:bg-[#24303f] even:bg-[#2d3d52] text-white"
                          : "",
                        isSelected ? "bg-[#e0cfb0] text-black" : "",
                        isCursor && !isSelected
                          ? "!bg-[#e0cfb0] !text-black outline outline-1 outline-[#e0cfb0]"
                          : "",
                      ].join(" ")}
                      onClick={(e) => {
                        const isRemoving =
                          e.ctrlKey && highlightedRows.includes(row.index);

                        handleRowClick(e, row.index);
                        setSelected(row.original as RunningInstance);

                        if (isRemoving) {
                          const next = highlightedRows
                            .filter((x) => x !== row.index)
                            .at(-1);

                          setActiveCursor(next ?? -1);
                        } else {
                          setActiveCursor(row.index);
                        }
                      }}
                      onDoubleClick={() => {
                        void openTapeDetails(row.original as RunningInstance);
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="px-1"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {tableData?.length === 0 && !isFetched && (
                  <tr>
                    <td
                      colSpan={ColumnInstance.length}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`min-h-0 overflow-auto rounded-2xl border-4 bg-[#24303f] ${borderColor}`}>
          <div
            className={`sticky top-0 flex items-center justify-between border-b bg-[#24303f] px-4 py-3 ${borderColor}`}
          >
            <div className={`font-semibold ${statusColor}`}>
              {selected?.instanceName ?? "Select an instance"}
            </div>

            {selected && (
              <button onClick={() => setSelected(null)}>
                <IoMdCloseCircleOutline color="#ffffff" size={25} />
              </button>
            )}
          </div>

          {!selected ? (
            <div className="p-4 text-sm text-white">
              Click any row to view current/previous tape details.
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <Section title="Storage Info" color={storageStatusColor}>

                <InfoRow
                  k="Drive(Letter)"
                  v={selected.driveLetter === null ? "N/A" : selected.driveLetter.toUpperCase()}
                />
                <InfoRow
                  k="Total Space"
                  v={selected.driveTotalSize !== null ? `${(selected.driveTotalSize)}TB` : "N/A"}
                />

                <InfoRow
                  k="Free Space"
                  v={selected.driveRemainingSize !== null ? `${(selected.driveRemainingSize)}TB` : "N/A"}
                />

                <InfoRow
                  k="Status"
                  v={selected.storageStatus}
                  status={selected.storageStatus}
                />

                <InfoRow
                  k="Storage Usage"
                  v={selected.driveFreePercent !== null ? `${selected.driveFreePercent}% Free` : "N/A"}
                  status={selected.storageStatus}
                  progress={selected.driveUsedPercent}
                  progressLabel="Used Space"
                />
              </Section>

              <Section title="Instance Info" color={statusColor}>
                <InfoRow k="IP" v={safe(selected.ip)} />
                <InfoRow k="Drive" v={safe(selected.driveNB)} />
                <InfoRow k="TID" v={safe(selected.tlID)} />
                <InfoRow
                  k="Last Updated"
                  v={
                    selected.lastupdatedDate
                      ? new Date(selected.lastupdatedDate).toLocaleString()
                      : "-"
                  }
                />
                <InfoRow k="Total Files" v={safe(selected.totalFiles)} />
              </Section>

              <Section title="File Info" color={statusColor}>
                <InfoRow
                  k="File Name"
                  v={safe(selected.startedDumpingObjectName)}
                />
                <InfoRow
                  k="File Size"
                  v={
                    selected.startedDumpingObjectSize
                      ? `${bytesToGB(selected.startedDumpingObjectSize)} GB`
                      : "-"
                  }
                />
                <InfoRow
                  k="Prev Obj Throughput"
                  v={safe(selected.previousObjectThroughput)}
                />
              </Section>

              <Section title="Current Tape" color={statusColor}>
                <InfoRow k="Tape" v={safe(selected.currentTape)} />
                <InfoRow
                  k="Started"
                  v={safe(selected.startTimeCurrentTape)}
                />
                <InfoRow
                  k="Transferred"
                  v={`${bytesToGB(selected.sizeTransferCurrentTape)} GB`}
                />
                <InfoRow
                  k="Duration"
                  v={msToHuman(selected.durationCurrentTapeMS)}
                />
                <InfoRow
                  k="Throughput"
                  v={`${safe(selected.currentTapeThroughput)} MB/s`}
                />
              </Section>

              <Section title="Previous Tape" color={statusColor}>
                <InfoRow k="Tape" v={safe(selected.previousTape)} />
                <InfoRow
                  k="Started"
                  v={safe(selected.startTimePreviousTape)}
                />
                <InfoRow
                  k="Transferred"
                  v={`${bytesToGB(selected.sizeTransferPreviousTape)} GB`}
                />
                <InfoRow
                  k="Duration"
                  v={msToHuman(selected.durationPreviousTapeMS)}
                />
                <InfoRow
                  k="Throughput"
                  v={`${safe(selected.previousTapeThroughput)} MB/s`}
                />
              </Section>
            </div>
          )}
        </div>
      </div>

      {
        openDialog && selectedRow && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <Suspense fallback={""}>
              <IndexPopup
                data={{
                  currentTape: selectedRow.currentTape ?? undefined,
                  mediaType: selectedRow.mediaType ?? undefined,
                  totalObjectCount: selectedRow.totalFiles ?? undefined,
                }}
                setOpenDialog={setOpenDialog}
                openDialog={openDialog}
              />
            </Suspense>
          </Dialog>
        )
      }
    </div>
  );
}

function Section({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-[#18212d] p-3 shadow-lg">
      <div
        className={`mb-2 text-sm font-semibold uppercase tracking-wide underline ${color}`}
      >
        {title}
      </div>

      <div className="space-y-1 text-xs">{children}</div>
    </div>
  );
}
