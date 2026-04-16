// import {
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
// } from "@/components/ui/dialog";
// import { useQuery } from "@tanstack/react-query";
// import type { User } from "../table";
// import { useSelector } from "react-redux";
// import { fetchData } from "@/Pages/Object_Details/HandleApiCall/Apicall";
// import {
//     useReactTable,
//     getCoreRowModel,
//     flexRender,
//     type ColumnDef,
//     type PaginationState,
//     getPaginationRowModel,
// } from "@tanstack/react-table";
// import { useMemo, useState } from "react";
// import { Label } from "@/components/ui/label";

// type ObjectItem = {
//     objectName: string;
//     category: string;
//     mediaName: string;
//     sizeKB: number;
//     fileName: string;
//     status: string;
//     remarks: string;
// };

// type IndexPopupProps = {
//     data: User;
// };

// const ltoStatusOptions = [
//     { label: "MIGRATION_COMPLETED", value: "MIGRATION_COMPLETED" },
//     { label: "MIGRATION_SUBMITTED", value: "MIGRATION_SUBMITTED" },
//     { label: "Pending", value: "PENDING" },
//     { label: "MIGRATION_FAILED", value: "MIGRATION_FAILED" },
//     { label: "DECODE_STARTED", value: "DECODE_STARTED" },
//     { label: "DECODE_COMPLETED", value: "DECODE_COMPLETED" },
//     { label: "DECODE_FAILED", value: "DECODE_FAILED" }
// ];

// const mtStatusOptions = [
//     { label: "MIGRATION_COMPLETED", value: "MIGRATION_COMPLETED" },
//     { label: "MIGRATION_SUBMITTED", value: "MIGRATION_SUBMITTED" },
//     { label: "Pending", value: "PENDING" },
//     { label: "MIGRATION_FAILED", value: "MIGRATION_FAILED" },
//     { label: "DECODE_STARTED", value: "DECODE_STARTED" },
//     { label: "DECODE_COMPLETED", value: "DECODE_COMPLETED" },
//     { label: "DECODE_FAILED", value: "DECODE_FAILED" },
// ];

// const normalizeData = (rows: any[], mediaType: string) => {
//     console.log("Normalizing data for mediaType:", mediaType, "with rows:", rows);

//     if (mediaType.startsWith("MT-LTO")) {
//         return rows.map((r) => ({
//             objectName: r.displayName || r.AO_OBJECT_NAME,
//             category: r.mediaType || r.AO_CATEGORY,
//             mediaName: r.mediaName || r.TA_BARCODE,
//             sizeKB: r.size || r.SIZE || 0,
//             fileName: r.fileName || r.FILE_NAME,
//             status: r.status || r.STATUS,
//             remarks: r.remarks || r.REMARKS,
//         }));
//     }

//     return rows.map((r) => ({
//         objectName: r.objectName,
//         category: r.category,
//         mediaName: r.mediaName || r.barcode,
//         sizeKB: r.sizeKB || 0,
//         fileName: r.fileName,
//         status: r.status,
//         remarks: r.remarks,
//     }));
// };

// const IndexPopup = ({ data }: IndexPopupProps) => {
//     const ipAddress = useSelector((state: any) => state.tableDownClick.ipAddressStore);
//     const isMtType = data.mediaType?.startsWith("MT");
//     const statusOptions = isMtType ? mtStatusOptions : ltoStatusOptions;
//     const [selectedStatus, setSelectedStatus] = useState(
//         isMtType ? "MIGRATION_COMPLETED" : "MIGRATION_COMPLETED"
//     );
//     const [pagination, setPagination] = useState<PaginationState>({
//         pageIndex: 0,
//         pageSize: 50,
//     });

//     const columns = useMemo<ColumnDef<ObjectItem>[]>(
//         () => [
//             { accessorKey: "objectName", header: "Object Name",
//                 cell: (info: any) => (
//                     <div title={info.getValue() as string} className="truncate max-w-[200px]">
//                         {info.getValue()}
//                     </div>
//                 ),
//              },
//             { accessorKey: "category", header: "Category",
//                 cell: (info: any) => (
//                     <div title={info.getValue() as string} className="truncate max-w-[150px]">
//                         {info.getValue()}
//                     </div>
//                 ),
//              },
//             { accessorKey: "mediaName", header: "Media Name",
//                 cell: (info: any) => (
//                     <div title={info.getValue() as string} className="truncate max-w-[150px]">
//                         {info.getValue()}
//                     </div>
//                 ),
//              },
//             { accessorKey: "sizeKB", header: "Size (KB)",
//                 cell: (info: any) => (
//                     <div title={info.getValue() as string} className="truncate max-w-[150px]">
//                         {info.getValue()}
//                     </div>
//                 ),
//              },
//             { accessorKey: "fileName", header: "File Name",
//                 cell: (info: any) => (
//                     <div title={info.getValue() as string} className="truncate max-w-[150px]">
//                         {info.getValue()}
//                     </div>
//                 ),
//              },
//             { accessorKey: "status", header: "Status",
//                 cell: (info: any) => (
//                     <div title={info.getValue() as string} className="truncate max-w-[150px]">
//                         {info.getValue()}
//                     </div>
//                 ),
//              },
//             { accessorKey: "remarks", header: "Remark",
//                 cell: (info: any) => (
//                     <div title={info.getValue() as string} className="truncate max-w-[150px]">
//                         {info.getValue()}
//                     </div>
//                 ),
//              },
//         ],
//         []
//     );

