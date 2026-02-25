
import { Progress } from '@/components/ui/progress';
import { ipAddressStore, reportType, reshedularSelection } from '@/Redux/tableDropFilter';
import axios from 'axios';
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { FaCircle } from "react-icons/fa";

const FetchColumnDetail = () => {
    const [ColumnUUID, SetColumnUUID] = useState([]);
    const [ColumnObject, SetColumnObject] = useState([]);
    const [ColumnMasstech_column, SetColumnMasstech_column] = useState([]);
    const [ColumnReport, SetColumnReport] = useState([]);
    const [Downloadbtn, setReportsbtn] = useState<typeof import("xlsx") | any>(null);
    const [DownloadPannel, setReportsPannel] = useState<typeof import("xlsx") | any>(null);
    const Dispatch = useDispatch()

    const getCelldetail = (props: any, header: any, alignText: string) => {

        if (header === "migrationSizeProgressPercent") {
            return (<div className="py-1"><Progress value={props.getValue()} className="flex justify-center" /></div>)

        } else if (header === "migrationCountProgressPercent") {
            return (<div className="py-1"><Progress value={props.getValue()} className="flex justify-center" /></div>)
        } else if (header === "SlugName") {
            return (<span title={props.getValue()} className={`tableHeaderSize ${alignText}`}>{props.getValue()}</span>)
        }
        else if (header === "ClipName") {
            return (<span title={props.getValue()} className='tableHeaderSize'>{props.getValue()}</span>)
        } else if (header === "SlugName") {
            return (<span title={props.getValue()} className={`tableHeaderSize ${alignText}`}>{props.getValue()}</span>)
        }
        else if (header === "expander") {
            return props.row.getCanExpand() ? (
                <button
                    {...{
                        onClick: props.row.getToggleExpandedHandler(),
                        style: { cursor: 'pointer' },
                    }}
                >
                    {props.row.getIsExpanded() ? '👇' : '👉'}
                </button>
            ) : (
                '🔵'
            )
        }
        else if (header === "isOnline") {
            const isOnline = props.getValue() === 1;

            return (
                <div className="flex items-center justify-center w-full h-full">
                    <FaCircle
                        className={
                            isOnline
                                ? "text-sm text-green-500"
                                : "text-sm text-red-500"
                        }
                    />
                </div>
            );
        }
        else {
            return (<span title={props.getValue()} className={`tableHeaderSize wrapword ${alignText}`}>{props.getValue()}</span>)
        }
    }

    useEffect(() => {
        console.log("RUN configFile")
        axios({
            method: "Get",
            url: './config.json',
        }).then(response => {
            const ColumnUUID = response?.data?.Uuid_column.map((value: any) => {
                const alignClass = value.textAlign === 'text-left'
                    ? 'text-left'
                    : value.textAlign === 'text-center'
                        ? 'text-center'
                        : 'text-right'
                return {
                    id: value.id,
                    accessorKey: value.accessorKey,
                    header: () => { return (<span> {value.header}</span>) },
                    size: value.size,
                    minSize: value.minSize,
                    cell: (props: any) => getCelldetail(props, value.accessorKey, alignClass),
                    enableResizing: value.enableResizing,
                    meta: value.meta,
                    enableColumnFilter: value.enableColumnFilter,
                    enableSorting: value.enableSorting,

                }
            })
            const ColumnObject = response?.data?.Object_column.map((value: any) => {
                const alignClass = value.textAlign === 'text-left'
                    ? 'text-left'
                    : value.textAlign === 'text-center'
                        ? 'text-center'
                        : 'text-right';
                return {
                    accessorKey: value.accessorKey,
                    header: () => { return (<span> {value.header}</span>) },
                    size: value.size,
                    minSize: value.minSize,
                    // Add a small mapping in your component
                    cell: (props: any) => getCelldetail(props, value.accessorKey, alignClass),
                    enableResizing: value.enableResizing,
                    meta: value.meta,
                    enableColumnFilter: value.enableColumnFilter,
                    enableSorting: value.enableSorting,
                }
            })
            const ColumnMasstech_column = response?.data?.Masstech_column.map((value: any) => {
                const alignClass = value.textAlign === 'text-left'
                    ? 'text-left'
                    : value.textAlign === 'text-center'
                        ? 'text-center'
                        : 'text-right';
                return {
                    accessorKey: value.accessorKey,
                    header: () => { return (<span> {value.header}</span>) },
                    size: value.size,
                    minSize: value.minSize,
                    // Add a small mapping in your component
                    cell: (props: any) => getCelldetail(props, value.accessorKey, alignClass),
                    enableResizing: value.enableResizing,
                    meta: value.meta,
                    enableColumnFilter: value.enableColumnFilter,
                    enableSorting: value.enableSorting,
                }
            })
            const ColumnReport = response?.data?.ReportGenerate.map((value: any) => {
                const alignClass = value.textAlign === 'text-left'
                    ? 'text-left'
                    : value.textAlign === 'text-center'
                        ? 'text-center'
                        : 'text-right';
                return {
                    accessorKey: value.accessorKey,
                    header: () => { return (<span> {value.header}</span>) },
                    size: value.size,
                    minSize: value.minSize,
                    // Add a small mapping in your component
                    cell: (props: any) => getCelldetail(props, value.accessorKey, alignClass),
                    enableResizing: value.enableResizing,
                    meta: value.meta,
                    enableColumnFilter: value.enableColumnFilter,
                    enableSorting: value.enableSorting,
                }
            })
            SetColumnUUID(ColumnUUID);
            SetColumnObject(ColumnObject);
            SetColumnMasstech_column(ColumnMasstech_column);
            SetColumnReport(ColumnReport);
            setReportsbtn(response.data.ReportColumns);
            setReportsPannel(response.data.reportPanel);
            Dispatch(ipAddressStore(response.data.apiUrl));
            Dispatch(reshedularSelection(response.data.reshedularSelection));
            Dispatch(reportType(response.data.reportType));
        }).catch(error => {
            console.log(error, "error in Config File")
        });

    }, []);

    return { ColumnUUID, ColumnObject, ColumnMasstech_column, Downloadbtn, ColumnReport, DownloadPannel };
}

export default FetchColumnDetail