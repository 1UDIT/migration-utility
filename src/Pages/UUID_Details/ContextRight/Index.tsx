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
import { FaCircle } from "react-icons/fa";

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
    const apiPort = useSelector((state: RootState) => state.tableDownClick.apiPort);
    const hasOnline = Rescheduled.some(item => item?.isOnline === 1);
    const hasOffline = Rescheduled.some(item => item?.isOnline === 0);
    const hasMT = Rescheduled.filter(item => item?.mediaType?.startsWith("MT"));

    const disableItem = hasOnline && hasOffline || hasMT.length > 0;
    // console.log(disableItem, "Disable Item", hasMT)

    const runRuleProcesApi = useCallback(async (e: any) => {
        const body = {
            "filter": Rescheduled
        }
        // console.log(Rescheduled, "Schedualar")
        await axios({
            method: 'post',
            url: `http://${ipAddress}:${apiPort}/uuids/reshedulerulejobs`,
            data: body,
        }).then(response => {
            toast(
                `Your Request Rescheduled`
            )
            queryClient.invalidateQueries({ queryKey: ["uuidData"] });
            SetMultipleRowsSelection([]);
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

    const updateOnlineStatus = useCallback(async (e: any) => {
        const formattedData = Rescheduled.map((item: any) => ({
            UUID: item.UUID, // make sure this exists in your data
            isOnline: item.isOnline
        }));

        const body = {
            filter: formattedData
        };

        await axios({
            method: 'post',
            url: `http://${ipAddress}:${apiPort}/uuids/updateOnline`,
            data: body,
        })
            .then(() => {
                toast(`Online status updated`);
                queryClient.invalidateQueries({ queryKey: ["uuidData"] });
                SetMultipleRowsSelection([]);
                contextMenu.hideAll();
            })
            .catch(error => {
                console.log("Error In Post Data", error);
                toast.error("Error In Data", {
                    style: {
                        background: "#ef4444", // Tailwind red-500
                        color: "#fff",
                    },
                });
                contextMenu.hideAll();
            });
    }, [Rescheduled]);

    const ALLOWED_RETRY_STATUSES = [
        "FAILED",
        "PARTIAL",
        "PROCESSED"
    ];


    const isretryDisabled =
        !Rescheduled?.length ||
        Rescheduled.some(
            (row: any) => !ALLOWED_RETRY_STATUSES.includes(row.status)
        );

    // console.log(Rescheduled, "Rescheduled", hasOnline)

    return (
        <Menu id={MENU_ID} className="font-medium">
            <Item onClick={(e) => { runRuleProcesApi(e) }}
                disabled={isretryDisabled}
            >
                <MdRestore className="mr-2" />     Retry
            </Item>
            <Item
                // onClick={(e) => runRuleProcesApi(e, Rescheduled?.isOnline)}
                onClick={(e) => updateOnlineStatus(e,)}
                disabled={disableItem}
            >
                <FaCircle
                    className={
                        hasOnline === true
                            ? "text-sm text-red-500 mr-2"
                            : "text-sm text-green-500 mr-2"
                    }
                />
                {hasOnline === true ? "Offline" : "Online"}
            </Item>
        </Menu>
    )
}
