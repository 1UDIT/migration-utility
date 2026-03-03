import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    type PaginationState,
} from '@tanstack/react-table';
import React, { Fragment, lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchData } from '../Object_Details/HandleApiCall/Apicall';
import useWindowSize from '@/hooks/usescreen';
import { FiFilter } from "react-icons/fi";
import { MdOutlineFilterAltOff } from "react-icons/md";
const ColumnFilterDropdown = lazy(() => import("@/components/ColumnFilter/ColumnFilterDropdown"));
import ContextRight from './ContextRight/Index';
import "react-contexify/dist/ReactContexify.css";
import Index from '@/components/Pagination/Index';
import { useDispatch, useSelector } from 'react-redux';
import { setPaginationStore } from '@/Redux/tableDropFilter';
import { endOfYesterday, format, subDays } from 'date-fns';
import FetchColumnDetail from '@/components/Column/FetchColumnDetail';
import { useDebouncedValue } from '@/hooks/debounced';
import { toast } from "sonner"
import type { RootState } from '@/Redux/Store';
import {
    useContextMenu
} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { useSelectionRow } from '@/hooks/useSelectionRow.tsx';
import useKeyNavigationx from '@/hooks/useKeyNavigation';

interface DateInterface {
    from: Date; // Assuming the dates are in string format
    to: Date;
}

const dateStart = endOfYesterday();
const initialDateRange: DateInterface = {
    from: dateStart,
    to: new Date(),
};

interface TDatas {
    id: number;
    acs: number;
    status: string; // Correct the spelling if needed
    tapeBarcode: string;
}
const MENU_ID = "menu-id";

