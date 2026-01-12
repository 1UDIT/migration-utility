import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";
import { MdOutlineCancel } from "react-icons/md";
import { format, endOfYesterday } from "date-fns";
import { toast } from 'sonner';
import { useQueryClient } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import { useSelector } from "react-redux";
import type { RootState } from "@/Redux/Store";
import FetchColumnDetail from "@/components/Column/FetchColumnDetail";

type ReportType =
    | "TODAY_REPORT"
    | "OBJECT_LIST"
    | "TOTAL_MIGRATED"
    | "TOTAL_MIGRATED_TILL_DATE"
    | "Query_Daily_Trend_TB_ACS"
    | 'Yesterday_report';

interface DateInterface {
    from: Date; // Assuming the dates are in string format
    to: Date;
}

const numberOfMonths = 1;
const dateFormat = "LLL dd, y";
const dateStart = endOfYesterday();
const initialDateRange: DateInterface = {
    from: dateStart,
    to: new Date(),
};


const contentWidthClass =
    numberOfMonths > 1 ? 'w-[500px] max-w-[95vw]' : 'w-[320px] max-w-[95vw]';

export default function ReportPanel() {
    const [type, setType] = useState<ReportType>("TODAY_REPORT");
    const [date, setDate] = useState<DateInterface>(initialDateRange);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [XLSX, setXLSX] = useState<typeof import("xlsx") | null>(null);
    const queryClient = useQueryClient();
    const ipAddress = useSelector((state: RootState) => state.tableDownClick.ipAddressStore);
    const { DownloadPannel } = FetchColumnDetail();
    const [selectedTypes, setSelectedTypes] = useState<ReportType[]>(["TODAY_REPORT"]);

    const toggleType = (t: ReportType) => {
        setSelectedTypes(prev =>
            prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
        );
    };


    useEffect(() => {
        (async () => {
            const xlsxModule = await import("xlsx");
            setXLSX(xlsxModule);
        })();
    }, []);

    // const sheetNameMap: Record<ReportType, string> = {
    //     TODAY_REPORT: "Today Report",
    //     OBJECT_LIST: "Object List",
    //     TOTAL_MIGRATED: "Total Migrated",
    //     TOTAL_MIGRATED_TILL_DATE: "Migrated Till Date",
    //     Query_Daily_Trend_TB_ACS: "Daily Trend TB ACS",
    //     Yesterday_report: "Yesterday Report",
    // };

    // const safeSheetName = (name: string) =>
    //     name.replace(/[\\/?*[\]:]/g, "").slice(0, 31); // Excel rules

    const getFileNameFromDisposition = (cd: string | null, fallback: string) => {
        if (!cd) return fallback;
        const m = /filename\*?=(?:UTF-8'')?"?([^"]+)"?/i.exec(cd);
        return m?.[1] ? decodeURIComponent(m[1]) : fallback;
    };
 
    const submit = async () => {
        try {
            if (!selectedTypes.length) {
                toast("Please select at least one report");
                return;
            }
            const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

            toast("Your Request Submitted");


            const body: any = { reportType: selectedTypes };



            // ✅ SPECIAL CASE: backend returns XLSX with chart

            const endpoint = `http://${ipAddress}:4000/Report/DownloadReport`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const msg = await res.text().catch(() => "");
                throw new Error(msg || `Chart report failed: HTTP ${res.status}`);
            }

            const blob = await res.blob();
            const filename = getFileNameFromDisposition(
                res.headers.get("content-disposition"),
                `Daily_Trend_${today}.xlsx`
            );

            saveAs(blob, filename); 

        } catch (err) {
            console.error("❌ Multi DownloadReport failed:", err);
            toast("Download Report failed");
        }
    };

    // const clear = () => {
    //     setIsPopoverOpen(false);
    //     setDate(initialDateRange);
    // };


    // const handleSelect = (date: DateRange | Date | undefined) => {
    //     if (!date) return;

    //     console.log("Date selected in handleSelect:", date);

    //     if (date instanceof Date) {
    //         setDate({ from: date, to: date });
    //     } else if ('from' in date && 'to' in date && date.from && date.to) {
    //         setDate({ from: date.from, to: date.to });
    //     }
    // };

    return (
        <aside
            className="
        h-full
        w-full 
        md:sticky md:top-[52px]
        h-auto md:h-[calc(100vh-52px)]
        bg-[#18212b]
        border-l border-white/10
      "
        >
            {/* Header */}
            <div className="bg-[#bd5252] text-slate-50 px-4 py-3 font-semibold text-center">
                Report Panel
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                {/* Options - responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
                    <ReportCard
                        title="Today Report"
                        desc="Generate report for today only"
                        active={selectedTypes.includes("TODAY_REPORT")}
                        onClick={() => toggleType("TODAY_REPORT")}
                    />
                    <ReportCard
                        title="Yesterday Report"
                        desc="Generate report for Yesterday only"
                        active={selectedTypes.includes("Yesterday_report")}
                        onClick={() => toggleType("Yesterday_report")}
                    />
                    <ReportCard
                        title="Object List Report"
                        desc="Download object list "
                        active={selectedTypes.includes("OBJECT_LIST")}
                        onClick={() => toggleType("OBJECT_LIST")}
                    />
                    <ReportCard
                        title="Total Migrated Content"
                        desc="Total migrated content list"
                        active={selectedTypes.includes("TOTAL_MIGRATED")}
                        onClick={() => toggleType("TOTAL_MIGRATED")}
                    />
                    {/* <ReportCard
                        title="Total Migrated Content Till Date"
                        desc="Total migrated"
                        active={selectedTypes.includes("TOTAL_MIGRATED_TILL_DATE")}
                        onClick={() => toggleType("TOTAL_MIGRATED_TILL_DATE")}
                    /> */}
                    <ReportCard
                        title="Query Daily Trend (TB) ACS"
                        desc="Query for Daily trend of TB transferred base on ACS so far summary"
                        active={selectedTypes.includes("Query_Daily_Trend_TB_ACS")}
                        onClick={() => toggleType("Query_Daily_Trend_TB_ACS")}
                    />
                </div>

                {/* Extra field only when needed */}
                {/* {type === "TOTAL_MIGRATED_TILL_DATE" && (
                    <div className="space-y-2">
                        <label className="text-sm text-white/80">Select date</label>
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <div className="w-full flex items-center
                                            h-8 px-2
                                            bg-[#2d3d52]
                                            border border-orange-500
                                            rounded-md
                                            text-white"
                            >
                                <PopoverTrigger asChild>
                                    <Button id="date"
                                        className="flex-1 justify-start
                                                    text-white text-sm
                                                    bg-transparent hover:bg-transparent
                                                    px-1 py-0 h-8"
                                    > 
                                        <span className="truncate wrapword tableHeaderSize">
                                            {format(date.from!, dateFormat)} -{' '}
                                            {format(date.to!, dateFormat)}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <MdOutlineCancel className="ml-auto h-5 w-5 text-white cursor-pointer hover:text-orange-400 shrink-0" onClick={clear} />
                            </div>


                            <PopoverContent
                                align="center"
                                className={`p-2 bg-[#020517] border border-orange-500 rounded-lg shadow-md ${contentWidthClass}`}
                            >
                                <Calendar
                                    mode="range"
                                    numberOfMonths={1}
                                    selected={{ from: new Date(date.from), to: new Date(date.to) } as DateRange}
                                    onSelect={handleSelect}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )} */}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 pt-2">
                    <Button className="w-full" onClick={submit}>
                        Generate
                    </Button>
                    <Button className="w-full" variant="secondary" onClick={() => setSelectedTypes(["TODAY_REPORT"])}>
                        Reset
                    </Button>

                </div>
            </div>
        </aside>
    );
}

function ReportCard({
    title,
    desc,
    active,
    onClick,
}: {
    title: string;
    desc: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        text-left rounded-lg p-3 transition
        border-2
        ${active ? "border-[#ff6b6b] bg-white/5" : "border-white/10 hover:bg-white/5"}
      `}
        >
            <div className="text-sm font-semibold text-white">{title}</div>
            <div className="text-xs text-white/60 mt-1">{desc}</div>
        </button>
    );
}
