import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { format, subHours } from "date-fns";
import { FaSortDown, FaSortUp } from "react-icons/fa";
import { toast } from "sonner";

import type { RootState } from "@/Redux/Store.tsx";
import type { RunningInstance } from "./types.ts";
import { mergeActivityData, type MigrationSummaryResponse } from "./mergeActivityData.tsx";

import { fetchData } from "../Object_Details/HandleApiCall/Apicall.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import useKeyNavigationx from "@/hooks/useKeyNavigation.tsx";
import { useSelectionRow as updateRowSelection } from "@/hooks/useSelectionRow.tsx.tsx";
import FetchColumnDetail from "@/components/Column/FetchColumnDetail.tsx";
import { GlobalStorageAlert } from "@/components/GlobalStorageAlert";
import { Dialog } from "@/components/ui/dialog";
import {
  DashboardKpis,
  DashboardToolbar,
  InstanceDetailsPanel,
  MigrationActivitySummary,
  type ActivitySummary,
  type DataRange,
  type StatusFilter,
} from "./dashboard-sections.tsx";
const IndexPopup = lazy(() => import("@/Pages/UUID_Details/DialogPopup/Index"));

const getAgeSeconds = (dateValue: unknown): number => {
  if (!dateValue) return Number.MAX_SAFE_INTEGER;
  const time = new Date(String(dateValue)).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : (Date.now() - time) / 1000;
};

const ACTIVITY_STATUSES = [
  { key: "migrationCompleted", status: "MIGRATION_COMPLETED" },
  { key: "migrationFailed", status: "MIGRATION_FAILED" },
  { key: "decodedCompleted", status: "DECODE_COMPLETED" },
  { key: "decodedFailed", status: "DECODE_FAILED" },
] as const;

export default function RunningInstancesDashboard() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");

  const [selected, setSelected] = useState<RunningInstance | null>(null);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "ip", desc: false },
  ]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [dataRange, setDataRange] = useState<DataRange>("1-hour");
  const [highlightedRows, SetMultipleRowsSelection] = useState<number[]>([]);
  const [previousSelection, setPreviousSelection] = useState<number | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RunningInstance | null>(null);
  const [hideSummary, setHideSummary] = useState(true);
  const [mediaType, setMediaType] = useState<string | null>("alto-disk");

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
    const filters: Record<string, string> = {};

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
  }, [sorting, status, q, nonActiveInstance]);

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

  const activityDateRange = useMemo(() => {
    const now = new Date();
    const hours = dataRange === "24-hours" ? 24 : 1;

    return {
      from: format(subHours(now, hours), "yyyy-MM-dd HH:mm:ss"),
      to: format(now, "yyyy-MM-dd HH:mm:ss"),
    };
  }, [dataRange]);

  console.log(activityDateRange," activityDateRange");

  const activityQueries = useQueries({
    queries: ACTIVITY_STATUSES.map(({ status: activityStatus }) => ({
      queryKey: ["activity-summary", activityStatus, dataRange, activityDateRange, ipAddress, apiPort, mediaType],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchData(
          `http://${ipAddress}:${apiPort}/objects/migrationSummary`,
          "POST",
          {
            status: activityStatus,
            mediaType: mediaType,
            from: activityDateRange.from,
            to: activityDateRange.to,
          },
          signal
        ),
      enabled: !hideSummary,
      retry: false,
    })),
  });

  const activitySummary = ACTIVITY_STATUSES.reduce<ActivitySummary>(
    (summary, { key }, index) => {
      const query = activityQueries[index];
      const response = query.data as MigrationSummaryResponse | undefined;
      summary[key] = {
        count: Number(response?.totals?.objectCount ?? 0),
        TotalSizeTB: Number(response?.totals?.totalSizeTB ?? 0),
        isLoading: query.isLoading,
      };
      return summary;
    },
    {
      migrationCompleted: { count: 0, TotalSizeTB: 0, isLoading: false },
      migrationFailed: { count: 0, TotalSizeTB: 0, isLoading: false },
      decodedCompleted: { count: 0, TotalSizeTB: 0, isLoading: false },
      decodedFailed: { count: 0, TotalSizeTB: 0, isLoading: false },
    }
  );

  const chartData = useMemo(() => {
    const migration = activityQueries[0].data as MigrationSummaryResponse | undefined;
    const decoded = activityQueries[2].data as MigrationSummaryResponse | undefined;

    if (!migration?.rows || !decoded?.rows) return [];
    return mergeActivityData(migration, decoded);
  }, [activityQueries[0].data, activityQueries[2].data]);

  const chartLoading =
    activityQueries[0].isLoading || activityQueries[2].isLoading;

  const tableData = useMemo(() => {
    if (isLoading) return Array(10).fill({});

    return Array.isArray(data?.data) ? data.data : [];
  }, [isLoading, data]);


  const kpi = useMemo(() => {
    return {
      active: data?.activeInstance || 0,
      notActive: data?.notActiveInstance || 0,
      totalStorage: data?.totalStorage || 0,
      usedStoragePercentage: data?.driveUsedPercent || 0,
      storageStatus: data?.storageStatus || "Unknown",
      driveFreePercent: data?.driveFreePercent || 0
    };
  }, [data]);


  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = '';
    };
  }, []);

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
    updateRowSelection(
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
      <DashboardToolbar
        query={q}
        status={status}
        nonActiveInstance={nonActiveInstance}
        onQueryChange={setQ}
        onStatusChange={setStatus}
        onRefresh={() => void refetch()}
      />
      <DashboardKpis kpi={kpi} nonActiveInstance={nonActiveInstance} />
      <MigrationActivitySummary
        activitySummary={activitySummary}
        dataRange={dataRange}
        collapsed={hideSummary}
        onRangeChange={setDataRange}
        onToggle={() => setHideSummary((hidden) => !hidden)}
        setMediaType={setMediaType}
        chartData={chartData}
        chartLoading={chartLoading}
      />

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

        <InstanceDetailsPanel
          instance={selected}
          borderColor={borderColor}
          statusColor={statusColor}
          storageStatusColor={storageStatusColor}
          onClose={() => setSelected(null)}
        />
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