//     const [pageCursors, setPageCursors] = useState<(number | null)[]>([null]);
//     const currentCursor = pageCursors[pagination.pageIndex] ?? null;

//     const body = useMemo(() => {
//         return {
//             filters: {
//                 uuid: data.UUID,
//                 mediaType: data.mediaType,
//                 status: selectedStatus, // send selected option to backend
//             },
//         };
//     }, [data.UUID, data.mediaType, selectedStatus]);

//     const { data: listDetails, isLoading } = useQuery({
//         queryKey: ["objectDetails", pagination.pageIndex, pagination.pageSize, body, currentCursor],
//         queryFn: async ({ signal }) => {
//             const endpoint = `http://${ipAddress}:4000/uuids/tapeDetails`;
//             return fetchData(endpoint, "POST", body, signal);
//         },
//         networkMode: "always",
//         refetchInterval: 20000,
//         retry: false,
//     });

//     const normalizedRows = useMemo(
//         () => normalizeData(listDetails?.data || [], data.mediaType),
//         [listDetails, data.mediaType]
//     );

//     const table = useReactTable({
//         data: normalizedRows || [],
//         columns,
//         getCoreRowModel: getCoreRowModel(),
//         getPaginationRowModel: getPaginationRowModel(),
//         manualPagination: true,
//         enableColumnResizing: true,
//         columnResizeMode: "onChange",
//         manualSorting: true,
//     });


//     return (
//         <DialogContent className="w-[75rem] bg-[#18202b] text-white h-[550px]">
//             <DialogHeader>
//                 <DialogTitle className="text-white">Details</DialogTitle>

//                 <DialogDescription asChild>
//                     <div className="flex flex-col h-[450px] space-y-4">
//                         <div className="grid grid-cols-[50px_minmax(300px,_1fr)_200px_minmax(300px,_1fr)] gap-4">
//                             <Label className="text-gray-300">UUID:</Label>
//                             <input
//                                 value={data.UUID}
//                                 readOnly
//                                 className="bg-black text-white border border-gray-700 rounded px-3 py-2"
//                             />

//                             <Label className="text-gray-300">Total Object Count:</Label>
//                             <input
//                                 value={data.totalObjectCount}
//                                 readOnly
//                                 className="bg-black text-white border border-gray-700 rounded px-3 py-2"
//                             />
//                         </div>

//                         {/* Status Select */}
//                         <div className="grid grid-cols-[50px_minmax(300px,_1fr)_200px_minmax(300px,_1fr)] gap-4 items-center">
//                             <Label className="text-gray-300">Status:</Label>
//                             <select
//                                 value={selectedStatus}
//                                 onChange={(e) => {
//                                     setSelectedStatus(e.target.value);
//                                     setPagination((prev) => ({ ...prev, pageIndex: 0 }));
//                                     setPageCursors([null]);
//                                 }}
//                                 className="bg-black text-white border border-gray-700 rounded px-3 py-2"
//                             >
//                                 {statusOptions.map((option) => (
//                                     <option key={option.value} value={option.value}>
//                                         {option.label}
//                                     </option>
//                                 ))}
//                             </select>
//                             <Label className="text-gray-300">Status Count:</Label>
//                             <input
//                                 value={listDetails?.totalStatusCount}
//                                 readOnly
//                                 className="bg-black text-white border border-gray-700 rounded px-3 py-2"
//                             />
//                         </div>

//                         <div className="flex-1 overflow-auto border border-gray-700 rounded">
//                             <table className="w-full text-sm">
//                                 <thead className="bg-gray-900 sticky top-0">
//                                     {table.getHeaderGroups().map((hg) => (
//                                         <tr key={hg.id}>
//                                             {hg.headers.map((header) => (
//                                                 <th
//                                                     key={header.id}
//                                                     className="px-3 py-2 text-left text-gray-300"
//                                                 >
//                                                     {flexRender(
//                                                         header.column.columnDef.header,
//                                                         header.getContext()
//                                                     )}
//                                                 </th>
//                                             ))}
//                                         </tr>
//                                     ))}
//                                 </thead>

