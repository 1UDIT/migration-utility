import { Column, RowData } from '@tanstack/react-table'
import React, { lazy, Suspense, useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addMonths, endOfYesterday, format, formatISO, set, } from "date-fns";
import { Button } from '@/components/ui/button';
import { MdOutlineCancel } from "react-icons/md";
import { DateRange } from 'react-day-picker';
import Select, { components, ValueContainerProps } from 'react-select';
const InputTag = lazy(() => import('@/components/Inputtag'));

declare module '@tanstack/react-table' {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select' | 'calender'
  }
}

interface props {
  column: Column<any, unknown>,
  type: any,
  media: any,
  headerid: string,
  handleInputChange: any,
  Filter: any,
  clearFilter: (idHeader: string) => void,
  date: DateRange | undefined,
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>,
  setRequeststatus: React.Dispatch<React.SetStateAction<any>>
  Requeststatus: any
  setRequestType: React.Dispatch<React.SetStateAction<any>>
  Requesttype: any,
  setStoreFilterId: React.Dispatch<React.SetStateAction<string[]>>,
  setDropdownOpen: React.Dispatch<React.SetStateAction<any>>,
  setSearchTag: React.Dispatch<React.SetStateAction<any>>,
}

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
      backgroundColor:"#2d3d52",
    // match with the menu 
    border: "1px solid #f97316",
    borderRadius: "0.5rem",
    color: 'white',
    minHeight: '28px',
    height: '28px',
    // marginBottom:'10px',
    paddingBottom: '10px',
    boxShadow: state.isFocused ? null : null,
    '&:hover': { color: "white" }
  }),
  menu: (base: any) => ({
    ...base,
    background: "#020817",
    color: 'white',
    borderRadius: 0,
    marginTop: 0,
    width: '165px'
  }),
  multiValue: (base: any) => ({
    ...base,
    background: "none",
    color: 'white',
    margin: "0px",
    fontSize: "16px",
    paddinig:"0px",
    paddingLeft:"0px",
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: 'white',
    margin: "0px"
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? "rgba(189,197,209,.3)" : "black",
  }),
  valueContainer: (styles: any) => ({
    ...styles,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    paddingBottom: '0px',  // Removes padding from the placeholder
    fontSize: '14px',
    minHeight: '28px',
    height: '28px',
    fontWeight:"500",  
  }),
  placeholder: (provided: any) => ({
    ...provided,
    margin: 0,  // Removes any margin around the placeholder
    paddingBottom: '12px',  // Removes padding from the placeholder
    display: 'flex',
    alignItems: 'center',  // Ensures placeholder is vertically centered
    color: '#94a3af',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
  }),
  indicatorsContainer: (provided: any) => ({
    ...provided,
    display: 'flex',
    justifyContent: 'center', // Center the indicators horizontally 
    minHeight: '28px',
    height: '28px',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'white',
    marginLeft: "0px",
    marginRight: "0px",
    fontSize: "14px",
    paddinig:"0px",
    paddingLeft:"0px",
    paddingBottom:"0px",
    fontWeight:"500",
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    display: 'none'
  }),
};




const ValueContainer = ({ children, ...props }: ValueContainerProps) => {
  const { getValue } = props;
  const selectedValues: any = getValue();
  console.log(selectedValues, "ValueContainer");
  return (
    <components.ValueContainer {...props} className='text-sm'>
      {children}
    </components.ValueContainer>
  );
};


// const ValueContainer = ({ children, ...props }: ValueContainerProps) => {
//   const { getValue } = props;
//   const selectedValues: any = getValue();
//   console.log(selectedValues, "value");
//   return (
//     <components.ValueContainer {...props} className='text-sm'>
//      <div>{children}</div> 
//     </components.ValueContainer>
//   );
// };


