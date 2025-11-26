
import { Progress } from '@/components/ui/progress';
import axios from 'axios';
import { useEffect, useState } from 'react'

const FetchColumnDetail = () => {
    const [Column, SetColumn] = useState([]);
    
    const getCelldetail = (props: any, header: any, alignText: string) => {

        if (header === "migrationSizeProgressPercent") {
            return (<div className="py-1"><Progress value={props.getValue()} className="flex justify-center" /></div>)

        } else if (header === "migrationCountProgressPercent") {
            return (<div className="py-1"><Progress value={props.getValue()} className="flex justify-center" /></div>)
        } else if (header === "SlugName") {
            return (<span title={props.getValue()} className={`tableHeaderSize ${alignText}`}>{props.getValue()}</span>)
        }
        else {
            return (<span title={props.getValue()} className={`tableHeaderSize wrapword ${alignText}`}>{props.getValue()}</span>)
        }
    }

    useEffect(() => {
        axios({
            method: "Get",
            url: './config.json',
        }).then(response => {
            // console.log(response.data.column, "column");
            const Column = response?.data?.Uuid_column.map((value: any) => {
                const alignClass = value.textAlign === 'text-left'
                    ? 'text-left'
                    : value.textAlign === 'text-center'
                        ? 'text-center'
                        : 'text-right'
                return {
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
            SetColumn(Column);
        }).catch(error => {
            console.log(error, "error in Config File")
        });

    }, []);

    return [Column]
}

export default FetchColumnDetail