//                                 <tbody>
//                                     {isLoading ? (
//                                         <tr>
//                                             <td colSpan={6} className="text-center py-4">
//                                                 Loading...
//                                             </td>
//                                         </tr>
//                                     ) : table.getRowModel().rows.length ? (
//                                         table.getRowModel().rows.map((row) => (
//                                             <tr
//                                                 key={row.id}
//                                                 className="border-t border-gray-800 text-white odd:bg-[#24303f] even:bg-[#2d3d52]"
//                                             >
//                                                 {row.getVisibleCells().map((cell) => (
//                                                     <td key={cell.id} className="px-3 py-2">
//                                                         {flexRender(
//                                                             cell.column.columnDef.cell,
//                                                             cell.getContext()
//                                                         )}
//                                                     </td>
//                                                 ))}
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan={6} className="text-center py-4 text-gray-400">
//                                                 No data available
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </DialogDescription>
//             </DialogHeader>
//         </DialogContent>
//     );
// };

// export default IndexPopup;

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { fetchData } from "@/Pages/Object_Details/HandleApiCall/Apicall";
import { Label } from "@/components/ui/label";

const statusOptions = [
  { label: "MIGRATION_COMPLETED", value: "MIGRATION_COMPLETED" },
  { label: "MIGRATION_SUBMITTED", value: "MIGRATION_SUBMITTED" },
  { label: "Pending", value: "PENDING" },
  { label: "MIGRATION_FAILED", value: "MIGRATION_FAILED" },
  { label: "DECODE_STARTED", value: "DECODE_STARTED" },
  { label: "DECODE_COMPLETED", value: "DECODE_COMPLETED" },
  { label: "DECODE_FAILED", value: "DECODE_FAILED" },
];

type IndexPopupProps = {
  data: {
    UUID: string;
    mediaType: string;
    totalObjectCount: number;
  };
};

export default function IndexPopup({ data }: IndexPopupProps) {
  const ipAddress = useSelector((state: any) => state.tableDownClick.ipAddressStore);
  const [selectedStatus, setSelectedStatus] = useState("MIGRATION_FAILED");

  const body = useMemo(() => {
    return {
      filters: {
        uuid: data.UUID,
        mediaType: data.mediaType,
        status: selectedStatus,
      },
    };
  }, [data.UUID, data.mediaType, selectedStatus]);

  const { data: listDetails, isLoading } = useQuery({
    queryKey: ["tapeDetails", body],
    queryFn: async ({ signal }) => {
      const endpoint = `http://${ipAddress}:4000/uuids/tapeDetails`;
      return fetchData(endpoint, "POST", body, signal);
    },
    networkMode: "always",
    retry: false,
    refetchInterval: 20000,
  });

  const summary = listDetails?.statusSummary || [];
  const selectedCount = listDetails?.selectedCount || 0;
  const rows = listDetails?.data || [];

  return (
    <DialogContent className="max-w-7xl bg-[#18202b] text-white">
      <DialogHeader>
        <DialogTitle className="text-white">Tape Details</DialogTitle>
        <DialogDescription asChild>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-gray-700 bg-[#111827] p-4">
                <div className="text-sm text-gray-400">UUID</div>
                <div className="mt-1 break-all font-medium text-white">{data?.UUID}</div>
              </div>

              <div className="rounded-lg border border-gray-700 bg-[#111827] p-4">
                <div className="text-sm text-gray-400">Media Type</div>
                <div className="mt-1 font-medium text-white">{data?.mediaType}</div>
              </div>

              <div className="rounded-lg border border-gray-700 bg-[#111827] p-4">
                <div className="text-sm text-gray-400">Total Object Count</div>
                <div className="mt-1 text-2xl font-bold text-white">{data?.totalObjectCount}</div>
              </div>
            </div> 

            <div>
              <div className="mb-2 text-sm font-semibold text-gray-300">Status Summary</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summary.map((item: any) => {
                  const isActive = item.value === selectedStatus;
                  return (
                    <button
                      key={item.value}
                      type="button"
                    //   onClick={() => setSelectedStatus(item.value)}
                      className={`rounded-xl border p-4 text-left transition`}
                    >
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="mt-2 text-2xl font-bold text-white">{item.count}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* <div className="rounded-lg border border-gray-700 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0f172a]">
                  <tr>
                    <th className="px-4 py-3 text-left">Object Name</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">File Name</th>
                    <th className="px-4 py-3 text-left">Barcode</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  ) : rows.length ? (
                    rows.map((row: any, index: number) => (
                      <tr key={index} className="border-t border-gray-800">
                        <td className="px-4 py-3">{row.objectName || row.displayName || "-"}</td>
                        <td className="px-4 py-3">{row.category || row.mediaType || "-"}</td>
                        <td className="px-4 py-3">{row.status || "-"}</td>
                        <td className="px-4 py-3">{row.fileName || "-"}</td>
                        <td className="px-4 py-3">{row.barcode || row.tapeBarcode || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div> */}
          </div>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  );
}