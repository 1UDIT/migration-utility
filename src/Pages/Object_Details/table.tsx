import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
} from '@tanstack/react-table';
import React, { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { columns } from './HandleApiCall/columns';
import { Skeleton } from '@/components/ui/skeleton';
import { FaSortUp, FaSortDown } from "react-icons/fa6";
import { useQuery } from '@tanstack/react-query';
import { fetchData } from './HandleApiCall/Apicall';
import FilterSearch from '../UUID_Details/HandleApiCall/FilterSearch';
import { endOfYesterday, format } from 'date-fns';
import type { DateRange } from "react-day-picker";

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
    const [Filter, setFilter] = useState<any>({ id: "", value: "" });
    const [Requeststatus, setRequeststatus] = useState<[]>([]);
    const [Requesttype, setRequestType] = useState<[]>([]);
    const [openSearch, setSearchTag] = useState<any[]>([]);
    const [date, setDate] = useState<DateRange | undefined>(initialDateRange);
    const MediaArr = [
        { value: "Completed", label: "Completed", },
        { value: "Aborted", label: "Aborted", },
        { value: "Cancelled", label: "Cancelled", },
        { value: "Processing", label: "Processing", },
        { value: "Waiting for Resources", label: "Waiting", },
    ]
    const TypeArr = [
        { value: "ARCHIVE", label: "ARCHIVE", },
        { value: "RESTORE", label: "RESTORE", },
        { value: "COPY", label: "COPY", },
        { value: "Delete", label: "DELETE", },
        { value: "PARTIAL_RESTORE", label: "PARTIAL RESTORE", },
    ]
    const { data, isLoading, refetch, error } = useQuery({
        queryKey: ['requestData'],
        queryFn: () => {
            const endpoint = `http://localhost:4000/objects`
            return fetchData<any>(endpoint);
        },
        networkMode: 'always',
        refetchInterval: 20000,
        retry: false
    });



    const tableData = useMemo(() =>
        (isLoading === true ? Array(10).fill({}) : data),
        [isLoading, data]
    );

    const tableColumns = useMemo(
        () =>
            isLoading === true
                ? columns.map((column) => ({
                    ...column,
                    cell: () => (
                        <div className="flex flex-col space-y-3">
                            <Skeleton className="h-[20px] w-full rounded-xl mt-1" />
                        </div>
                    )
                }))
                : columns,
        [isLoading]
    );


    const table = useReactTable({
        data: tableData ?? [],
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        enableMultiRowSelection: false,
        manualSorting: true,
        enableSortingRemoval: false, //Don't allow - default on/true 
    });
    function clearFilter(idHeader: string) {
        setFilter({ id: idHeader, value: "" })
        setSearchTag((old) => old.filter((d: any) => d !== idHeader));
    };


    function handleInputChange(value: any, idHeader: string, column: any) {
        column.setFilterValue(value);
        setFilter({ id: idHeader, value: value });
    };

    return (<>
        <div
            className="h-[94%] 2xl:w-[100%] lg:w-full overflow-auto lg:text-sm 2xl:text-base"
            style={{ direction: table.options.columnResizeDirection }} 
        >
            {/* <table className='w-full' >
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <Fragment key={headerGroup.id}>
                            <tr>
                                {headerGroup.headers.map(header => {
                                    console.log(headerGroup.headers)
                                    return (
                                        <th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className="px-1 py-1 sticky top-0 bg-slate-100 dark:bg-[#24303f] z-10"
                                        >
                                            {header.column.getCanFilter() ? (
                                                <FilterSearch column={header.column} media={MediaArr} type={TypeArr} headerid={header.id} handleInputChange={handleInputChange}
                                                    Filter={Filter} clearFilter={clearFilter} date={date} setDate={setDate} setRequeststatus={setRequeststatus}
                                                    Requeststatus={Requeststatus} Requesttype={Requesttype} setRequestType={setRequestType} />

                                            ) : null}

                                        </th>)
                                }
                                )}
                            </tr>
                            <tr>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            style={{ position: 'relative', width: header.getSize(), fontSize: "clamp(0.8rem, 1.5vw, 1rem)" }}
                                            className="th select-none px-1.5 text-black dark:text-white sticky top-0 dark:bg-[#2d3d52] bg-slate-50 dark:drop-shadow-1 drop-shadow-md"
                                        >
                                            <div className="flex justify-between items-center w-full">
                                                <span
                                                    className={`flex items-center hover:border-r hover:border-[#414954] ${header.column.getCanFilter() ? 'w-[100%]' : 'w-[100%]'}`}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    <span className='w-[70%]'> {flexRender(header.column.columnDef.header, header.getContext())}</span>
                                                    <span className="pt-1 w-[30%] flex justify-end ">
                                                        {{
                                                            asc: <FaSortUp className="h-4 w-4 font-bold" />,
                                                            desc: <FaSortDown className="h-4 w-4 font-bold" />,
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
            </table> */}
            <table className='w-full' >
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <Fragment key={headerGroup.id}>
                            <tr>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            style={{ position: 'relative', width: header.getSize(), fontSize: "clamp(0.8rem, 1.5vw, 1rem)" }}
                                            className="th select-none px-1.5 text-black dark:text-white sticky top-0 dark:bg-[#2d3d52] bg-slate-50 dark:drop-shadow-1 drop-shadow-md"
                                        >
                                            <div className="flex justify-between items-center w-full">
                                                <span
                                                    className={`flex items-center hover:border-r hover:border-[#414954] ${header.column.getCanFilter() ? 'w-[100%]' : 'w-[100%]'}`}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    <span className='w-[70%]'> {flexRender(header.column.columnDef.header, header.getContext())}</span>
                                                    <span className="pt-1 w-[30%] flex justify-end ">
                                                        {{
                                                            asc: <FaSortUp className="h-4 w-4 font-bold" />,
                                                            desc: <FaSortDown className="h-4 w-4 font-bold" />,
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
        </div >
    </>
    )
}

export default React.memo(Tabledata)