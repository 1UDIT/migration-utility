import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { fetchData } from "@/Pages/Object_Details/HandleApiCall/Apicall";
import "react-contexify/dist/ReactContexify.css";
import {
  useContextMenu
} from "react-contexify";
import useKeyNavigationx from "@/hooks/useKeyNavigation";
import { useSelectionRow } from "@/hooks/useSelectionRow.tsx";
import type { RootState } from "@/Redux/Store";
import ContextRight from "@/Pages/Object_Details/ContextRight/Index";
const MTContextRight = lazy(() => import('@/Pages/MassTech/ContextRight/Index'));
import { MdClose } from "react-icons/md";
import { byteToKb } from "@/components/Column/FetchColumnDetail";
import { FaSortDown, FaSortUp } from 'react-icons/fa';

type User = {
  UUID: string;
  mediaType: string;
  totalObjectCount?: number;
};

type StatusSummaryItem = {
  label: string;
  value: string;
  count: number;
};

type TapeDetailsRow = {
  objectName?: string;
  displayName?: string;
  category?: string;
  mediaType?: string;
  mediaName?: string;
  barcode?: string;
  tapeBarcode?: string;
  sizeKB?: number;
  fileName?: string;
  status?: string;
  remarks?: string;
};

type TapeDetailsResponse = {
  data: TapeDetailsRow[];
  selectedStatus?: string;
  selectedCount?: number;
  statusSummary?: StatusSummaryItem[];
};

type IndexPopupProps = {
  data: User;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  openDialog: boolean;
};

interface TDatas {
  id: number;
  acs: number;
  status: string; // Correct the spelling if needed
  barcode: string;
}

type ObjectItem = {
  objectName: string;
  category: string;
  mediaName: string;
  sizeKB: number;
  fileName: string;
  status: string;
  remarks: string;
  barcode: string;
  id: number;
  acs: number;
};


const normalizeData = (rows: any[], mediaType: string) => {

  if (mediaType.startsWith("MT-LTO")) {
    return rows.map((r) => ({
      objectName: r.displayName || r.AO_OBJECT_NAME,
      category: r.collectionName || r.AO_CATEGORY,
      mediaName: r.mediaName || r.TA_BARCODE,
      sizeKB: r.instanceSizeBytes || r.SIZE || 0,
      fileName: r.fileName || r.FILE_NAME,
      status: r.status || r.STATUS,
      remarks: r.remarks || r.REMARKS,
      barcode: r.tapeBarcode || r.TA_BARCODE,
      id: r.id,
      acs: r.acs,
    }));
  }

  return rows.map((r) => ({
    objectName: r.objectName,
    category: r.category,
    mediaName: r.mediaName || r.barcode,
    sizeKB: r.sizeKB || 0,
    fileName: r.fileName,
    status: r.status,
    remarks: r.remarks,
    barcode: r.barcode,
    id: r.id,
    acs: r.acs,
  }));
};

const MENU_ID = "tape-details-menu";

