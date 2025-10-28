import { ChevronDown, ChevronUp, User2 } from "lucide-react"
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
import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSelector } from "react-redux";
import type { RootState } from "@/Redux/Store";
import { NavLink, useLocation, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { saveAs } from "file-saver";

import { fetchData } from "@/Pages/Object_Details/HandleApiCall/Apicall";
import axios from "axios";
const basePath = import.meta.env.BASE_URL;

const items = [

    {
        title: "Object Detail",
        url: "/Object",
    },
    {
        title: "Uuid Detail",
        url: "/uuid",
    },
]



interface AppSidebarProps {
    children: ReactNode;
}


export function DefaultLayout({ children }: AppSidebarProps) {
    const [name, setName] = useState<string>('Dashboard');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const Body = useSelector((state: RootState) => state.tableDownClick.paginationStore);
    const location = useLocation();
    const [XLSX, setXLSX] = useState<typeof import("xlsx") | null>(null);
    const [ReportsColumn, setReportsColumn] = useState<typeof import("xlsx") | null>(null);

    useEffect(() => {
        locationName();
    }, [location]);

    const signOut = useCallback(() => {
        sessionStorage.clear();
        navigate("/");
    }, [])

    const locationName = () => {
        switch (location.pathname) {
            case `/`:
                return setName('Object List')
            case `/uuid`:
                return setName('Uuid List')
            default:
                break;
        }
    }

    // Load config.json to get API base URL
    useEffect(() => {
        axios
            .get('./config.json')
            .then((response) => {
                setReportsColumn(response.data.columns);
            })
            .catch((err) => {
                console.error('Error loading config.json:', err);
            });
    }, []);

    useEffect(() => {
        (async () => {
            const xlsxModule = await import("xlsx");
            setXLSX(xlsxModule);
        })();
    }, []);


    const DownloadReport = useCallback(async () => {
        try {
            // Ensure XLSX is loaded
            const xlsx = XLSX ?? (await import("xlsx"));
            if (!XLSX) setXLSX(xlsx);

            if (!Array.isArray(ReportsColumn) || ReportsColumn.length === 0) {
                console.error("No columns found in config.json → `columns` missing/empty.");
                return;
            }

            console.log(Body,"body")

            // Fetch “all” data with a stable key; your fetcher can ignore pageSize
            const response = await queryClient.fetchQuery({
                queryKey: ["uuidData", "all", Body],
                 queryFn: async ({ signal }) => {
                    const endpoint = `http://localhost:4000/uuids?page=0&limit=`;
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

            saveAs(new Blob([buf], { type: "application/octet-stream" }), `Migration Data Report_${today}.xlsx`);
            console.log("✅ Report generated");

        } catch (err) {
            console.error("❌ DownloadReport failed:", err);
        }
    },[Body]);



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
                    {/* Sidebar Footer - Admin Dropdown */}
                    <SidebarFooter>
                        <SidebarMenu className="text-white">
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton className="text-xl">
                                            <User2 />
                                            <ChevronUp className="ml-auto" />
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width] text-white">
                                        <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>

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
                            {
                                name === "Uuid List" &&
                                <Button onClick={() => DownloadReport()}
                                    className="hidden md:block text-[#FFFFFF] font-semibold shadow-lg bg-[#007BFF] border-2 border-[#ff0000] rounded-md hover:bg-[#339CFF]" variant={"ghost"}>
                                    <span>Download Report</span>
                                </Button>
                            }
                        </nav>
                    </header>
                    <main className="flex-1 flex flex-col bg-[#1a222c] overflow-hidden">{children}</main>
                </SidebarInset>
            </SidebarProvider>

        </>
    )
}