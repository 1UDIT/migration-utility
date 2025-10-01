import React from 'react'
import { MdOutlineCancel } from "react-icons/md";

export default function InputTag({column,handleInputChange, headerid, clearFilter}:any) {
    const columnFilterValue = column.getFilterValue();
  return (
    <div className="flex items-center w-full h-7 border  border-orange-500 rounded-md bg-[#2d3d52] text-white">
        <input autoFocus
          placeholder="Search..."
          value={(columnFilterValue ?? '') as string}
          onChange={(event) => {
            handleInputChange(event.target.value, headerid, column);
          }}
          className="flex-grow bg-transparent py-1 px-1 text-sm w-full justify-end  text-white 
                   bg-transparent  shadow-sm transition-colors  placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed 
                    flex whitespace-nowrap text-ellipsis overflow-hidden"
          style={{ minWidth: '0' }} // Ensures the input shrinks properly within flexbox
        />
        <button className="flex items-center justify-end h-full  border-orange-500"
          onClick={() => {
            clearFilter(headerid);
            column.setFilterValue('');
          }}
        >
          <MdOutlineCancel className="h-5 w-5 text-white mt-1" />
        </button>
      </div>
  )
}
