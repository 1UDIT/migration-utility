import axios from "axios";
import { useCallback } from "react";
import {
    Menu,
    Item,
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
    setRescheduled: any,
    setActiveCursor: any, SetMultipleRowsSelection: any, displayMenu: any
}

export default function ContextRight({ MENU_ID, Rescheduled, refetch, setRescheduled, setActiveCursor, SetMultipleRowsSelection, displayMenu }: props) {
    const queryClient = useQueryClient();
    const ipAddress = useSelector((state: RootState) => state.tableDownClick.ipAddressStore);

    const runRuleProcesApi = useCallback(async (e: any) => {
        const body = {
            "filter": Rescheduled
        }
        console.log(Rescheduled, "Schedualar")
        await axios({
            method: 'post',
            url: `http://${ipAddress}:4000/objects/reshedulerulejobs`,
            data: body,
        }).then(response => {
            toast(
                `Your Request Rescheduled`
            )
            queryClient.invalidateQueries({ queryKey: ["uuidData"] });
            SetMultipleRowsSelection([])
        }).catch(error => {
            console.log("Error In Post Data", error);
        });
    }, [Rescheduled])

    // migration_failed = retry archive make it migration_complete 
    // decoded_failed = reshedular make it Decoded_complete     in right click

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
            <Item onClick={(e) => { runRuleProcesApi(e) }}
                disabled={isRescheduleDisabled}
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