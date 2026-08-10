import axios from "axios";
import { useCallback } from "react";
import {
    Menu,
    Item,
    contextMenu,
} from "react-contexify";

import "react-contexify/dist/ReactContexify.css";
import { MdRestore } from "react-icons/md";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "@/Redux/Store";


interface props {
    MENU_ID: any
    Rescheduled: any,
    refetch: any,
    SetMultipleRowsSelection: any,
}

export default function ContextRight({ MENU_ID, Rescheduled, refetch, SetMultipleRowsSelection }: props) {
    const ipAddress = useSelector((state: RootState) => state.tableDownClick.ipAddressStore);
    const apiPort = useSelector((state: RootState) => state.tableDownClick.apiPort);

    const runRuleProcesApi = useCallback(async (e: any) => {
        const body = {
            "filter": Rescheduled
        }
        // console.log(Rescheduled, "Schedualar")
        await axios({
            method: 'post',
            url: `http://${ipAddress}:${apiPort}/objects/reshedulerulejobs`,
            data: body,
        }).then(response => {
            toast(
                `Your Request Rescheduled`
            )
            refetch();
            SetMultipleRowsSelection([])
            contextMenu.hideAll();
        }).catch(error => {
            console.log("Error In Post Data", error);
            toast.error("Error In Data", {
                style: {
                    background: "#ef4444", // Tailwind red-500
                    color: "#fff",
                },
            });
            contextMenu.hideAll();
        });
    }, [Rescheduled])


    const isRescheduleDisabled =
        !Rescheduled?.length ||
        Rescheduled.some((row: any) => row.status !== "DECODE_FAILED");

    const ALLOWED_RETRY_STATUSES = [
        "MIGRATION_FAILED",
        "ARCHIVE_TRIGGER_FAILED",
    ];

    const isretryDisabled =
        !Rescheduled?.length ||
        Rescheduled.some(
            (row: any) => !ALLOWED_RETRY_STATUSES.includes(row.status)
        );


    return (
        <Menu id={MENU_ID} className="font-medium">
            <Item onClick={(e) => {
                runRuleProcesApi(e);
            }}

                disabled={isRescheduleDisabled} className="z-50"
            >
                <MdRestore className="mr-2" />     Rescheduled
            </Item>
            <Item onClick={(e) => { runRuleProcesApi(e) }}
                disabled={isretryDisabled}
            >
                <MdRestore className="mr-2" />     Retry Archive
            </Item>
        </Menu>
    )
}
