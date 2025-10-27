import { Progress } from "@/components/ui/progress"
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { MdOutlinePendingActions } from "react-icons/md";
import { Button } from "@/components/ui/button"; 
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
        case "COMPLTED":
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
        case "PARTIAL":
            return (
                <span className='flex cols-2  '>
                    <div className="col-span-1 pr-1">
                        <FaExclamationCircle className='text-[#ff3842] inline-block ' />
                    </div>
                    <div className="col-span-1">
                        PARTIAL
                    </div>
                </span>
            )
        case "IN PROGRESS":
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
                        <MdOutlinePendingActions className='text-[#06b3ac] inline-block' />
                    </div>
                    <div className="col-span-1">
                        PENDING
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
        size: 210
    },
    {
        accessorKey: 'UUIDPath',
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
        accessorKey: 'mediaType',
        cell: (info: any) => { return (<span className="tableHeaderSize" title={info.getValue()}>{info.getValue()}</span>) },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Media Type
                </Button>
            )
        },
        enableColumnFilter: false,
        size: 120
    },
    {
        accessorKey: 'totalObjectSize',
        cell: (info: any) => {
            return (<span className="tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</span>)
        },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Object Size
                </Button>
            )
        },
        size: 120,
        minSize:70,
        enableColumnFilter: false,
    },
    {
        accessorKey: 'migratedObjectSize',
        header: ({ column }) => {
            return (
                <Button variant="ghost" className="font-bold tableHeaderSize">
                    Migrated Object Size
                </Button>
            )
        },
        cell: (info: any) => {
            return (<span className="tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</span>)
        },
        size: 190,
        minSize: 60,
        enableColumnFilter: false
    },
    {
        accessorKey: 'totalObjectCount',
        header: ({ column }) => {
            return (
                <Button variant="ghost" className="font-bold tableHeaderSize">
                    Object Count
                </Button>
            )
        },
        cell: (info: any) => {
            return (<span className="tableHeaderSize" title={info.getValue()}>{info.getValue()}</span>)
        },
        
        enableSorting: false,
        enableColumnFilter: true,
        size: 160
    },
    {
        accessorKey: 'migratedObjectCount',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Migrated Object Count
                </Button>
            )
        },
        cell: (info: any) => {
            // return (<span className="tableHeaderSize wrapword" title={info.getValue()?.split("T")[0]}>{info.getValue()?.split("T")[0]}</span>)
            return (<span className="tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</span>)
        }, 
        enableSorting: false,
        enableColumnFilter: true,
        size: 210
    }, 
    {
        accessorKey: 'invoiceID',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Invoice ID 
                </Button>
            )
        },
        cell: (info: any) => {
            // return (<span className="tableHeaderSize wrapword" title={info.getValue()?.split("T")[0]}>{info.getValue()?.split("T")[0]}</span>)
            return (<span className="tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</span>)
        }, 
        enableSorting: false,
        enableColumnFilter: true,
        size: 210
    }, 
    {
        accessorKey: 'invoiceDate',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Invoice Date
                </Button>
            )
        },
        cell: (info: any) => {
            // return (<span className="tableHeaderSize wrapword" title={info.getValue()?.split("T")[0]}>{info.getValue()?.split("T")[0]}</span>)
            return (<span className="tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</span>)
        }, 
        enableSorting: false,
        enableColumnFilter: true,
        size: 210
    }, 
    {
        accessorKey: 'startDate',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Start Date
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-center" title={info.getValue()}>{info.getValue()}</div>) },        
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
        accessorKey: 'endDate',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    End Date
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-center" title={info.getValue()}>{info.getValue()}</div>) },  
        enableSorting: false,
        enableColumnFilter: true,
        size: 210,        
        meta: {
            filterVariant: 'calender',
            calendarMode: 'range',
            numberOfMonths: 2,
            placeholder: 'Pick date',
        },
    },
    {
        accessorKey: 'migrationSizeProgressPercent',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Migration Size Progress
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="py-1"><Progress value={info.getValue()} className="flex justify-center" /></div>) },
        enableSorting: false,
        enableColumnFilter: false,
        size: 220
    },
    {
        accessorKey: 'migrationCountProgressPercent',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Migration Count Progress
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="py-1"><Progress value={info.getValue()} className="flex justify-center" /></div>) },
        enableSorting: false,
        enableColumnFilter: false,
        size: 220
    },
    {
        accessorKey: 'failedObjectCount',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize "
                >
                    Failed Object Count
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-center" title={info.getValue()}>{info.getValue()}</div>) },
        enableSorting: false,
        enableColumnFilter: false,
        size: 160
    },
    {
        accessorKey: 'migrationState',
        header: ({ column }) => {
            return (
                <Button variant="ghost" className="font-bold tableHeaderSize">
                    Migration State
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-center" title={info.getValue()}>{statusCall(info.getValue())}</div>) },
        enableSorting: false,
        enableColumnFilter: true,
        meta: {
            filterVariant: 'select',
            selectOptions: [
                { label: 'Completed', value: 'COMPLTED' },
                { label: 'Processing', value: 'PROGRESS' },
                { label: 'Pending', value: 'PENDING' },
                { label: 'PARTIAL', value: 'PARTIAL' },
            ],
            isMulti:true
        },
        size: 180
    },
]