export default function IndexPopup({ data, setOpenDialog, openDialog }: IndexPopupProps) {
  const ipAddress = useSelector((state: any) => state.tableDownClick.ipAddressStore);
  const [selectedStatus, setSelectedStatus] = useState("MIGRATION_FAILED");
  const [highlightedRows, SetMultipleRowsSelection] = useState<any[]>([]);
  const reshedularSelection = useSelector((state: RootState) => state.tableDownClick.reshedularSelection)
  const [sorting, setSorting] = useState<SortingState>([{id: "remarks", desc: true}]);
  const columns = useMemo<ColumnDef<ObjectItem>[]>(() => [
    {
      accessorKey: "objectName",
      header: "Object Name",
      cell: ({ row }) => (
        <span title={row.original.objectName || "-"}>
          {row.original.objectName || "-"}
        </span>
      ),
      size: 250,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span title={row.original.category || "-"}>
          {row.original.category || "-"}
        </span>
      ),
    },
    {
      accessorKey: "sizeKB",
      header: "size (KB)",
      cell: ({ row }) => {
        const rowsizeKB = row.original.sizeKB;
        if (data?.mediaType.startsWith("LTO")) {
          return (<span className="font-medium">{rowsizeKB || "-"}</span>);
        } else {
          return (<span className="font-medium">{byteToKb(rowsizeKB) || "-"}</span>);
        }
      },
      size: 70,
    },
    {
      accessorKey: "fileName",
      header: "File Name",
      cell: ({ row }) => (
        <span title={row.original.fileName}>
          {row.original.fileName || "-"}
        </span>
      ),
    },
    {
      accessorKey: "remarks",
      header: "remarks",
      cell: ({ row }) => (
        <span title={row.original.remarks}>
          {row.original.remarks || "-"}
        </span>
      ),
      size: 250,
    },
  ], []);


  useEffect(() => {
    setSelectedStatus("MIGRATION_FAILED");
  }, [data?.UUID, data?.mediaType]);

  const body = useMemo(
    () => ({
      filters: {
        uuid: data.UUID,
        mediaType: data.mediaType,
        status: selectedStatus,
      },
      sorting,
    }),
    [data.UUID, data.mediaType, selectedStatus, sorting]
  );

  const { show } = useContextMenu({ id: MENU_ID });



  const { data: listDetails, isLoading, isFetching, refetch } = useQuery<TapeDetailsResponse>({
    queryKey: ["tapeDetails", body],
    queryFn: async ({ signal }) => {
      const endpoint = `http://${ipAddress}:4000/uuids/tapeDetails`;
      return fetchData(endpoint, "POST", body, signal);
    },
    enabled: !!data?.UUID && !!data?.mediaType,
    retry: false,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  const normalizedRows = useMemo(
    () => normalizeData(listDetails?.data || [], data.mediaType),
    [listDetails, data.mediaType]
  );

  const summary = useMemo(() => listDetails?.statusSummary || [], [listDetails]);
  const table = useReactTable({
    data: normalizedRows || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualSorting: true,
  });

  const getCardClass = (item: StatusSummaryItem, isActive: boolean) => {
    const hasCount = Number(item.count || 0) > 0;
    if (item.value === "DECODE_FAILED") {
      return hasCount
        ? "border-red-500 bg-red-500/10"
        : "border-red-500/40 bg-[#111827]";
    }
    if (item.value === "PENDING") {
      return hasCount
        ? "border-blue-500 bg-blue-500/10"
        : "border-blue-500/40 bg-[#111827]";
    }

    if (item.value === "MIGRATION_FAILED") {
      return hasCount
        ? "border-yellow-500 bg-yellow-500/10"
        : "border-yellow-500/40 bg-[#111827]";
    }

    return isActive
      ? "border-blue-500 bg-blue-500/10"
      : "border-gray-700 bg-[#111827]";
  };

  const [previousSelection, setPreviousSelection] = useState<number | null>(null);
  const [keyNavigation, setActiveCursor] = useKeyNavigationx(
    listDetails?.data,
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


  const handleRowClick = (event: React.MouseEvent, id: number) => {
    useSelectionRow(event, id, SetMultipleRowsSelection, previousSelection, setPreviousSelection, isLoading);
  };


  const getSelectedRowData = (e: React.MouseEvent, rows: any, activeRow: any) => {
    // console.log(highlightedRows, "highlightedRows");
    const isHighlighted = highlightedRows.includes(activeRow);//Highlight multiple rows  
    if (isHighlighted === false) {
      setActiveCursor(activeRow);
      handleRowClick(e, activeRow);
    }
  };

  const getCountClass = (item: StatusSummaryItem) => {
    const hasCount = Number(item.count || 0) > 0;

    if (!hasCount) return "text-gray-400";
    if (item.value === "MIGRATION_FAILED") return "text-red-500";
    if (item.value === "DECODE_FAILED") return "text-yellow-400";
    return "text-white";
  };


  const Rescheduled = useMemo(() => {
    return highlightedRows.map((index: any) => {
      const row = table.getRowModel().rows[index]?.original as ObjectItem;
      console.log(row, "row");
      return {
        id: row?.id,
        acs: row?.acs,
        status: row?.status,
        barcode: row?.barcode,
      };
    });
  }, [highlightedRows, table]);


  return (
    <>
      <DialogContent className="max-w-7xl bg-[#18202b] text-white"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={() => setOpenDialog(false)}
        onClick={() => {
          setOpenDialog(true)
          setTimeout(() => (document.body.style.pointerEvents = ""), 0)
        }}
      >
        <DialogClose asChild={true}>
          <MdClose className="flex flex-row justify-self-end" onClick={(e) => { e.stopPropagation(); setOpenDialog(false) }} />
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-white">Tape Details</DialogTitle>

          <DialogDescription asChild>
            <div className="space-y-5 z-30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-700 bg-[#111827] p-4">
                  <div className="text-sm text-gray-400">UUID</div>
                  <div className="mt-1 break-all font-medium text-white">{data.UUID}</div>
                </div>

                <div className="rounded-lg border border-gray-700 bg-[#111827] p-4">
                  <div className="text-sm text-gray-400">Media Type</div>
                  <div className="mt-1 font-medium text-white">{data.mediaType}</div>
                </div>

                <div className="rounded-lg border border-gray-700 bg-[#111827] p-4">
                  <div className="text-sm text-gray-400">Total Object Count</div>
                  <div className="mt-1 text-2xl font-bold text-white">{data?.totalObjectCount}</div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-300">Status Summary</div>
                  {isFetching && <div className="text-xs text-gray-400">Updating...</div>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summary.map((item) => {
                    const isActive = item.value === selectedStatus;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSelectedStatus(item.value)}
                        className={`rounded-xl border p-4 text-left transition-colors ${getCardClass(item, isActive)}`}
                      >
                        <div className="text-xs text-gray-300">{item.label}</div>
                        <div className={`mt-2 text-lg font-bold ${getCountClass(item)}`}>
                          {item.count}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-lg border border-gray-700 overflow-x-auto h-[15rem]">
                  <table className="w-full text-sm">
                    <thead className="th select-none text-white sticky top-0 bg-[#2d3d52] z-50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr>
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
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                            Loading...
                          </td>
                        </tr>
                      ) : table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => {
                          const isSelected = highlightedRows.includes(row.index);
                          const isCursor = keyNavigation === row.index && !isLoading;

                          return (
                            <tr
                              key={row.index}
                              id={`row-${row.index}`}
                              className={[
                                "font-medium h-7",
                                isSelected
                                  ? "bg-[#e0cfb0] text-black"
                                  : "odd:bg-[#24303f] even:bg-[#2d3d52] text-white",
                                isCursor && !isSelected
                                  ? "!bg-[#e0cfb0] !text-black outline outline-1 outline-[#e0cfb0]"
                                  : "",
                              ].join(" ")}
                              onClick={(e) => {
                                const isRemoving = e.ctrlKey && highlightedRows.includes(row.index);
                                handleRowClick(e, row.index);

                                if (isRemoving) {
                                  const next = highlightedRows.filter((x) => x !== row.index).at(-1);
                                  setActiveCursor(next ?? -1);
                                } else {
                                  setActiveCursor(row.index);
                                }
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                getSelectedRowData(e, table.getRowModel().rows, row.index);
                                setActiveCursor(row.index);

                                show({
                                  event: e,
                                });
                              }}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} style={{ width: cell.column.getSize() }} className="px-1">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
      {data.mediaType.startsWith("LTO") && highlightedRows.length <= reshedularSelection ? (
        <ContextRight
          MENU_ID={MENU_ID}
          Rescheduled={Rescheduled}
          refetch={refetch}
          SetMultipleRowsSelection={SetMultipleRowsSelection}
        />
      ) : null
      }
      {data.mediaType.startsWith("MT") && highlightedRows.length <= reshedularSelection ? (
        <Suspense>
          <MTContextRight
            MENU_ID={MENU_ID}
            Rescheduled={Rescheduled}
            refetch={refetch}
            SetMultipleRowsSelection={SetMultipleRowsSelection}
          /></Suspense>) : null
      }

    </>
  );
}