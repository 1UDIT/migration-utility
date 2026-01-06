import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    type PaginationState,
    type SortingState,
} from '@tanstack/react-table';
import React, { Fragment, lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FaSortUp, FaSortDown } from "react-icons/fa6";
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../Object_Details/HandleApiCall/Apicall';
import useWindowSize from '@/hooks/usescreen';
import { FiFilter } from "react-icons/fi";
import { MdOutlineFilterAltOff } from "react-icons/md";
import Index from '@/components/Pagination/Index';
import { endOfYesterday, format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setPaginationStore } from '@/Redux/tableDropFilter';
import FetchColumnDetail from '@/components/Column/FetchColumnDetail';
import type { RootState } from '@/Redux/Store';
const ColumnFilterDropdown = lazy(() => import("@/components/ColumnFilter/ColumnFilterDropdown"));
import ContextRight from './ContextRight/Index';
import useKeyNavigationx from '@/hooks/useKeyNavigation';
import { useSelectionRow } from '@/hooks/useSelectionRow.tsx';
import "react-contexify/dist/ReactContexify.css";
import {
    useContextMenu
} from "react-contexify";

import Pagination from '@/components/Pagination/Index';

const MENU_ID = "menu-id";
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
    id:number;
    acs: number;
    status: string; // Correct the spelling if needed
    barcode: string;
}



