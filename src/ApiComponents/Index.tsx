import { useEffect, useState } from 'react';
import axios from 'axios';
import { SortingState } from '@tanstack/react-table';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/Store';
import sessionToken from './tokenExport'
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Option } from 'react-multi-select-component';



export default function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export const useSortValue = (sortingValue: any) => {
    const [Value, setValue] = useState<any>({ id: "", type: true });

    useEffect(() => {
        const handler = () => {
            sortingValue.map((value: any) => { return (setValue({ id: value.id, type: value.desc })) })
        };

        handler();

    }, [sortingValue]);

    return Value;
}


export const useMultipleSortValue = (sortingValue: any) => {
    const [Value, setValue] = useState<any>({ id: "", type: true });

    const handler = sortingValue?.map((value: any) => {
        const ordertype = value.desc ? "desc" : "asc";
        return `${value.id} ${ordertype}`;
    })
        .join(', ');


    return handler;
}


export const useRequestCall = (pageIndex: number, pageSize: number, columnFilters: any, sorting: SortingState,
    date: DateRange | undefined, Requeststatus: Option[], Requesttype: any) => {
    const [Loading, setLoading] = useState<boolean>(false)
    const [showModal, setshowModal] = useState<boolean>(false);
    const [data, setData] = useState<any>([]);
    const [dataCount, setDataCount] = useState<any>([]);
    const sortvalue = useSortValue(sorting);
    const userCategory = useSelector((state: RootState) => state.tableDownClick.catUser);
    const token = sessionToken();
    const APIAddress = useSelector((state: RootState) => state.tableDownClick.ApiAddress);
    var requesStatusJoin: string;
    requesStatusJoin = Requeststatus?.map((val: any) => {
        return val?.value
    }).join(",");

    const objNameValue = columnFilters.find((item: any) => item.id === "am_req_object_name")?.value || "";
    const categoryValue = columnFilters.find((item: any) => item.id === "am_req_category")?.value || "";
    const categoryMediaValue = columnFilters.find((item: any) => item.id === "am_req_media")?.value || "";
    const srcDestValue = columnFilters.find((item: any) => item.id === "am_req_sourcedestination")?.value || "";
    const reqIdValue = columnFilters.find((item: any) => item.id === "am_req_id")?.value || "";

    const debouncedobjNameValue = useDebounce(objNameValue, 600);
    const debouncedcategoryValue = useDebounce(categoryValue, 600);
    const debouncedcategoryMediaValue = useDebounce(categoryMediaValue, 600);
    const debouncedsrcDestValue = useDebounce(srcDestValue, 600);
    const debouncedreqIdValue = useDebounce(reqIdValue, 600);
 

    useEffect(() => {
        // Dispatch(dateFilterStart({ 'from': format((date?.from as Date), 'yyyy-MM-dd'), 'to': format((date?.to as Date), 'yyyy-MM-dd') }));
        setLoading(false);
        var dataBody = {
            objName: debouncedobjNameValue,
            category: debouncedcategoryValue,
            // type: "",
            type: Requesttype === null ? "" : Requesttype.value,
            media: debouncedcategoryMediaValue,
            srcDest: debouncedsrcDestValue,
            status: requesStatusJoin,
            id: debouncedreqIdValue,
            startDate: date?.from !== undefined ? format((date?.from as Date), 'yyyy-MM-dd') : '',
            endDate: date?.to !== undefined ? format((date?.to as Date), 'yyyy-MM-dd') : '',
            orderColumn: sortvalue.id === "" ? "am_req_id" : sortvalue.id,
            limitStart: (pageIndex) * pageSize,
            limitEnd: pageSize * (pageIndex + 1),
            orderType: sortvalue.type === false ? "asc" : "desc",
            userCat: userCategory
        };

        const runApi = async () => {
            await axios({
                method: 'post',
                url: `http://${APIAddress}:7001/internal/api/requestlist`,
                data: dataBody,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(response => {
                if (response.status === 401) {
                    console.log(response.status, "request")
                    console.log(response.statusText, " response.statusText")
                } else {
                    setLoading(true);
                    setData(response.data.data);
                    setDataCount(response.data.iTotalDisplayRecords);

                }
            }).catch(function (error) {
                console.log("Error In Post Data", error, error.response.data.status);
                if (error.response.data.status === 1004) {
                    setshowModal(true);
                }
            });

        }

        if (date !== null && sortvalue.id !== '') {
            var fetchApi = setInterval(() => {
                runApi();
            }, 20000);
            runApi();
        }

        return () => {
            setLoading(false);
            clearInterval(fetchApi);
        }

    }, [pageIndex, pageSize, debouncedreqIdValue, debouncedobjNameValue, debouncedcategoryValue, debouncedcategoryMediaValue, debouncedsrcDestValue,
        sortvalue, Requeststatus, requesStatusJoin, Requesttype, date, Requeststatus])

    return [
        Loading,
        dataCount,
        data,
        setshowModal,
        showModal,
    ]

}

export const useRequestDetailId = (requestId: string, refresh: any) => {
    const [Loading, setLoading] = useState<boolean>(false)
    const [Error, setError] = useState<boolean>(false)
    const [data, setData] = useState<any>([]);
    const [disableBtn, setdisableBtn] = useState<boolean>(true);
    const token = sessionToken();
    const ipAddress = useSelector((state: RootState) => state.tableDownClick.ApiAddress);
    useEffect(() => {
        setLoading(false);
        setError(false);
        const fetchApi = async () => {
            setdisableBtn(true)
            await axios({
                method: 'get',
                url: `http://${ipAddress}:7001/internal/api/requestlog`,
                params: { reqID: requestId },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(response => {
                setData(response.data);
                setLoading(true);
                setdisableBtn(false)
            }).catch(function (error) {
                setLoading(true);
                setError(true);
                setdisableBtn(false);
                setData([]);
            });
        } 

        if (refresh || ipAddress !== '') {
            fetchApi()
        }

        return () => {
            setLoading(false);
            setError(false);
        }

    }, [requestId, refresh])

    return [
        Loading,
        Error,
        data,
        disableBtn
    ]

}