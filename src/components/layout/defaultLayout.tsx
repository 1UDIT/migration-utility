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
import { useCallback, useEffect, useState, type ReactNode } from "react";
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
import Filters from "../Filter/Filters";
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
]



interface AppSidebarProps {
    children: ReactNode;
}


export function DefaultLayout({ children }: AppSidebarProps) {
    const [name, setName] = useState<string>('Dashboard');
    const userName = useSelector((state: RootState) => state.tableDownClick.userName);
    const navigate = useNavigate();

    const location = useLocation();


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



    return (
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
                                        <User2 /> {userName}
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
                    </nav>
                </header>
                <main className="flex-1 flex flex-col bg-[#1a222c] overflow-hidden">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    )
}