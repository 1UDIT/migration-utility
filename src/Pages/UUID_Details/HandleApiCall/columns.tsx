import { Progress } from "@/components/ui/progress"
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import { Button } from "@/components/ui/button";
import { MdCancel } from "react-icons/md";
import { HiArrowPath } from "react-icons/hi2";
import type { ColumnDef } from "@tanstack/react-table";

export type Person = {
    Object: string,
    Category: string,
    Type: String,
    Media: String,
    status: string,
    progress: string,
    index: string,
    date: string,
    srcdes: string,
}

const statusCall = (status: string) => {
    switch (status) {
        case "COMPLETED":
            return (
                <span className='flex cols-2 '>
                    <div className="col-span-1 pr-1">
                        <FaCheckCircle className='text-[#4c9d6d] inline-block ' />
                    </div>
                    <div className="col-span-1">
                        Completed
                    </div>
                </span>
            )
        case "Aborted":
            return (
                <span className='flex cols-2  '>
                    <div className="col-span-1 pr-1">
                        <FaExclamationCircle className='text-[#ff3842] inline-block ' />
                    </div>
                    <div className="col-span-1">
                        Aborted
                    </div>
                </span>
            )
        case "INPROGRESS":
            return (
                <span className='flex cols-2  '>
                    <div className="col-span-1 pr-1">
                        <HiArrowPath className='text-[#06b3ac] stroke-2 inline-block text-[17px]  animate-spin-slow' />
                    </div>
                    <div className="col-span-1">
                        Processing
                    </div>
                </span>
            )
        case "PENDING":
            return (
                <span className='flex cols-2  '>
                    <div className="col-span-1 pr-1">
                        <GrInProgress className='text-[#28a5ad] inline-block animate-spin-slow' />
                    </div>
                    <div className="col-span-1">
                        Waiting
                    </div>
                </span>
            )
        case "ERROR":
            return (
                <span className='flex cols-2  '>
                    <div className="col-span-1 pr-1">
                        <MdCancel className='text-[#ff3842] inline-block' />
                    </div>
                    <div className="col-span-1">
                        Cancelled
                    </div>
                </span>
            )
        default:
            break;
    }
}

export const columns: ColumnDef<Person>[] = [
    {
        accessorKey: 'UUID',
        cell: (info: any) => { return (<span className="tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</span>) },
        header: ({ column }) => {
            return (<>
                <Button
                    variant="ghost" className="font-bold tableHeaderSize wrapword"
                >
                    Tape Barcode
                </Button>
            </>
            )
        },
        invertSorting: true,
        size: 460
    },
    {
        accessorKey: 'UUID_path',
        cell: (info: any) => { return (<span className="tableHeaderSize" title={info.getValue()}>{info.getValue()}</span>) },
        header: ({ column }) => {
            return (<>
                <Button
                    variant="ghost" className="font-bold tableHeaderSize wrapword"
                >
                    UUID Path
                </Button>
            </>
            )
        },
        size: 320
    },
    {
        accessorKey: 'total_file_size',
        cell: (info: any) => { return (<span className="tableHeaderSize" title={info.getValue()}>{info.getValue()}</span>) },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Total Size

                </Button>
            )
        },
        enableColumnFilter: false,
        size: 120
    },
    {
        accessorKey: 'total_file_count',
        cell: (info: any) => {
            return (<span className="tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</span>)
        },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Migrated File
                </Button>
            )
        },
        size: 120,
        enableColumnFilter: false,
    },
    {
        accessorKey: 'migrated_file_count',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    File Count

                </Button>
            )
        },
        cell: (info: any) => {
            return (<span className="tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</span>)
        },
        size: 130,
        minSize: 40,
        enableColumnFilter:false
    },
    // {
    //     accessorKey: 'migrated_file_size',
    //     cell: (info: any) => { return (<span className="tableHeaderSize" title={info.getValue()}>{info.getValue()}</span>) },
    //     header: ({ column }) => {
    //         return (
    //             <Button
    //                 variant="ghost" className="font-bold tableHeaderSize "
    //             >
    //                 Migrated Size
    //             </Button>
    //         )
    //     },
    //     meta: {
    //         filterVariant: 'select',
    //     },
    //     size: 60,
    //     minSize: 70,
    // },
    {
        accessorKey: 'migration_status',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Status
                </Button>
            )
        },
        cell: (info: any) => {
            return (<span className="tableHeaderSize" title={info.getValue()}>{statusCall(info.getValue())}</span>)
        },
        meta: {
            filterVariant: 'select',
            selectOptions: [
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
                { label: 'Pending', value: 'Pending' },
            ],
        },
        enableSorting: false,
        enableColumnFilter: true,
        size: 120
    },
    {
        accessorKey: 'Migration_Start_Date',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Migration Start Date
                </Button>
            )
        },
        cell: (info: any) => {
            return (<span className="tableHeaderSize wrapword" title={info.getValue()?.split("T")[0]}>{info.getValue()?.split("T")[0]}</span>)
        },
        meta: {
            filterVariant: 'calender',
            calendarMode: 'range',
            numberOfMonths: 2,
            placeholder: 'Pick date',
        },
        enableSorting: false,
        enableColumnFilter: true,
        size: 210
    },
    {
        accessorKey: 'Migration_End_Date',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Migration End Date
                </Button>
            )
        },
        cell: (info: any) => {
            return (<span className="tableHeaderSize wrapword" title={info.getValue()?.split("T")[0]}>{info.getValue()?.split("T")[0]}</span>)
        },
        meta: {
            filterVariant: 'calender',
            calendarMode: 'range',
            numberOfMonths: 2,
            placeholder: 'Pick date',
        },
        enableSorting: false,
        enableColumnFilter: true,
        size: 210
    },
    {
        accessorKey: 'Invoice_Generated',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Invoice ID
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-center" title={info.getValue()}>{info.getValue()}</div>) },
        enableSorting: false,
        enableColumnFilter: false,
        size: 135
    },
    {
        accessorKey: 'Invoice_Generation_Date',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    No. of file Migrated
                </Button>
            )
        },
        cell: (info: any) => {
            return (<span className="tableHeaderSize wrapword" title={info.getValue()?.split("T")[0]}>0</span>)
        },
        enableSorting: false,
        enableColumnFilter: true,
        size: 190,
        // meta: {
        //     filterVariant: 'calender',
        //     calendarMode: 'range',
        //     numberOfMonths: 2,
        //     placeholder: 'Pick date',
        // },
    },
    {
        accessorKey: 'Verified',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Verified
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-center" title={info.getValue()}>{info.getValue()}</div>) },
        enableSorting: false,
        enableColumnFilter: true,
        meta: {
            filterVariant: 'select',
            selectOptions: [{ label: 'Y', value: 'Y' }, { label: 'N', value: 'N' }],
        },
        size: 115
    },
    // {
    //     accessorKey: 'Remarks',
    //     header: ({ column }) => {
    //         return (
    //             <Button
    //                 variant="ghost" className="font-bold tableHeaderSize"
    //             >
    //                 Remarks
    //             </Button>
    //         )
    //     },
    //     cell: (info: any) => {
    //         return (<span className="tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</span>)
    //     },
    //     enableSorting: false,
    //     enableColumnFilter: false,
    //     size: 55
    // },
    {
        accessorKey: 'migration_progress_percent',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize "
                >
                    Progress
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="py-1"><Progress value={info.getValue()} className="flex justify-center" /></div>) },
        enableSorting: false,
        enableColumnFilter: false,
        size: 160
    },
]
