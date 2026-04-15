import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { useQuery } from "@tanstack/react-query";
import type { User } from "../table";
import { useSelector } from "react-redux";
import { fetchData } from "@/Pages/Object_Details/HandleApiCall/Apicall";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
    type PaginationState,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

const fetchObjects = async (uuid: string): Promise<ObjectItem[]> => {
    const res = await fetch(`/api/objects?uuid=${uuid}`);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
};

type ObjectItem = {
    objectName: string;
    category: string;
    mediaName: string;
    size: number;
    fileName: string;
    remark: string;
};

type IndexPopupProps = {
    data: User;
};

const IndexPopup = ({ data }: IndexPopupProps) => {
    const ipAddress = useSelector((state: any) => state.tableDownClick.ipAddressStore);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 50,
    });

    const columns = useMemo<ColumnDef<ObjectItem>[]>(
        () => [
            { accessorKey: "objectName", header: "Object Name" },
            { accessorKey: "category", header: "Category" },
            { accessorKey: "mediaName", header: "Media Name" },
            {
                accessorKey: "size",
                header: "Size",
                cell: ({ getValue }) => `${(getValue<number>() / (1024 * 1024)).toFixed(2)} MB`,
            },
            { accessorKey: "fileName", header: "File Name" },
            { accessorKey: "remark", header: "Remark" },
        ],
        []
    );

    const body = useMemo(() => {
        // take all filters except lastUpdateDate 
        return {
            filters: {
                uuid: data.UUID,
                mediaType: data.mediaType,
            },
        };
    }, []);

    const { data: listDetails, isLoading, refetch, error } = useQuery({
        queryKey: ['objectDetails', data.UUID, pagination.pageIndex, pagination.pageSize],
        queryFn: async ({ signal }) => {
            const endpoint = `http://${ipAddress}:4000/objectDetails?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`;
            return fetchData(endpoint, "POST", body, signal);
        },
        networkMode: 'always',
        refetchInterval: 20000,
        retry: false,
    });

    const totalQuery = useQuery({
        queryKey: ["uuidTotal", body],
        queryFn: ({ signal }) =>
            fetchData(`http://${ipAddress}:4000/uuids/total`, "POST", body, signal),
        networkMode: "always",
        retry: false,
        refetchInterval: 12000,
        refetchOnWindowFocus: false, // optional, avoid spam
    });

    const table = useReactTable({
        data: listDetails || [],
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        manualSorting: true,
        onPaginationChange: setPagination,
        state: {
            pagination,
        },
        pageCount: Math.ceil(totalQuery?.data?.total / pagination.pageSize),

    });

    return (
        <DialogContent className="w-[75rem] bg-[#111] text-white h-[550px]">
            <DialogHeader>
                <DialogTitle className="text-white">Details</DialogTitle>

                <DialogDescription asChild className="h-full">
                    <div className="flex flex-col h-[450px] space-y-4">

                        {/* Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <input value={data.UUID} readOnly className="bg-black text-white border border-gray-700 rounded px-3 py-2" />
                            <input value={data.totalObjectCount} readOnly className="bg-black text-white border border-gray-700 rounded px-3 py-2" />
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-auto border border-gray-700 rounded">
                            <table className="w-full text-sm">

                                <thead className="bg-gray-900 sticky top-0">
                                    {table?.getHeaderGroups().map((hg) => (
                                        <tr key={hg.id}>
                                            {hg.headers.map((header) => (
                                                <th key={header.id} className="px-3 py-2 text-left text-gray-300">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>

                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4">Loading...</td>
                                        </tr>
                                    ) : table?.getRowModel()?.rows.length ? (
                                        table?.getRowModel()?.rows.map((row) => (
                                            <tr key={row.id} className="border-t border-gray-800">
                                                {row.getVisibleCells().map((cell) => (
                                                    <td key={cell.id} className="px-3 py-2">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4 text-gray-400">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>
                    </div>
                </DialogDescription>
            </DialogHeader>
        </DialogContent>
    )
}

export default IndexPopup
