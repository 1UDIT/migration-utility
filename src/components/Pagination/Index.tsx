import { format } from 'date-fns'
import { Button } from '../ui/button'

const Index = ({ table, data, initialDateRange, totalPage }: any) => { 
    return (
        <div className="flex flex-row h-[6%] items-center">
            <div className="2xl:w-[50%] 2xl:block lg:block lg:w-[50%] items-center flex justify-start 
             2xl:pl-2  lg:pl-0 pt-1 text-[#81b2f7] font-bold   min-[320px]:hidden max-[600px]:text-xs">
                {initialDateRange?.from && initialDateRange?.to ? (
                    <>Display Data Is From {format(initialDateRange.from, 'yyyy-MM-dd')} To {format(initialDateRange.to, 'yyyy-MM-dd')}</>
                ) : (
                    <>No Date Filter Applied</>
                )}


            </div>
            <div className="2xl:w-[50%] lg:w-[70%] flex items-center px-2 min-[320px]:w-[100%] max-[600px]:text-xs  justify-end pr-5">
                <Button
                    variant={"ghost"}
                    className="border rounded p-1 text-white mr-2"
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<<'}
                </Button>
                <Button
                    variant={"ghost"}
                    className="border rounded p-1 text-white mr-2"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<'}
                </Button>
                <Button
                    variant={"ghost"}
                    className="border rounded p-1 text-white mr-2"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    {'>'}
                </Button>
                <Button
                    variant={"ghost"}
                    className="border rounded p-1 text-white mr-2"
                    onClick={() => table.lastPage()}
                    disabled={!table.getCanNextPage()}
                >
                    {'>>'}
                </Button>
                <span className="flex items-center gap-1 text-white pr-2">
                    <div>Page</div>
                    <strong>
                        {table.getState().pagination.pageIndex +1} of{' '}
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

export default Index
