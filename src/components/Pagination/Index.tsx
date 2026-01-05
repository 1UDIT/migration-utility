import { format } from 'date-fns'
import { Button } from '../ui/button'

const Pagination = ({ table, data, initialDateRange, totalPage, parentRef, setActiveCursor, SetMultipleRowsSelection }: any) => {
    return (
        <div className="flex flex-row h-[6%] items-center border-t-4 border-slate-600">
            <div className="2xl:w-[50%] 2xl:block lg:block lg:w-[50%] items-center flex justify-start 
             2xl:pl-2  lg:pl-0 pt-1 text-[#81b2f7] font-bold   min-[320px]:hidden max-[600px]:text-xs">
                {initialDateRange?.startDate && initialDateRange?.endDate ? (
                    <>Display Data Is From {format(initialDateRange?.startDate, 'yyyy-MM-dd')} To {format(initialDateRange?.endDate, 'yyyy-MM-dd')}</>
                ) : (
                    <>No Date Filter Applied</>
                )}


            </div>
            <div className="2xl:w-[50%] lg:w-[70%] flex items-center px-2 min-[320px]:w-[100%] max-[600px]:text-xs  justify-end pr-5">
                <Button
                    variant={"ghost"}
                    className="border rounded p-1 text-white mr-2"
                    onClick={() => { table.firstPage(), parentRef.current?.scrollTo({ top: 0 }); setActiveCursor(0); SetMultipleRowsSelection([0]); }}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<<'}
                </Button>
                <Button
                    variant={"ghost"}
                    className="border rounded p-1 text-white mr-2"
                    onClick={() => { table.previousPage(), parentRef.current?.scrollTo({ top: 0 }); setActiveCursor(0); SetMultipleRowsSelection([0]); }}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<'}
                </Button>
                <Button
                    variant={"ghost"}
                    className="border rounded p-1 text-white mr-2"
                    onClick={() => { table.nextPage(), parentRef.current?.scrollTo({ top: 0 }); setActiveCursor(0); SetMultipleRowsSelection([0]); }}
                    disabled={!table.getCanNextPage()}
                >
                    {'>'}
                </Button>
                <Button
                    variant={"ghost"}
                    className="border rounded p-1 text-white mr-2"
                    onClick={() => { table.lastPage(), parentRef.current?.scrollTo({ top: 0 }); setActiveCursor(0); SetMultipleRowsSelection([0]); }}
                    disabled={!table.getCanNextPage()}
                >
                    {'>>'}
                </Button>
                <span className="flex items-center gap-1 text-white pr-2">
                    <div>Page</div>
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount().toLocaleString()}
                    </strong>
                </span>
                <select
                    className='text-white bg-[#374963]'
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                        table.setPageSize(Number(e.target.value))
                    }}
                >
                    {[50, 100, 150, 200,].map(pageSize => (
                        <option key={pageSize} value={pageSize} className='text-white bg-[#1f2937]'>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
                <span className="flex items-center gap-1 text-white pl-2">of {totalPage} Total</span>
            </div>
        </div>
    )
}

export default Pagination