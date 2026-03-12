
import { Progress } from '@/components/ui/progress';
import { ipAddressStore, nonActiveInstances, reportType, reshedularSelection } from '@/Redux/tableDropFilter';
import axios from 'axios';
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { FaCircle, FaEdit } from "react-icons/fa";
import CopyCell from '../ui/CopyCell';

export function safe(s: any) {
    return s === null || s === undefined || s === "" ? "-" : String(s);
}

// ---------- helpers ----------
export function bytesToGB(bytes?: number | null) {
    if (!bytes || bytes <= 0) return "0 ";
    return (bytes / 1024 / 1024 / 1024).toFixed(0);
}
export function byteToKb(bytes?: number | null): string {
  if (bytes == null || bytes <= 0) return "0";  
  return `${(bytes / 1000).toFixed(2)}`;
}

export function msToHuman(ms?: number | null) {
    if (!ms || ms <= 0) return "-";
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

const FetchColumnDetail = () => {
    const [ColumnUUID, SetColumnUUID] = useState([]);
    const [ColumnObject, SetColumnObject] = useState([]);
    const [ColumnMasstech_column, SetColumnMasstech_column] = useState([]);
    const [ColumnInstance, SetColumnInstance] = useState([]);
    const [ColumnReport, SetColumnReport] = useState([]);
    const [nonActiveInstance, SetnonActiveInstance] = useState<number>(1);
    const [Downloadbtn, setReportsbtn] = useState<typeof import("xlsx") | any>(null);
    const [DownloadPannel, setReportsPannel] = useState<typeof import("xlsx") | any>(null);
    const Dispatch = useDispatch()

    const getCelldetail = (props: any, header: any, alignText: string) => {

        if (header === "migrationSizeProgressPercent") {
            return (<div className="py-1"><Progress value={props.getValue()} className="flex justify-center" /></div>)

        } else if (header === "migrationCountProgressPercent") {
            return (<div className="py-1"><Progress value={props.getValue()} className="flex justify-center" /></div>)
        } else if (header === "SlugName") {
            return (
                <CopyCell
                    value={props.getValue()}
                    className={`tableHeaderSize ${alignText}`}
                />
            )
        }
        else if (header === "ClipName") {
            return (<CopyCell
                value={props.getValue()}
                className={`tableHeaderSize ${alignText}`}
            />
            )
        }
        else if (header === "priority") {
            const uuid = props.row.original?.UUID; // your data uses UUID in table.tsx interface
            const value = Number(props.getValue() ?? 0);

            const meta: any = props.table.options.meta;
            const isEditing = meta?.editingUuid === uuid;

            // loading rows safety
            if (!uuid) return <span className={`tableHeaderSize ${alignText}`}>-</span>;

            if (!isEditing) {
                return (
                    <div className={`flex items-center gap-2 ${alignText}`}>
                        <button
                            type="button"
                            onClick={async () => {
                                // if another row is currently being edited -> save it first
                                const prevUuid = meta?.editingUuid;
                                if (prevUuid && prevUuid !== uuid) {
                                    try {
                                        await meta.updatePriority(prevUuid, meta.priorityDraft);
                                    } catch (e) {
                                        // if save fails, don't switch row (optional)
                                        return;
                                    }
                                }

                                // now start editing this row
                                meta.setEditingUuid(uuid);
                                meta.setPriorityDraft(value);
                            }}
                            className="text-xs px-2 py-1 border rounded odd:border-[#171f29] even:border-[#2d3d52]"
                            title="Edit Priority"
                        >
                            <FaEdit color="#9298fb" size={15} />
                        </button>
                        <span className="tableHeaderSize">{value}</span>
                    </div>
                );
            }

            return (
                <div className={`flex items-center gap-2 ${alignText}`}>
                    <input
                        type="number"
                        className="w-22 h-8 px-2 py-1 border rounded bg-transparent"
                        value={meta.priorityDraft}
                        autoFocus
                        min={0}
                        max={100}
                        onChange={(e) => meta.setPriorityDraft(Number(e.target.value))}
                        onBlur={() => {
                            if (meta?.editingUuid === uuid) meta.updatePriority(uuid, meta.priorityDraft);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") meta.updatePriority(uuid, meta.priorityDraft);
                            if (e.key === "Escape") meta.setEditingUuid(null);
                        }}
                        disabled={meta.savingPriority}
                    />

                </div>
            );
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
        else if (header === "health") {
            const lastUpdate = new Date(props.row.original.lastupdatedDate).getTime();
            const now = Date.now(); 

            const diffHours = (now - lastUpdate) / (1000); 

            let color = "";
            let label = "";

            if (diffHours <= nonActiveInstance) {
                color = "text-green-400 animate-[greenPulse_2s_ease-in-out_infinite]";
                label = "Healthy";
            } else if (diffHours <= 86400) {
                color = "text-red-500 animate-[redPulse_2s_ease-in-out_infinite]";
                label = "Not Active";
            } else {
                color = "text-gray-400 animate-[grayPulse_2s_ease-in-out_infinite]";
                label = "Offline (>24h)";
            }

            return (
                <FaCircle
                    className={`inline-block h-3 w-3 ${color}`}
                    title={label}
                />
            );
        }
        else if (header === "drive_tid") {
            return (
                <span  >
                    {safe(props.row.original.driveNB)} / {safe(props.row.original.tlID)}
                </span>
            );
        }
        else if (header === "currentTapeThroughput") {
            return (
                <span className="tabular-nums">{(Number(props.getValue() ?? 0).toFixed(0))} </span>
            );
        }
        else if (header === "sizeTransferCurrentTape") {
            return (
                <span className="tabular-nums">{bytesToGB(Number(props.getValue() ?? 0))}</span>
            );
        }
        else if (header === "durationCurrentTapeMS") {
            return (
                <span className="tabular-nums">{msToHuman(Number(props.getValue() ?? 0))}</span>
            );
        }
        else if (header === "sizeKB") {
            return (
                <span className="tabular-nums">{byteToKb(Number(props.getValue() ?? 0))}</span>
            );
        }
        else if (header === "instanceSizeBytes") {
            return (
                <span className="tabular-nums">{byteToKb(Number(props.getValue() ?? 0))}</span>
            );
        }
        else if (header === "lastupdatedDate") {
            const d = new Date(String(props.getValue()));
            return (
                <span >{isNaN(d.getTime()) ? "-" : d.toLocaleString()}</span>
            );
        }
        else {
            // return (<span title={props.getValue()} className={`tableHeaderSize wrapword ${alignText}`}>{props.getValue()}</span>)
            return (
                <CopyCell
                    value={props.getValue()}
                    className={`tableHeaderSize wrapword ${alignText}`}
                />
            )
        }
    }

    useEffect(() => { 
        axios({
            method: "Get",
            url: './config.json',
            headers: {
                "Cache-Control": "no-cache"
            }
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
            const ColumnInstance = response?.data?.InstanceDashBoard.map((value: any) => {
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
            SetColumnInstance(ColumnInstance);
            setReportsbtn(response.data.ReportColumns);
            setReportsPannel(response.data.reportPanel);
            Dispatch(ipAddressStore(response.data.apiUrl));
            Dispatch(reshedularSelection(response.data.reshedularSelection));
            Dispatch(nonActiveInstances(response.data.nonActiveInstance));
            Dispatch(reportType(response.data.reportType));
            SetnonActiveInstance(response.data.nonActiveInstance);
        }).catch(error => {
            console.log(error, "error in Config File")
        });

    }, [nonActiveInstance]);

    return { ColumnUUID, ColumnObject, ColumnMasstech_column, Downloadbtn, ColumnReport, DownloadPannel, ColumnInstance };
}

export default FetchColumnDetail