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
        case "FAILED":
            return (
                <span className='flex cols-2  '>
                    <div className="col-span-1 pr-1">
                        <FaExclamationCircle className='text-[#ff3842] inline-block ' />
                    </div>
                    <div className="col-span-1">
                        FAILED
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
                        <GrInProgress className='text-[#28a5ad] inline-block animate-spin-slow' />
                    </div>
                    <div className="col-span-1">
                        Pending
                    </div>
                </span>
            )
        case "Cancelled":
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
        accessorKey: 'objectName',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Name
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-left tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</div>) },
        size: 330,
        minSize: 45,
        enableResizing: true,
        sortDescFirst: true,
        sortUndefined: 1
    },
    {
        accessorKey: 'category',
        cell: (info: any) => { return (<div className="text-left tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</div>) },
        header: ({ column }) => {
            return (<>
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Category
                </Button>
            </>
            )
        },
        size: 130,
        minSize: 45,
        sortDescFirst: false,
    },
    {
        accessorKey: 'archiveDate',
        cell: (info: any) => { return (<span className="tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</span>) },
        header: ({ column }) => {
            return (<>
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Date
                </Button>
            </>
            )
        },
        meta: {
            filterVariant: 'calender',
            calendarMode: 'range',
            numberOfMonths: 2,
            placeholder: 'Pick date',
        },
        invertSorting: true,
        size: 200
    },
    {
        accessorKey: 'sizeKB',
        cell: (info: any) => { return (<span className="tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</span>) },
        header: ({ column }) => {
            return (<>
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Size(KB)
                </Button>
            </>
            )
        }, 
        size: 120
    },
    {
        accessorKey: 'divaInstanceNB',
        cell: (info: any) => { return (<span className="tableHeaderSize" title={info.getValue()}>{info.getValue()}</span>) },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Instance Id
                </Button>
            )
        },
        enableColumnFilter: true, 
        size: 145
    },
    {
        accessorKey: 'ddnPath',
        cell: (info: any) => { return (<div className="text-left" title={info.getValue()}>{info.getValue()}</div>) },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Path
                </Button>
            )
        },
        size: 220,
        enableColumnFilter: true,
    },
    {
        accessorKey: 'barcode',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Barcode
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-left" title={info.getValue()}>{info.getValue()}</div>) },
        size: 130,
        minSize: 120
    },
    {
        accessorKey: 'mediaType',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Media Type
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-left tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</div>) },
        size: 145,
        minSize: 120
    },
    {
        accessorKey: 'acs',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    acs
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-left" title={info.getValue()}>{info.getValue()}</div>) },
        size: 100,
        minSize: 40
    },
    {
        accessorKey: 'mediaName',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Media Name
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-left tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</div>) },
        size: 150,
        minSize: 120
    },
    {
        accessorKey: 'axfFileName',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Axf File Name
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-left tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</div>) },
        size: 165,
        minSize: 120
    },
    {
        accessorKey: 'objectUUID',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Object UUID
                </Button>
            )
        },
        cell: (info: any) => { return (<span className="tableHeaderSize wrapword" title={info.getValue()}>{info.getValue()}</span>) },
        enableSorting: false,
        enableColumnFilter: true,
        size: 350
    },
    {
        accessorKey: 'isMatched',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Already Migrated
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-center" title={info.getValue()}>{info.getValue()}</div>) },
        enableSorting: false,
        enableColumnFilter: true,
        meta: {
            filterVariant: 'select',
            selectOptions: [
                { label: 'Yes', value: 'YES' },
                { label: 'No', value: 'NO' },
            ],
            isMulti: false
        },
        size: 180
    }, 
    {
        accessorKey: 'instanceMigrated',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    instance Migrated
                </Button>
            )
        },
        cell: (info: any) => { return (<span className="tableHeaderSize" title={info.getValue()}>{info.getValue()}</span>) },
        enableSorting: false,
        enableColumnFilter: false,
        size: 160
    },
    {
        accessorKey: 'status',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" className="font-bold tableHeaderSize"
                >
                    Status
                </Button>
            )
        },
        cell: (info: any) => { return (<div className="text-center tableHeaderSize wrapword" title={info.getValue()}>{statusCall(info.getValue())}</div>) },
        enableSorting: false,
        enableColumnFilter: true,
        size: 160,
        meta: {
            filterVariant: 'select',
            selectOptions: [
                { label: 'Completed', value: 'COMPLTED' },
                { label: 'Processing', value: 'PROGRESS' },
                { label: 'Pending', value: 'PENDING' },
                { label: 'PARTIAL', value: 'PARTIAL' },
            ],
            isMulti: true
        },
    },
]
