


import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { toast } from 'sonner';
import { useSelector } from "react-redux";
import type { RootState } from "@/Redux/Store";
import { NavLink, useLocation } from "react-router";
import { Button } from "../ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { fetchData } from "@/Pages/Object_Details/HandleApiCall/Apicall";
import FetchColumnDetail from "../Column/FetchColumnDetail";
const basePath = import.meta.env.BASE_URL;

const items = [

    {
        title: "Object Detail",
        url: "/",
    },
    {
        title: "Uuid Detail",
        url: "/uuid",
    },
    {
        title: "Masstech-Object Detail",
        url: "/masstech",
    },
    {
        title: "Report",
        url: "/reportViewer",
    },
    {
        title: "Instance View",
        url: "/InstanceView",
    },
]

interface AppSidebarProps {
    children: ReactNode;
}

export function DefaultLayout({ children }: AppSidebarProps) {
    const [name, setName] = useState<string>('Dashboard');
    const queryClient = useQueryClient();
    const Body = useSelector((state: RootState) => state.tableDownClick.paginationStore);
    const location = useLocation();
    const [XLSX, setXLSX] = useState<typeof import("xlsx") | null>(null);
    const { Downloadbtn } = FetchColumnDetail();
    const ipAddress = useSelector((state: RootState) => state.tableDownClick.ipAddressStore);
    const reportType = useSelector((state: RootState) => state.tableDownClick.reportType);
    const [open, setOpen] = useState<boolean>(false);
    const [downloadChoice, setDownloadChoice] = useState<"OBJECT_LIST" | "CHECKSUM" | "Report">("OBJECT_LIST");

    useEffect(() => {
        locationName();
    }, [location]);

    const locationName = () => {
        switch (location.pathname) {
            case `/`:
                return setName('Object List')
            case `/uuid`:
                return setName('Uuid List')
            case `/masstech`:
                return setName('Masstech List')
            case `/reportViewer`:
                setDownloadChoice("Report")
                return setName('Report')
            case `/InstanceView`: 
                return setName('Running Instances')
            default:
                break;
        }
    }

    useEffect(() => {
        (async () => {
            const xlsxModule = await import("xlsx");
            setXLSX(xlsxModule);
        })();
    }, []);

    const getFileNameFromDisposition = (cd: string | null, fallback: string) => {
        if (!cd) return fallback;
        const m = /filename\*?=(?:UTF-8'')?"?([^"]+)"?/i.exec(cd);
        return m?.[1] ? decodeURIComponent(m[1]) : fallback;
    };

    const DownloadReport = useCallback(async (nameUrl: string) => {
        console.log("downloadChoice", downloadChoice)
        try {
            if (downloadChoice === "OBJECT_LIST") {

                const ReportsColumn = nameUrl === "Object List" ? [...Downloadbtn?.Objectlist] : [...Downloadbtn?.UUID];
                console.log("📥 Generating report...", nameUrl,);

                // Ensure XLSX is loaded
                const xlsx = XLSX ?? (await import("xlsx"));
                if (!XLSX) setXLSX(xlsx);

                if (!Array.isArray(ReportsColumn) || ReportsColumn.length === 0) {
                    console.error("No columns found in config.json → `columns` missing/empty.");
                    return;
                }


                // Fetch “all” data with a stable key; your fetcher can ignore pageSize
                const response = await queryClient.fetchQuery({
                    queryKey: ["uuidData", "all", Body],
                    queryFn: async ({ signal }) => {
                        const endpoint = `http://${ipAddress}:4000/${nameUrl === 'Object List' ? "objects" : "uuids"}?page=0&limit=0`;
                        return fetchData(endpoint, "POST", Body, signal);
                    },
                    staleTime: 0,
                });

                // Normalise payload: accept {data:[...]} or plain array
                const payload = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.data)
                        ? response.data
                        : Array.isArray(response?.data?.data)
                            ? response.data.data
                            : [];

                if (payload.length === 0) {
                    console.error("No data available to export.");
                    return;
                }

                // Sort columns by Order (from config.json)
                const sortedColumns = [...ReportsColumn].sort(
                    (a: any, b: any) => (a?.Order ?? 0) - (b?.Order ?? 0)
                );

                // Build the sheet rows using dataKey from config
                const mainHeaders: string[] = sortedColumns.map((c: any) => String(c.header ?? ""));
                const rows: any[][] = payload.map((item: any) =>
                    sortedColumns.map((c: any) => item?.[c.dataKey])
                );

                // Header block (you can customise as needed)
                const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
                const detailHeaders = ["Total Object", "Generated Date"];
                const detailRow = [String(payload.length), today];

                // Assemble worksheet (AOA)
                const wsData: any[] = [];
                wsData.push(detailHeaders);
                wsData.push(detailRow);
                wsData.push([]); // empty line
                wsData.push(mainHeaders);
                rows.forEach(r => wsData.push(r));

                // Auto column widths
                const colWidths: number[] = wsData[3].map((_: any, colIdx: number) =>
                    Math.max(
                        ...wsData.map((row: any[]) => {
                            const v = row?.[colIdx];
                            return v == null ? 0 : String(v).length;
                        })
                    )
                );
                const cols = colWidths.map(w => ({ wch: w + 2 }));

                const ws = xlsx.utils.aoa_to_sheet(wsData);
                (ws as any)["!cols"] = cols;

                const wb = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(wb, ws, "Data Sheet");

                const wbout = xlsx.write(wb, { bookType: "xlsx", type: "binary" });
                const buf = new ArrayBuffer(wbout.length);
                const view = new Uint8Array(buf);
                for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xff;

                saveAs(new Blob([buf], { type: "application/octet-stream" }), `${nameUrl === 'Object List' ? "objects" : "uuids"} Data Report_${today}.xlsx`);
                console.log("✅ Report generated");
                return "Migration Data Report";
            }
            else if (downloadChoice === "CHECKSUM") {
                const endpoint = `http://${ipAddress}:4000/objects/checkSumDownloader`;
                const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(Body)
                });

                if (!res.ok) {
                    const msg = await res.text().catch(() => "");
                    throw new Error(msg || `Chart report failed: HTTP ${res.status}`);
                }

                const blob = await res.blob();
                const filename = getFileNameFromDisposition(
                    res.headers.get("content-disposition"),
                    `CheckSumDetail_${today}.xlsx`
                );
                saveAs(blob, filename);
                return filename;
            }
            else {
                const body: any = {
                    reportType: reportType
                };
                const endpoint = `http://${ipAddress}:4000/Report/DownloadReport`;
                const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
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
                    `Yesterday Transfer.zip`
                );

                saveAs(blob, filename);
                return filename;
            }
        }
        catch (err) {
            console.error("❌ DownloadReport failed:", err);
            throw err; // ❌ IMPORTANT
        }
    }, [Body, Downloadbtn, downloadChoice]);

    const handleDialogDownload = useCallback(() => {
        const choiceName = downloadChoice === "OBJECT_LIST" ? "Object List" : "CHECKSUM";

        toast.promise(DownloadReport(choiceName), {
            loading: downloadChoice === "OBJECT_LIST"
                ? "Generating Object List XLSX..."
                : "Downloading checksum report...",
            success: (fileName) => `${fileName} downloaded`,
            error: (err) => err?.message || "❌ Report download failed",
        });

        setOpen(false);
    }, [downloadChoice, DownloadReport]);



    return (
        <>
            <SidebarProvider>
                <Sidebar className="bg-[#24303f] text-base font-medium">
                    {/* Logo */}
                    <div className="block m-auto p-auto pt-2">
                        <img
                            src={`${basePath}img/Logo.png`}
                            alt="logo"
                            style={{ width: "100%", height: "65px" }}
                            loading="lazy"
                            onError={(e) => {
                                const fallbackSrc = `${basePath}img/logo.png`;
                                const transparent = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

                                if (!e.currentTarget.src.endsWith("logo.png")) {
                                    e.currentTarget.src = fallbackSrc;
                                } else {
                                    e.currentTarget.src = transparent; // keeps space stable, no flicker
                                }
                            }}

                        />

                    </div>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                size="lg"
                                                className="text-xl"
                                                variant={location.pathname === item.url ? "outline" : "default"}
                                            >
                                                <NavLink
                                                    to={item.url} className={"text-white"}>
                                                    <span>{item.title}</span>
                                                </NavLink>

                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}

                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarHeader />

                </Sidebar>
                <SidebarInset className="h-screen flex flex-col overflow-hidden">
                    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 bg-[#24303f] w-full">
                        <SidebarTrigger className="-ml-1 text-white" />
                        <Separator orientation="vertical" className="mr-2 h-full bg-[#727272]" />
                        <nav className="flex justify-between w-full">
                            <Breadcrumb className="flex-rows flex">
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block text-white font-bold">
                                        <BreadcrumbLink>{name}</BreadcrumbLink>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                            <Button
                                disabled={name === 'Masstech List' ||name ===  'Running Instances'}
                                onClick={() => {
                                    name === "Report" || name === 'Uuid List' ? toast.promise(
                                        DownloadReport(name),
                                        {
                                            loading: "Generating XLSX report...",
                                            success: (fileName) => `${fileName} downloaded`,
                                            error: (err) => err.message || "❌ Report download failed",
                                        }
                                    ) : setOpen(true)
                                }}
                                className="
                                    hidden md:block
                                    text-white font-semibold shadow-lg
                                    bg-[#007BFF] border-2 border-red-500
                                    rounded-md hover:bg-[#005aaf]
                                    disabled:cursor-not-allowed
                                    "
                                variant="ghost"
                            >
                                Download Report
                            </Button>

                        </nav>
                    </header>
                    <main className="flex-1 flex flex-col bg-[#1a222c] overflow-hidden">{children}</main>
                </SidebarInset>
            </SidebarProvider >

            {open === true ? (
                <Dialog onOpenChange={() => setOpen(!open)} open={open} modal={open}>
                    <DialogContent>
                        <DialogHeader className="pb-4">
                            <DialogTitle className="text-white">Download</DialogTitle>
                            <DialogDescription className="text-gray-300">
                                Choose what you want to download.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-auto">
                            <RadioGroup
                                value={downloadChoice}
                                onValueChange={(v) => setDownloadChoice(v as any)}
                                className="grid gap-3"
                            >
                                <div className="flex items-center gap-3 rounded-md border border-gray-600 p-3">
                                    <RadioGroupItem value="OBJECT_LIST" id="opt-object" />
                                    <Label htmlFor="opt-object" className="text-white cursor-pointer">
                                        Object List (XLSX)
                                    </Label>
                                </div>
                                <div className="flex items-center gap-3 rounded-md border border-gray-600 p-3">
                                    <RadioGroupItem value="CHECKSUM" id="opt-checksum" />
                                    <Label htmlFor="opt-checksum" className="text-white cursor-pointer">
                                        Checksum Report
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <DialogFooter className="sm:justify-center pt-2 gap-2">
                            <Button
                                type="button"
                                size="lg"
                                className="bg-[#007BFF] text-white rounded-md border border-black relative text-sm px-8 py-2 hover:bg-[#005aaf]"
                                onClick={handleDialogDownload}
                            >
                                Download
                            </Button>

                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    size="lg"
                                    className="bg-[#d94040] text-white rounded-md border border-black relative text-sm px-8 py-2"
                                >
                                    Close
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}

        </>
    )
}