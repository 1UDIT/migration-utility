import { Button } from '../ui/button'

const Index = ({table, data}:any) => {
  return (
      <div className="flex flex-row h-[6%] items-center">
                <div className="2xl:w-[50%] 2xl:block lg:block lg:w-[50%] items-center flex justify-start 
             2xl:pl-0  lg:pl-0 pt-1 text-[#81b2f7] font-bold   min-[320px]:hidden max-[600px]:text-xs">
                    {/* {`Display Data Is From ${date?.from !== undefined ? format((date?.from as Date), 'yyyy-MM-dd') : ''} To ${date?.to !== undefined ? format((date?.to as Date), 'yyyy-MM-dd') : ''}`} */}
                </div>
                <div className="2xl:w-[50%] lg:w-[70%] flex items-center     min-[320px]:w-[100%] max-[600px]:text-xs  justify-end pr-5">
                    <Button
                        variant={"ghost"}
                        className="border rounded p-1 text-white "
                        onClick={() => table.firstPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {'<<'}
                    </Button>
                    <Button
                        variant={"ghost"}
                        className="border rounded p-1 text-white "
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {'<'}
                    </Button>
                    <Button
                        variant={"ghost"}
                        className="border rounded p-1 text-white "
                        onClick={() => table.nextPage()}
                    >
                        {'>'}
                    </Button>
                    <Button
                        variant={"ghost"}
                        className="border rounded p-1 text-white "
                        onClick={() => table.lastPage()}
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
                    <span className="flex items-center gap-1 text-white pl-2">of {data?.total} Total</span>
                </div>
            </div>
  )
}

export default Index
