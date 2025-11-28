import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    type PaginationState,
} from '@tanstack/react-table';
import React, { Fragment, lazy, Suspense, useMemo, useState } from 'react';
import { columns } from './HandleApiCall/columns';
import { Skeleton } from '@/components/ui/skeleton';
import { FaSortUp, FaSortDown } from "react-icons/fa6";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchData } from '../Object_Details/HandleApiCall/Apicall';
import useWindowSize from '@/hooks/usescreen';
import { FiFilter } from "react-icons/fi";
import { MdOutlineFilterAltOff } from "react-icons/md";
const ColumnFilterDropdown = lazy(() => import("@/components/ColumnFilter/ColumnFilterDropdown"));

import "react-contexify/dist/ReactContexify.css";
import Index from '@/components/Pagination/Index';
import { useDispatch, useSelector } from 'react-redux';
import { setPaginationStore } from '@/Redux/tableDropFilter';
import { endOfYesterday, format } from 'date-fns';
import FetchColumnDetail from './HandleApiCall/FetchColumnDetail';

interface DateInterface {
    from: Date; // Assuming the dates are in string format
    to: Date;
}

const dateStart = endOfYesterday();
const initialDateRange: DateInterface = {
    from: dateStart,
    to: new Date(),
};


const Tabledata = () => {
    const [Filter, setFilter] = useState<any>({ startDate: { from: format(initialDateRange.from, 'yyyy-MM-dd'), to: format(initialDateRange.to, 'yyyy-MM-dd') } });
    const [dropdownOpen, setDropdownOpen] = useState([]);
    const [openSearch, setSearchTag] = useState<any[]>([]);
    const { width } = useWindowSize();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 50,
    });
    const dispatch = useDispatch();
    const [Columns] = FetchColumnDetail();
    const [storeFilterId, setStoreFilterId] = useState<string[]>([]); // State to track selected filter IDs
    const ipAddress = useSelector((state: any) => state.tableDownClick.ipAddressStore);

    const body = {
        "filters": Filter
    };

    const { data, isLoading, refetch, error } = useQuery({
        queryKey: ['uuidData', pagination, body],
        queryFn: async ({ signal }) => {
            dispatch(
                setPaginationStore({
                    filters: Filter,
                })
            );
            const endpoint = `http://${ipAddress}:4000/uuids?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`;
            return fetchData(endpoint, "POST", body, signal);
        },
        networkMode: 'always',
        refetchInterval: 20000,
        retry: false,
    });


    const tableData = useMemo(() =>
        (isLoading === true ? Array(10).fill({}) : data?.data),
        [isLoading, data]
    );

    const tableColumns = useMemo(
        () =>
            isLoading === true
                ? Columns.map((column) => ({
                    ...column,
                    cell: () => (
                        <div className="flex flex-col space-y-3">
                            <Skeleton className="h-[20px] w-full rounded-xl mt-1" />
                        </div>
                    )
                }))
                : Columns,
        [isLoading, Columns]
    );

    const totalQuery = useQuery({
        queryKey: ["uuidTotal", body],
        queryFn: ({ signal }) =>
            fetchData(`http://${ipAddress}:4000/uuids/total`, "POST", body, signal),
        networkMode: "always",
        retry: false,
        refetchOnWindowFocus: false, // optional, avoid spam
    });



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
        setPagination({
            pageIndex: 0,
            pageSize: pagination.pageSize,
        });
        setFilter({ startDate: { from: format(initialDateRange.from, 'yyyy-MM-dd'), to: format(initialDateRange.to, 'yyyy-MM-dd') } })
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
            startDate: {
                from: '',
                to: ''
            },
            [idHeader]: value
        }));
        if (value.trim()) {
            // Only update if text has a value
            setStoreFilterId((prev) => {
                if (prev.some((val) => (val === idHeader))) return prev;
                else {
                    return [...prev, idHeader];
                }
            });
        } else {
            console.log("Text is empty; no action taken.");
        }
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
                                                        <span className='flex justify-between w-full'>
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
                            return (
                                <tr
                                    key={row.index}
                                    id={`row-${row.index}`}
                                    className={`font-medium h-7  text-white odd:bg-[#24303f] h-7  even:bg-[#2d3d52]`}
                                // onContextMenu={(e: any) => (row.original as any).migrationState === "PARTIAL" ? displayMenu(e) : null}
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
            <Index table={table} data={data} initialDateRange={Filter.startDate} totalPage={totalQuery?.data?.total} />
        </>
    )
}

export default React.memo(Tabledata)