export const Filter = ({
  column, media, type, headerid, handleInputChange, Filter, clearFilter, date, setDate, setRequeststatus, Requeststatus,
  Requesttype, setRequestType, setStoreFilterId, setDropdownOpen, setSearchTag
}: props) => {
  const { filterVariant } = column.columnDef.meta ?? {};
  const today = new Date();
  const nextMonth = addMonths(today, -1);
  const dateStart = endOfYesterday();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [month, setMonth] = useState(nextMonth);

  const handleType = (selectedOption: any, Value: any) => {
    console.log(Value, "Value", selectedOption);
    setRequestType(selectedOption)
    if (selectedOption !== null) {
      // Only update if text has a value
      setStoreFilterId((prev) => {
        if (prev.some((val) => (val === Value))) return prev;
        else {
          return [...prev, Value];
        }
      });
    } else {
      setStoreFilterId((old: any) => old.filter((d: any) => d !== Value));
      setDropdownOpen((old: any) => old.filter((d: any) => d.value !== Value));
      setSearchTag((old: any) => old.filter((d: any) => d !== Value));
    }
  }

  const handleStatus = (selectedOption: any, Value: any) => {
    console.log(Value, "Value", selectedOption);
    setRequeststatus(selectedOption)
    if (selectedOption.length > 0) {
      // Only update if text has a value
      setStoreFilterId((prev) => {
        if (prev.some((val) => (val === Value))) return prev;
        else {
          return [...prev, Value];
        }
      });
    } else {
      setStoreFilterId((old: any) => old.filter((d: any) => d !== Value));
      setDropdownOpen((old: any) => old.filter((d: any) => d.value !== Value));
      setSearchTag((old: any) => old.filter((d: any) => d !== Value));
    }
  };



  const menuContent = (Value: string) => {
    switch (Value) {
      case "am_rt_name":
        return (
          <div>
            <Select
              options={type}
              menuPosition='fixed'
              menuPlacement='auto'
              isSearchable={false}
              closeMenuOnSelect={true}
              value={Requesttype}
              onChange={(e) => handleType(e, Value)}
              isClearable={true}
              styles={customStyles}
              hideSelectedOptions={false}
              blurInputOnSelect
              className='text-sm'
            />
          </div>

        )
      case "am_rs_name":
        return (
          <Select
            options={media}
            menuPosition='fixed'
            menuPlacement='auto'
            isSearchable={false}
            closeMenuOnSelect={true}
            isMulti
            value={Requeststatus}
            onChange={(e) => handleStatus(e, Value)}
            styles={customStyles}
            isClearable={true}
            hideSelectedOptions={false}
            className='text-sm'
            components={{ ValueContainer }}
          />
        )
      default:
        break;
    }
  }

  const calenderContent = (Value: string) => {
    switch (Value) {
      case "am_req_submission_date":
        return (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <div className="grid grid-cols-6 w-full justify-start text-left font-normal h-8 px-1 text-white bg-[#2d3d52] font-bold border  border-orange-500 rounded-md" >
              <PopoverTrigger asChild className='col-span-5'>
                <Button
                  id="date" className='pl-1 bg-[#2d3d52] text-white'
                >
                  {date?.from ? (
                    date.to ? (
                      <span className='whitespace-nowrap text-ellipsis overflow-hidden'>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </span>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <div className="col-span-1 flex justify-end mt-1" >
                <MdOutlineCancel className='h-5 w-5' onClick={() => {
                  setDate({
                    from: (formatISO(dateStart) as any),
                    to: (formatISO(new Date()) as any),
                  });
                }} />
              </div>
            </div>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={date}
                onSelect={(e) => { setDate(e); setIsPopoverOpen(false) }}
                numberOfMonths={2}
                defaultMonth={month}
              />
            </PopoverContent>
          </Popover>
        )
      default:
        break;
    }
  }



  return filterVariant === 'select' ? (
    menuContent(headerid)
  ) :
    filterVariant === 'calender' ? (
      calenderContent(headerid)
    ) : (
      <Suspense fallback="">
        <InputTag column={column} handleInputChange={handleInputChange} headerid={headerid} clearFilter={clearFilter} />
      </Suspense>
    )
}

export default React.memo(Filter)