const Tabledata = () => {
    const [dropdownOpen, setDropdownOpen] = useState([]);
    const [openSearch, setSearchTag] = useState<any[]>([]);
    const { width } = useWindowSize();
    const reshedularSelection = useSelector((state: RootState) => state.tableDownClick.reshedularSelection)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 50,
    });
    const dispatch = useDispatch();
    const { ColumnMasstech_column } = FetchColumnDetail();
    const [storeFilterId, setStoreFilterId] = useState<string[]>([]); // State to track selected filter IDs
    const ipAddress = useSelector((state: any) => state.tableDownClick.ipAddressStore);
    const [draftFilter, setDraftFilter] = useState<any>({
        lastUpdatedDate: {
            from: format(initialDateRange.from, "yyyy-MM-dd"),
            to: format(initialDateRange.to, "yyyy-MM-dd"),
        },
    });
    const [Filter, setFilter] = useState<any>(draftFilter);
    const [isCustomDateSelected, setIsCustomDateSelected] = useState(false);
    const { debounced: debouncedDraftFilter, isPending } = useDebouncedValue(draftFilter, 2000);
    const [isFirstLoad, setIsFirstLoad] = useState(true); // ✅ new
    const toastIdRef = useRef<string | number | null>(null);
    const prevPendingRef = useRef(false);
    const [pageCursors, setPageCursors] = useState<(number | null)[]>([null]);
    const currentCursor = pageCursors[pagination.pageIndex] ?? null;
    const [highlightedRows, SetMultipleRowsSelection] = useState<any[]>([]);



    const { show } = useContextMenu({
        id: MENU_ID
    });

    function displayMenu(e: React.MouseEvent<HTMLTableRowElement>) {
        show({
            event: e,
        });
    };

    useEffect(() => {
        setFilter(debouncedDraftFilter);
        setPagination((p) => ({ ...p, pageIndex: 0 }));
        setPageCursors([null]); // ✅ reset cursor chain
    }, [debouncedDraftFilter]);

    useEffect(() => {
        setPageCursors([null]);
        setPagination((p) => ({ ...p, pageIndex: 0 }));
    }, [pagination.pageSize]);



    const datePayload = useMemo(() => {
        // 1) User picked a date -> send it
        if (
            isCustomDateSelected &&
            Filter?.lastUpdatedDate?.from &&
            Filter?.lastUpdatedDate?.to
        ) {
            return {
                lastUpdatedDate: {
                    from: Filter.lastUpdatedDate.from,
                    to: Filter.lastUpdatedDate.to,
                }
            };
        }
        // 2) Not user-selected:
        //    - On the VERY FIRST LOAD (no other filters) -> last 24h
        if (isFirstLoad && Object.keys(debouncedDraftFilter).length === 1) {
            return {
                lastUpdatedDate: {
                    from: format(endOfYesterday(), "yyyy-MM-dd"),
                    to: format(new Date(), "yyyy-MM-dd"),
                }
            };
        }

        // 3) No custom date -> always last 24h
        return {
            lastUpdatedDate: {
                from: "",
                to: "",
            }
        };
    }, [isCustomDateSelected, Filter?.lastUpdatedDate?.from, Filter?.lastUpdatedDate?.to, isFirstLoad, debouncedDraftFilter]);

    // console.log(datePayload, "dataPLayload")
    const body = useMemo(() => {
        // take all filters except lastUpdatedDate
        const { lastUpdatedDate, ...rest } = (Filter ?? {});
        return {
            filters: {
                ...rest,
                ...datePayload, // lastUpdatedDate/endDate injected here
            },

        };
    }, [Filter, datePayload, isFirstLoad]);

    useEffect(() => {
        function updateDateAtMidnight() {
            const newFrom = endOfYesterday();
            const newTo = new Date();

            setDraftFilter((prev: any) => {
                // only auto-update if user did NOT choose custom date (optional rule)
                // if you want always update, remove this if-block
                const isDefault24h =
                    prev?.lastUpdatedDate?.from === format(initialDateRange.from, "yyyy-MM-dd") &&
                    prev?.lastUpdatedDate?.to === format(initialDateRange.to, "yyyy-MM-dd");

                if (!isDefault24h) return prev;

                return {
                    ...prev,
                    lastUpdatedDate: {
                        from: format(newFrom, "yyyy-MM-dd"),
                        to: format(newTo, "yyyy-MM-dd"),
                    },
                };
            });

            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0);
            setTimeout(updateDateAtMidnight, tomorrow.getTime() - now.getTime());
        }

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setHours(24, 0, 0, 0);
        const timer = setTimeout(updateDateAtMidnight, tomorrow.getTime() - now.getTime());

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isFirstLoad) {
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;
            }
            prevPendingRef.current = isPending;
            return;
        }

        // Show loading toast when pending starts
        if (isPending) {
            if (!toastIdRef.current) {
                toastIdRef.current = toast.loading("Applying filter…");
            }
        } else {
            // Only show success if we were pending just before
            if (prevPendingRef.current) {
                if (toastIdRef.current) {
                    toast.dismiss(toastIdRef.current);
                    toastIdRef.current = null;
                }
                toast.success("Filter applied");
            } else {
                // not coming from pending -> just cleanup if needed
                if (toastIdRef.current) {
                    toast.dismiss(toastIdRef.current);
                    toastIdRef.current = null;
                }
            }
        }
        prevPendingRef.current = isPending;


    }, [isPending, isFirstLoad]);


    const { data, isLoading, refetch } = useQuery({
        queryKey: ["uuidData", pagination.pageIndex, pagination.pageSize, body, currentCursor],
        queryFn: async ({ signal }) => {
            const endpoint =
                `http://${ipAddress}:4000/Masstech?limit=${pagination.pageSize}` +
                (currentCursor ? `&cursor=${currentCursor}` : "");

            const resp = await fetchData(endpoint, "POST", body, signal);

            // ✅ store nextCursor for NEXT page (but do not change currentCursor)
            setPageCursors((prev) => {
                const copy = [...prev];
                copy[pagination.pageIndex + 1] = resp?.nextCursor ?? null;
                return copy;
            });

            return resp; // { data, nextCursor, hasMore }
        },
        retry: false,
    });

    useEffect(() => {
        if (!isLoading) { 
            SetMultipleRowsSelection([0])
        }
    }, [isLoading]);


    const tableData = useMemo(() =>
        (isLoading === true ? Array(10).fill({}) : data?.data),
        [isLoading, data]
    );

    const tableColumns = useMemo(
        () =>
            isLoading === true
                ? ColumnMasstech_column.map((column) => ({
                    ...column,
                    cell: () => (
                        <div className="flex flex-col space-y-3">
                            <Skeleton className="h-[20px] w-full rounded-xl mt-1" />
                        </div>
                    )
                }))
                : ColumnMasstech_column,
        [isLoading, ColumnMasstech_column]
    );
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
    const totalQuery = useQuery({
        queryKey: ["uuidTotal", body],
        queryFn: ({ signal }) =>
            fetchData(`http://${ipAddress}:4000/Masstech/total`, "POST", body, signal),
        networkMode: "always",
        retry: false,
        enabled: !!data,   // 👈 only after list loads
        refetchOnWindowFocus: false, // optional, avoid spam
    });

    const handleRowClick = (event: React.MouseEvent, id: number) => {
        useSelectionRow(event, id, SetMultipleRowsSelection, previousSelection, setPreviousSelection, isLoading);
    };

    const table = useReactTable({
        data: tableData || [],
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        onPaginationChange: setPagination,
        state: {
            pagination,
        },
        pageCount: Math.ceil(totalQuery?.data?.total / pagination.pageSize),
        manualSorting: false,
    });


    function clearFilter(idHeader: string) {
        setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
        setIsFirstLoad(true);
        table.getColumn(idHeader)?.setFilterValue(undefined);

        setDraftFilter((prev: any) => {
            const updated = { ...prev };
            delete updated[idHeader];

            const hasAnyOtherFilter = Object.keys(updated).some(
                (k) => k !== "lastUpdatedDate"
            );

            // If nothing else is filtered, show default 24h (only if you want UI to show it)
            if (!hasAnyOtherFilter && !isCustomDateSelected) {
                updated.lastUpdatedDate = {
                    from: format(initialDateRange.from, "yyyy-MM-dd"),
                    to: format(initialDateRange.to, "yyyy-MM-dd"),
                };
            }

            if (idHeader === "lastUpdatedDate") {
                updated.lastUpdatedDate = { from: "", to: "" };
            }

            return updated;
        });

        setSearchTag((old) => old.filter((d: any) => d !== idHeader));
        setStoreFilterId((old) => old.filter((d: any) => d !== idHeader));
    }

    const getSelectedRowData = (e: React.MouseEvent, rows: any, activeRow: any) => {
        // console.log(highlightedRows, "highlightedRows");
        const isHighlighted = highlightedRows.includes(activeRow);//Highlight multiple rows  
        if (isHighlighted === false) {
            setActiveCursor(activeRow);
            handleRowClick(e, activeRow);
        }
    };


    function handleInputChange(value: any, idHeader: string, column: any, rawValue?: string) {

        setPagination({ pageIndex: 0, pageSize: pagination.pageSize });

        // ✅ IMPORTANT: keep column filter as STRING for text input
        if (typeof rawValue === "string") {
            column.setFilterValue(rawValue);
        } else {
            column.setFilterValue(value);
        }

        // setIsFirstLoad(false);

        setDraftFilter((prev: any) => {
            const next = { ...prev, [idHeader]: value };

            if (!isCustomDateSelected && idHeader !== "lastUpdatedDate") {
                next.lastUpdatedDate = { from: "", to: "" };
            }

            if (idHeader === "lastUpdatedDate") {
                next.lastUpdatedDate = value;
            }

            return next;
        });

        setStoreFilterId((prev) => (prev.includes(idHeader) ? prev : [...prev, idHeader]));
    }


    const openSearchBtn = (Value: any, header: any) => {
        const add: any = { value: Value };
        const check: any = Value;

        setDropdownOpen((prev: any) => {
            if (prev.some((val: any) => (val.value === Value))) return prev;
            else {
                return [...prev, add];
            }
        });

        setSearchTag((prev: any) => {
            if (prev.some((val: any) => (val === Value))) return prev;
            else {
                return [...prev, check];
            }
        });
    };

    function closeDropMenu(idHeader: string) {
        setDropdownOpen((old) => old.filter((d: any) => d.value !== idHeader));
        setSearchTag((old) => old.filter((d: any) => d !== idHeader));
    };

    const Rescheduled = useMemo(() => {
        return highlightedRows.map((index: any) => {
            const row = table.getRowModel().rows[index]?.original as TDatas;
            return {
                id: row?.id,
                acs: row?.acs,
                status: row?.status,
                barcode: row?.tapeBarcode,
            };
        });
    }, [highlightedRows, table]); 


    return (
        <>
            <div
                className="h-[93%] 2xl:w-[100%] lg:w-full overflow-auto"
                style={{ direction: table.options.columnResizeDirection }}
            >
                <table className={"w-full "} style={{ width: table.getTotalSize() < width ? "100%" : table.getTotalSize(), }}>
                    <thead className={`th select-none text-white sticky top-0 bg-[#2d3d52]  z-50 `}>
                        {table.getHeaderGroups().map(headerGroup => (
                            <Fragment key={headerGroup.id}>
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
                                                        <span className='tableHeaderSize wrapword text-left  flex justify-between w-full'>
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                            {/* {{
                                                                asc: <FaSortUp className="h-4 w-4 font-bold text-red-500" />,
                                                                desc: <FaSortDown className="h-4 w-4 font-bold text-red-500" />,
                                                            }[header.column.getIsSorted() as string] ?? null} */}
                                                        </span>
                                                    </span>
                                                    <div className="flex justify-end items-center">
                                                        {header.column.getCanFilter() &&
                                                            (openSearch.includes(header.id) ? (
                                                                <MdOutlineFilterAltOff
                                                                    className={` pt-1 h-[25px] w-[25px] ${storeFilterId.includes(header.id) ? "text-red-500" : "text-white"}`}
                                                                    onClick={() => {
                                                                        closeDropMenu(header.id);
                                                                    }}
                                                                />
                                                            ) : (
                                                                <FiFilter
                                                                    className={` pt-1 h-[25px] w-[25px] ${storeFilterId.includes(header.id) ? "text-red-500" : "text-white"}`}
                                                                    onClick={() => {
                                                                        openSearchBtn(header.id, header);
                                                                    }}
                                                                />
                                                            ))}
                                                    </div>
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
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => {
                                        return (
                                            <th
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={{ position: 'relative', width: header.getSize() }}
                                            >
                                                {dropdownOpen?.map((val: any) => {
                                                    if (val.value === header.id)
                                                        return (
                                                            <Fragment key={val.value}>
                                                                <Suspense fallback={""} >
                                                                    <ColumnFilterDropdown
                                                                        header={header}
                                                                        handleInputChange={handleInputChange}
                                                                        Filter={Filter}
                                                                        isOpen={openSearch.includes(header.id)}
                                                                        onClear={clearFilter}
                                                                        setIsCustomDateSelected={setIsCustomDateSelected}
                                                                        setIsFirstLoad={setIsFirstLoad}
                                                                    /> </Suspense>
                                                            </Fragment>
                                                        )
                                                })}

                                            </th>
                                        )
                                    })}
                                </tr>
                            </Fragment>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => {
                            const isSelected = highlightedRows.includes(row.index);
                            const isCursor = keyNavigation === row.index && !isLoading;
                            // console.log(highlightedRows ,"highlightedRows.includes(row.index)",row.index,"isSelected",isSelected)
                            return (
                                <tr
                                    key={row.index}
                                    id={`row-${row.index}`}
                                    className={[
                                        "font-medium h-7 select-none",
                                        isSelected ? "bg-[#e0cfb0] text-black" : "odd:bg-[#24303f] even:bg-[#2d3d52] text-white",
                                        isCursor && !isSelected ? "!bg-[#e0cfb0] !text-black outline outline-1 outline-[#e0cfb0]" : "", // cursor but not selected
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
                                        displayMenu(e);
                                        getSelectedRowData(e, table.getRowModel().rows, row.index);
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
                    </tbody>
                </table>
            </div>
            <Index table={table} data={data} initialDateRange={datePayload?.lastUpdatedDate} totalPage={totalQuery?.data?.total} />
            {highlightedRows.length <= reshedularSelection ?
                <ContextRight MENU_ID={MENU_ID} Rescheduled={Rescheduled} refetch={refetch} setRescheduled={Rescheduled}
                    setActiveCursor={setActiveCursor} SetMultipleRowsSelection={SetMultipleRowsSelection} displayMenu={displayMenu}
                /> : null
            }
        </>
    )
}

export default React.memo(Tabledata)