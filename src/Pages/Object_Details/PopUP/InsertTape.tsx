import { Button } from "@/components/ui/button"
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogDescription
} from "@/components/ui/dialog"
import { useQuery, useQueryClient } from "@tanstack/react-query"; 
import { useSelector } from "react-redux"; 
// import { fetchData } from "../reactTable/FetchList"; 
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import styled from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import type { RootState } from "@/Redux/Store";
import { fetchData } from "../HandleApiCall/Apicall";


const escapeContentValue = (value: string) => {
    return value?.replace(/\\/g, '\\\\');
};

interface openProps {
    setInsertTape: React.Dispatch<React.SetStateAction<boolean>>
}

const CustomDiv = styled('div').withConfig({
    shouldForwardProp: (prop) => isPropValid(prop),
}) <{ contentvalue: string }>`
    // position: relative;
    &::after {
      content: '${(props: any) => escapeContentValue(props.contentvalue)}';
      color: #a2e9ff; 
    //   position: absolute;
      right: 0;
      top: 25px;
      font-size: 12px;
      font-weight: 700;
      width: max-content;
      white-space: nowrap;
    }`;

export default function TapeInsert({ setInsertTape }: openProps) {  
    const ipAddress = useSelector((state: RootState) => state.tableDownClick.ipAddressStore);
    const queryClient = useQueryClient();
    const [agentName, setAgentName] = useState<{ agentName: string; acs: string; ip: string; port: string } | null>(null);
    const [agentNameSelected, setAgentNameSelected] = useState<boolean>(true);
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['getLtoAgents', ipAddress],
        queryFn: async ({ signal }) => {
            const endpoint = `http://${ipAddress}:4000/getLtoAgents`;
            // return fetchData(endpoint, "GET", '', signal);
             return fetchData(endpoint, "GET", "", signal);
        },
        networkMode: 'always',
        retry: false
    });

    
    useEffect(() => {
        if (data?.data?.length > 0) {
            setAgentName({ agentName: data?.data[0].acs_name, acs: data?.data[0].acsID, ip: data?.data[0].ip, port: data?.data[0].port });
        }
    }, [data, isLoading]);
    
    console.log("agentName",agentName)


    const insertApiCaller = useCallback(async () => {
        console.log(agentName, "DATA");
        // const endpoint = state === "offline" ? "eject" : "insert";
        if (agentName?.agentName.length === 0) {
            toast.error("Please select Robot Manager");
            return;
        }
        try {
            await axios({
                method: "post",
                url: `http://${ipAddress}:7001/internal/api/insert`,
                data: agentName, 
            });

            toast(`${agentName?.agentName} has been submitted successfully`);
            queryClient.invalidateQueries({ queryKey: ["rundown"] });
        } catch (error) {
            console.log("Error In Post Data", error);
            toast(`Error In API call`);
        }
    }, [ipAddress,  agentName, data, agentNameSelected]);


    return (
        <DialogContent className="sm:max-w-[30rem] max-w-[90%] bg-[#1e1e2f] border border-gray-700 shadow-lg p-2"
            onOpenAutoFocus={(e) => e.preventDefault()} onEscapeKeyDown={() => setInsertTape(false)}
            onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader className="h-10">
                <DialogTitle className="text-white lg:text-start text-start border-b border-white pb-2">Insert Tape</DialogTitle>
            </DialogHeader>
                         
            <div className="px-2 py-2">
                <div className="flex items-center gap-3">
                    <span className="w-1/3 text-sm text-slate-200">Robot Manager</span>

                    <select
                        className="w-2/3 h-9 bg-[#24303f] border border-[#4979e5] rounded-md text-white px-2
                 outline-none focus:ring-2 focus:ring-[#4979e5]/60"
                        onChange={(e) => {
                            const selected = data[Number(e.target.value)];
                            if (!selected) return;
                            setAgentNameSelected(true)
                            setAgentName({
                                agentName: selected.acs_name,
                                acs: selected.acsID,
                                ip: selected.ip,
                                port: selected.port,
                            });
                        }}
                        defaultValue={0} // pick first by default
                    >
                        {data?.data?.map((value: any, idx: number) => (
                            <option key={value.acs_name} value={idx} className="bg-[#24303f]">
                                {value.acs_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* helper row aligned with the select */}
                <div className="flex mt-1">
                    <div className="w-1/3" />
                    <div className="w-2/3 text-[12px] font-semibold text-[#7fe3ff] px-4">
                        {agentName
                            ? `Acs: ${agentName.acs}; Ip: ${agentName.ip}; Port: ${agentName.port}`
                            : ""}
                    </div>
                </div>
            </div>

            <DialogFooter className="sm:justify-end px-2 py-1.5">
                <Button className="rounded-md border text-sm px-2 py-1 bg-[#4979e5] text-white" onClick={() => { setInsertTape(false); insertApiCaller() }}>Submit</Button>
            </DialogFooter>
        </DialogContent >
    )
}