const Tabledata = () => {
    const [Filter, setFilter] = useState<any>({ lastUpdateDate: { from: format(initialDateRange.from, 'yyyy-MM-dd'), to: format(initialDateRange.to, 'yyyy-MM-dd') } });
    const [dropdownOpen, setDropdownOpen] = useState([]);
    const [openSearch, setSearchTag] = useState<any[]>([]);
    const { width } = useWindowSize();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 50,
    });
    const { ColumnObject } = FetchColumnDetail();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [storeFilterId, setStoreFilterId] = useState<string[]>([]); // State to track selected filter IDs
    const body = {
        "filters": Filter,
        "sorting": sorting
    };
    const dispatch = useDispatch();
    const ipAddress = useSelector((state: RootState) => state.tableDownClick.ipAddressStore);
    // const [Rescheduled, setRescheduled] = useState<any>([]);
    const [highlightedRows, SetMultipleRowsSelection] = useState<any[]>([]);
    const parentRef = useRef<HTMLDivElement>(null);
    const reshedularSelection = useSelector((state:RootState)=>state.tableDownClick.reshedularSelection)

    const { show } = useContextMenu({
        id: MENU_ID
    });
    function displayMenu(e: React.MouseEvent<HTMLTableRowElement>) {
        // put whatever custom logic you need
        // you can even decide to not display the Menu
        show({
            event: e,
        });
    }

    // inside Tabledata component
    useEffect(() => {
        function updateDateAtMidnight() {
            const newFrom = endOfYesterday();
            const newTo = new Date();
            setFilter(
                { lastUpdateDate: { from: newFrom, to: newTo } });

            // Schedule the next run for the following midnight
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0);
            const msUntilMidnight = tomorrow.getTime() - now.getTime();

            setTimeout(updateDateAtMidnight, msUntilMidnight);
        }

        // Schedule first midnight update
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setHours(24, 0, 0, 0);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        // console.log("Midnight update scheduled in", msUntilMidnight, "milliseconds");
        // Schedule the first run
        const timer = setTimeout(updateDateAtMidnight, msUntilMidnight);

        return () => clearTimeout(timer);
    }, []);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['uuidData', pagination, body, sorting],
        queryFn: async ({ signal }) => {
            dispatch(
                setPaginationStore({
                    filters: Filter,
                })
            );
            const endpoint = `http://${ipAddress}:4004/objects?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`;
            return fetchData(endpoint, "POST", body, signal);
        },
        networkMode: 'always',
        retry: false,
        refetchInterval: 10000
    });



    const totalQuery = useQuery({
        queryKey: ["uuidTotal", Filter],
        queryFn: ({ signal }) =>
            fetchData(`http://${ipAddress}:4004/objects/total`, "POST", body, signal),
        networkMode: "always",
        retry: false,
        refetchOnWindowFocus: false, // optional, avoid spam
    });

    const tableData = useMemo(() =>
        (isLoading === true ? Array(10).fill({}) : data?.data),
        [isLoading, data]
    );

    const tableColumns = useMemo(
        () =>
            isLoading === true
                ? ColumnObject.map((column) => ({
                    ...column,
                    cell: () => (
                        <div className="flex flex-col space-y-3">
                            <Skeleton className="h-[20px] w-full rounded-xl mt-1" />
                        </div>
                    )
                }))
                : ColumnObject,
        [isLoading, ColumnObject]
    );

    const table = useReactTable({
        data: tableData || [],
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
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
        pageCount: Math.ceil(totalQuery?.data?.total / pagination.pageSize)
    });

    const [previousSelection, setPreviousSelection] = useState<number | null>(null);
    // const [keyNavigation, setActiveCursor] = useKeyNavigationx(tableData, setPreviousSelection, SetMultipleRowsSelection, (index, opts) => rowVirtualizer.scrollToIndex(index, opts));
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


    const handleRowClick = (event: React.MouseEvent, id: number) => {
        useSelectionRow(event, id, SetMultipleRowsSelection, previousSelection, setPreviousSelection);
    };

    const getSelectedRowData = (e: React.MouseEvent, rows: any, activeRow: any) => {
        // console.log(highlightedRows, "highlightedRows");
        const isHighlighted = highlightedRows.includes(activeRow);//Highlight multiple rows  
        if (isHighlighted === false) {
            setActiveCursor(activeRow);
            handleRowClick(e, activeRow);
        }
    };

    function clearFilter(idHeader: string) {
        setPagination({
            pageIndex: 0,
            pageSize: pagination.pageSize,
        });
        setFilter({
            lastUpdateDate: {
                from: format(initialDateRange.from, 'yyyy-MM-dd'), to: format(initialDateRange.to, 'yyyy-MM-dd')
            }
        })
        setSearchTag((old) => old.filter((d: any) => d !== idHeader));
        setStoreFilterId((old) => old.filter((d: any) => d !== idHeader));

    };


    function handleInputChange(value: any, idHeader: string, column: any) {
        setPagination({
            pageIndex: 0,
            pageSize: pagination.pageSize,
        });
        column.setFilterValue(value);
        setFilter((prev: any) => ({
            ...prev,
            lastUpdateDate: {
                from: '',
                to: ''
            },
            [idHeader]: value
        }));
        setStoreFilterId((prev) => {
            if (prev.some((val) => (val === idHeader))) return prev;
            else {
                return [...prev, idHeader];
            }
        });
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
                id:row?.id,
                acs: row?.acs,
                status: row?.status,
                barcode: row?.barcode,
            };
        });
    }, [highlightedRows, table]);

    return (
        <>
            <div
                ref={parentRef}
                className="h-[94%] 2xl:w-[100%] lg:w-full overflow-auto lg:text-sm 2xl:text-base"
                style={{ direction: table.options.columnResizeDirection, contain: "strict" }}
            >
                <table className={"w-full"} style={{ width: table.getTotalSize() < width ? "100%" : table.getTotalSize(), }}>
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
                                                        <span className='tableHeaderSize wrapword text-left flex justify-between w-full'>
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                            {{
                                                                asc: <FaSortUp className="h-4 w-4 font-bold text-red-500" />,
                                                                desc: <FaSortDown className="h-4 w-4 font-bold text-red-500" />,
                                                            }[header.column.getIsSorted() as string] ?? null}
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

            <Pagination table={table} data={data} initialDateRange={""} totalPage={totalQuery?.data?.total} parentRef={parentRef}
                setActiveCursor={setActiveCursor} SetMultipleRowsSelection={SetMultipleRowsSelection} />

            {highlightedRows.length <= reshedularSelection ?
                <ContextRight MENU_ID={MENU_ID} Rescheduled={Rescheduled} refetch={refetch} setRescheduled={Rescheduled}
                    setActiveCursor={setActiveCursor} SetMultipleRowsSelection={SetMultipleRowsSelection} displayMenu={displayMenu}
                /> : null
            }
        </>
    )
}

export default React.memo(Tabledata)