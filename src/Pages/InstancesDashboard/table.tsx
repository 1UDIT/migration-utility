import React, { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel, 
  useReactTable,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import type { RunningInstance } from "./types.ts";
import { fetchData } from "../Object_Details/HandleApiCall/Apicall.tsx";
import { useSelector } from "react-redux";
import type { RootState } from "@/Redux/Store.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx"; 
import useKeyNavigationx from "@/hooks/useKeyNavigation.tsx";
import { useSelectionRow } from "@/hooks/useSelectionRow.tsx.tsx";
import { IoMdCloseCircleOutline } from "react-icons/io"; 
import { FaSortDown, FaSortUp } from 'react-icons/fa'; 
import FetchColumnDetail, { bytesToGB, msToHuman } from "@/components/Column/FetchColumnDetail.tsx";

 
function safe(s: any) {
  return s === null || s === undefined || s === "" ? "-" : String(s);
} 


// ---------- component ----------
export default function RunningInstancesDashboard() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | "Running" | "Stale">("ALL");

  const [selected, setSelected] = useState<RunningInstance | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "ip", desc: false },
  ]);
  const ipAddress = useSelector((state: RootState) => state.tableDownClick.ipAddressStore);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  }); 
  const [highlightedRows, SetMultipleRowsSelection] = useState<any[]>([]);
  const [Filter, setFilter] = useState<any>();
  const { ColumnInstance } = FetchColumnDetail();
  const nonActiveInstance = useSelector((state: RootState) => state.tableDownClick.nonActiveInstance)

  const body = useMemo(() => {
    const { startDate, ...rest } = (Filter ?? {});

    const filters: any = {
      ...rest,
    };

    // add search only if text exists
    if (q.trim() !== "") {
      filters.q = q.trim();
    }

    // add status only if not ALL
    if (status !== "ALL") {
      filters.status = status;
    }

    return {
      filters,
      sorting,
      nonActiveInstance
    };
  }, [Filter, sorting, status, q, nonActiveInstance]);


  const { data, isLoading, refetch,  isFetched } = useQuery({
    queryKey: ['running_instances', pagination, body, sorting, nonActiveInstance],
    queryFn: async ({ signal }) => {
      const endpoint = `http://${ipAddress}:4000/Instance?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`;
      return fetchData(endpoint, "POST", body, signal);
    },
    networkMode: 'always',
    refetchInterval: 15000,
    retry: false,
  });

  const tableData = useMemo(() =>
    (isLoading === true ? Array(10).fill({}) : data?.data),
    [isLoading, data]
  );
 
  // KPI calculations
  const kpi = useMemo(() => {
    const active = data?.activeInstance || 0;
    const NotActive = data?.notActiveInstance || 0; 

    return {
      active,
      NotActive
    };
  }, [data]);

  // const columns = useMemo<ColumnDef<RunningInstance>[]>(() => {
  //   return [
  //     {
  //       id: "health",
  //       header: "",
  //       cell: ({ row }) => {
  //         const lastUpdate = new Date(row.original.lastupdatedDate).getTime();
  //         const now = Date.now();

  //         const diffHours = (now - lastUpdate) / (1000 * 60 * 60);

  //         let color = "";
  //         let label = "";

  //         if (diffHours <= nonActiveInstance) {
  //           color = "text-green-400 animate-[greenPulse_2s_ease-in-out_infinite]";
  //           label = "Healthy";
  //         } else if (diffHours <= 24) {
  //           color = "text-red-500 animate-[redPulse_2s_ease-in-out_infinite]";
  //           label = "Not Active";
  //         } else {
  //           color = "text-gray-400 animate-[grayPulse_2s_ease-in-out_infinite]";
  //           label = "Offline (>24h)";
  //         }

  //         return (
  //           <FaCircle
  //             className={`inline-block h-3 w-3 ${color}`}
  //             title={label}
  //           />
  //         );
  //       },
  //       size: 20,
  //     },
  //     {
  //       accessorKey: "instanceName",
  //       header: "Instance",
  //       cell: ({ row, getValue }) => (
  //         <button
  //           className="text-left font-semibold"
  //           onClick={() => setSelected(row.original)}
  //           title="Open details"
  //         >
  //           {safe(getValue())}
  //         </button>
  //       ),
  //     },
  //     {
  //       accessorKey: "ip",
  //       header: "IP",
  //       cell: ({ getValue }) => <span >{safe(getValue())}</span>,
  //       size: 100
  //     },
  //     {
  //       id: "drive_tid",
  //       header: "Drive / TID",
  //       cell: ({ row }) => (
  //         <span  >
  //           {safe(row.original.driveNB)} / {safe(row.original.tlID)}
  //         </span>
  //       ),
  //     },
  //     {
  //       accessorKey: "currentTape",
  //       header: "Current Tape",
  //       cell: ({ getValue }) => <span className="font-medium">{safe(getValue())}</span>, 
  //       size: 100
  //     },
  //     {
  //       accessorKey: "currentTapeThroughput",
  //       header: "Throughput (MB/s)",
  //       cell: ({ getValue }) => (
  //         <span className="tabular-nums">{(Number(getValue() ?? 0).toFixed(0))} </span>
  //       ),
  //       size: 125
  //     },
  //     {
  //       accessorKey: "sizeTransferCurrentTape",
  //       header: "Transferred (GB)",
  //       cell: ({ getValue }) => <span className="tabular-nums">{bytesToGB(Number(getValue() ?? 0))}</span>,
  //       size: 110
  //     },
  //     {
  //       accessorKey: "durationCurrentTapeMS",
  //       header: "Duration",
  //       cell: ({ getValue }) => <span className="tabular-nums">{msToHuman(Number(getValue() ?? 0))}</span>,
  //       size: 90
  //     },
  //     {
  //       accessorKey: "lastupdatedDate",
  //       header: "Last Updated",
  //       cell: ({ getValue }) => {
  //         const d = new Date(String(getValue()));
  //         return <span >{isNaN(d.getTime()) ? "-" : d.toLocaleString()}</span>;
  //       },
  //     },
  //   ];
  // }, []);

  const tableColumns = useMemo(
    () =>
      isLoading === true
        ? ColumnInstance.map((column) => ({
          ...column,
          cell: () => (
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[20px] w-full rounded-xl mt-1" />
            </div>
          )
        }))
        : ColumnInstance,
    [isLoading, ColumnInstance]
  );

  const borderColor = useMemo(() => {
    if (!selected?.lastupdatedDate) return "border-slate-500";

    const diffHours =
      (Date.now() - new Date(selected.lastupdatedDate).getTime()) /
      (1000 * 60 * 60);

    if (diffHours <= nonActiveInstance) return "border-green-500";
    if (diffHours <= 24) return "border-red-500";
    return "border-red-500";
  }, [selected, nonActiveInstance]);

  const statusColor = useMemo(() => {
    if (!selected?.lastupdatedDate) return "text-white border-gray-500";

    const diffHours =
      (Date.now() - new Date(selected.lastupdatedDate).getTime()) /
      (1000 * 60 * 60);

    if (diffHours <= 24) return "text-white";
    return "text-red-400 border-red-500";
  }, [selected, nonActiveInstance]);

  const [previousSelection, setPreviousSelection] = useState<number | null>(null);
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
    useSelectionRow(event, id, SetMultipleRowsSelection, previousSelection, setPreviousSelection, isLoading);
  };

  const table = useReactTable({
    data: tableData || [],
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    manualSorting: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination,
    },
  });

  return (
    <div className="min-h-screen p-2">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* <div className="h-10 w-10 rounded-xl bg-slate-900" /> */}
          <div>
            <div className="text-2xl font-bold text-white">Running Instances</div>
            <div className="text-sm text-white">Live view of current tape transfers</div>
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
            <option value="Running">Running (&lt; 2h)</option>
            <option value="NotActive">Not Active (2-24h)</option>
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

      {/* KPI row */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard title="Active Instances" value={`${kpi.active}`} />
        <KpiCard title={`Not Active (<${nonActiveInstance}h) Instances`} value={`${kpi.NotActive}`} />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] h-[75%] 2xl:w-[100%] lg:w-full ">
        {/* Table */}
        <div className="rounded-2xl border bg-[#24303f] overflow-auto">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="font-semibold text-white">Instances</div>
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-white">

              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-green-500 inline-block"></span>
                <span>Updated</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-red-500 inline-block"></span>
                <span> &lt; {nonActiveInstance}h</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-gray-500 inline-block"></span>
                <span>&lt; 24h</span>
              </div>

            </div>
            <div className="text-sm text-white">
              {!isFetched ? "Updating..." : `${data?.data?.length} rows`}
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead className={`th select-none text-white sticky top-0 bg-[#2d3d52]  z-50 `}>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          style={{ position: 'relative', width: header.getSize(), fontSize: "clamp(0.8rem, 1.5vw, 1rem)" }}
                          className="th select-none px-1.5 text-white sticky top-0 bg-[#2d3d52] drop-shadow-md"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span
                              className={`flex items-center hover:border-r hover:border-[#414954] ${header.column.getCanFilter() ? 'w-[100%]' : 'w-[100%]'}`}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <span className='w-[70%]'>     {flexRender(header.column.columnDef.header, header.getContext())}</span>
                              <span className="pt-1 w-[30%] flex justify-end ">
                                {{
                                  asc: <FaSortUp className="h-4 w-4 font-bold text-red-500" />,
                                  desc: <FaSortDown className="h-4 w-4 font-bold text-red-500" />,
                                }[header.column.getIsSorted() as string] ?? null}
                              </span>
                            </span>
                          </div>

                          {header.column.getCanResize() && (
                            <div
                              onDoubleClick={() => header.column.resetSize()}
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''
                                }`}
                            ></div>
                          )}
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map(row => {
                  const isSelected = highlightedRows.includes(row.index);
                  const isCursor = keyNavigation === row.index && !isLoading;
                  const ageHours = (d: any) => (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60);
                  return (
                    <tr
                      key={row.index}
                      id={`row-${row.index}`}
                      className={[
                        "font-medium h-7",
                        // ✅ age-based row background (only if not selected/cursor)
                        !isSelected && !isCursor
                          ? ageHours((row.original as any).lastupdatedDate) > 24
                            ? "bg-gray-500 text-white"              // 24h+ grey
                            : ageHours((row.original as any).lastupdatedDate) > nonActiveInstance
                              ? "bg-[#f7545485] text-white"               // 2h+ red
                              : "odd:bg-[#24303f] even:bg-[#2d3d52] text-white" // normal
                          : "",

                        // ✅ selected overrides everything
                        isSelected ? "bg-[#e0cfb0] text-black" : "",

                        // ✅ cursor but not selected
                        isCursor && !isSelected
                          ? "!bg-[#e0cfb0] !text-black outline outline-1 outline-[#e0cfb0]"
                          : "",
                      ].join(" ")}
                      onClick={(e) => {
                        const isRemoving = e.ctrlKey && highlightedRows.includes(row.index);
                        handleRowClick(e, row.index); setSelected(row.original as any)
                        if (isRemoving) {
                          const next = highlightedRows.filter((x) => x !== row.index).at(-1);
                          setActiveCursor(next ?? -1);
                        } else {
                          setActiveCursor(row.index);
                        }
                      }}
                    >
                      {row.getVisibleCells().map(cell => {
                        return (
                          <td key={cell.id} style={{ width: cell.column.getSize() }} className='px-1'>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}

                {tableData?.length === 0 && !isFetched && (
                  <tr>
                    <td colSpan={ColumnInstance.length} className="px-4 py-10 text-center text-slate-500">
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Right Panel */}
        <div className={`rounded-2xl border-4 bg-[#24303f] overflow-auto ${borderColor}`}>
          <div className={`flex items-center justify-between border-b px-4 py-3 sticky top-0 bg-[#24303f] ${borderColor}`}>
            <div className={`font-semibold ${statusColor}`}>{selected?.instanceName ?? "Select an instance"}</div>
            {selected && (
              <button
                onClick={() => setSelected(null)}
              >
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
              <Section title="Instance Info" color={statusColor}>
                <InfoRow k="IP" v={safe(selected.ip)} />
                <InfoRow k="Drive" v={safe(selected.driveNB)} />
                <InfoRow k="TID" v={safe(selected.tlID)} />
                <InfoRow k="Last Updated" v={new Date(selected.lastupdatedDate).toLocaleString()} />
              </Section>

              <Section title="File Info" color={statusColor}>
                <InfoRow k="File Name" v={safe(selected.startedDumpingObjectName)} />
                <InfoRow k="File Size" v={selected.startedDumpingObjectSize ? bytesToGB(selected.startedDumpingObjectSize)+" GB" : "-"} />
                <InfoRow k="Prev Obj Throughput" v={safe(selected.previousObjectThroughput)} />
              </Section>

              <Section title="Current Tape" color={statusColor}>
                <InfoRow k="Tape" v={safe(selected.currentTape)} />
                <InfoRow k="Started" v={safe(selected.startTimeCurrentTape)} />
                <InfoRow k="Transferred" v={bytesToGB(selected.sizeTransferCurrentTape)+" GB"} />
                <InfoRow k="Duration" v={msToHuman(selected.durationCurrentTapeMS)} />
                <InfoRow k="Throughput" v={`${safe(selected.currentTapeThroughput)} MB/s`} />
              </Section>

              <Section title="Previous Tape" color={statusColor}>
                <InfoRow k="Tape" v={safe(selected.previousTape)} />
                <InfoRow k="Started" v={safe(selected.startTimePreviousTape)} />
                <InfoRow k="Transferred" v={bytesToGB(selected.sizeTransferPreviousTape)+" GB"} />
                <InfoRow k="Duration" v={msToHuman(selected.durationPreviousTapeMS)} />
                <InfoRow k="Throughput" v={`${safe(selected.previousTapeThroughput)} MB/s`} />
              </Section>


            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- small UI components ----------
function KpiCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl border bg-[#24303f] p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-white">{title}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      {subtitle ? <div className="mt-1 text-xs text-white">{subtitle}</div> : null}
    </div>
  );
}

function Section({ title, children, color }: { title: string; children: React.ReactNode, color: string; }) {
  return (
    <div className="rounded-xl border p-3 bg-[#18212d] shadow-lg">
      <div className={`mb-2 text-sm underline font-semibold uppercase tracking-wide ${color}`}>{title}</div>
      <div className="space-y-1 text-xs">{children}</div>
    </div>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <div className="text-white">{k}</div>
      <div className="max-w-[220px] break-words text-right font-medium text-white">{v}</div>
    </div>
  );
}