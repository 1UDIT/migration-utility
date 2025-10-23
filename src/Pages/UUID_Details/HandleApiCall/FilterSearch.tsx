
import React, { lazy, Suspense, useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addMonths, endOfYesterday, format, formatISO, set, } from "date-fns";
import { Button } from '@/components/ui/button';
import { MdOutlineCancel } from "react-icons/md";
import Select, { components, type ValueContainerProps } from 'react-select';
import type { Column, RowData } from '@tanstack/react-table';
import type { DateRange } from "react-day-picker";
import { Calendar } from '@/components/ui/calendar';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select' | 'calender';

    // SELECT
    selectOptions?: { label: string; value: string }[];
    options?: Array<string | { label: string; value: string }>; // alias
    isMulti?: boolean;

    // CALENDER
    calendarMode?: 'single' | 'range';        // default: 'single'
    numberOfMonths?: number;                  // default: 2
    dateFormat?: string;                      // default: "LLL dd, y"
    // Optional quick presets for range
    datePresets?: Array<{
      label: string;
      getRange: () => { from: Date; to: Date };
    }>;

    placeholder?: string;                     // reused by both
  }
}

interface props {
  column: Column<any, unknown>;
  headerid: string;
  handleInputChange: any;
  Filter: any;
  clearFilter: (idHeader: string) => void;
  date?: DateRange;
  setDate?: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  setRequeststatus?: React.Dispatch<React.SetStateAction<any>>;
  Requeststatus?: any;
  setRequestType?: React.Dispatch<React.SetStateAction<any>>;
  Requesttype?: any;
}


const customStyles = {
  container: (base: any) => ({
    ...base,
    width: '165px',
    padding: "1px"
  }),
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: "#2d3d52",
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
    paddinig: "0px",
    paddingLeft: "0px",
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
    fontWeight: "500",
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
    paddinig: "0px",
    paddingLeft: "0px",
    paddingBottom: "0px",
    fontWeight: "500",
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    display: 'none'
  }),
};

const ValueContainer = ({ children, ...props }: ValueContainerProps) => {
  const { getValue } = props;
  const selectedValues: any = getValue();

  return (
    <components.ValueContainer {...props}>
      {selectedValues.length > 0 ? (
        <>
          <span>{selectedValues[0].label}
            {selectedValues.length > 1 && <span> ...</span>}
          </span>
        </>
      ) : (
        children
      )}
    </components.ValueContainer>
  );
};



export const Filter = ({
  column, headerid, handleInputChange, clearFilter, date,
}: props) => {
  const columnFilterValue = column.getFilterValue();
  const meta = column.columnDef.meta ?? {};
  const { filterVariant } = meta;
  const today = new Date();
  const nextMonth = addMonths(today, -1);
  const dateStart = endOfYesterday();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);


  // NEW: generic select content (no switch on headerid / accessorKey)
  const renderSelect = () => {
    const explicit = meta.selectOptions;
    const facetedMap: Map<any, number> | undefined = (column as any).getFacetedUniqueValues?.();
    const derived =
      facetedMap
        ? Array.from(facetedMap.keys()).map((v) => ({
          value: String(v ?? ''),
          label: String(v ?? ''),
        }))
        : [];

    const options = (explicit && explicit.length ? explicit : derived) as {
      label: string; value: string;
    }[];

    const isMulti = !!meta.isMulti;
    const placeholder = meta.placeholder ?? 'Select...';

    // Normalize current filter value to react-select's shape
    const current = (() => {
      if (isMulti) {
        const arr = Array.isArray(columnFilterValue) ? columnFilterValue : [];
        return options.filter((o) => arr.includes(o.value));
      }
      if (typeof columnFilterValue === 'string') {
        return options.find((o) => o.value === columnFilterValue) ?? null;
      }
      return null;
    })();


    return (
      <Select
        options={options}
        isMulti={isMulti}
        value={current}
        onChange={(val: any) => {
          if (isMulti) {
            const next = Array.isArray(val) ? val.map((o) => o.value) : [];
            column.setFilterValue(next.length ? next : undefined);
          } else {
            column.setFilterValue(val ? val.value : undefined);
          }
        }}
        isClearable
        menuPosition="fixed"
        menuPlacement="auto"
        placeholder={placeholder}
        styles={customStyles}
        className="text-sm"
        components={{ ValueContainer }}
      />
    );
  };

  // const calenderContent = (Value: string) => {
  //   switch (Value) {
  //     case "Invoice_Generation_Date":
  //       return (
  //         <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
  //           <div className="grid grid-cols-6 w-full justify-start text-left font-normal h-8 px-1 text-white bg-[#2d3d52] font-bold border  border-orange-500 rounded-md" >
  //             <PopoverTrigger asChild className='col-span-5'>
  //               <Button
  //                 id="date" className='pl-1 text-white'
  //               >
  //                 {date?.from ? (
  //                   date.to ? (
  //                     <span className='whitespace-nowrap text-ellipsis overflow-hidden'>
  //                       {format(date.from, "LLL dd, y")} -{" "}
  //                       {format(date.to, "LLL dd, y")}
  //                     </span>
  //                   ) : (
  //                     format(date.from, "LLL dd, y")
  //                   )
  //                 ) : (
  //                   <span>Pick a date</span>
  //                 )}
  //               </Button>
  //             </PopoverTrigger>
  //             <div className="col-span-1 flex justify-end mt-1" >
  //               <MdOutlineCancel className='h-5 w-5' onClick={() => {
  //                 setDate({
  //                   from: (formatISO(dateStart) as any),
  //                   to: (formatISO(new Date()) as any),
  //                 });
  //               }} />
  //             </div>
  //           </div>
  //           <PopoverContent className="w-auto p-0" align="start">
  //             <Calendar
  //               mode="single"
  //               defaultMonth={today}
  //               selected={today}
  //               onSelect={(e: any) => { setDate(e); setIsPopoverOpen(false) }}
  //               numberOfMonths={2}
  //               className="rounded-lg border shadow-sm bg-[#2d3d52]"
  //             />
  //           </PopoverContent>
  //         </Popover>
  //       )
  //     default:
  //       break;
  //   }
  // }

  // const renderCalendar = () => {
  //   const {
  //     calendarMode = 'single',
  //     numberOfMonths = 2, 
  //   } = meta;

  //   const fv = column.getFilterValue();


  //   const selectedRange: DateRange | undefined =
  //     calendarMode === 'range'
  //       ? (fv && typeof fv === 'object' && 'from' in (fv as any)
  //         ? (fv as DateRange)
  //         : undefined)
  //       : undefined;

  //   const clear = () => column.setFilterValue(undefined);

  //   // Responsive width: roomy for 2 months
  //   const contentWidthClass =
  //     numberOfMonths > 1 ? 'w-[560px] max-w-[95vw]' : 'w-[340px] max-w-[95vw]';

  //   return (
  //     <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
  //       <div className="grid grid-cols-6 w-full h-7 text-white bg-[#2d3d52] font-bold border border-orange-500 rounded-md">
  //         <PopoverTrigger asChild className="col-span-5 py-1">
  //           <Button id="date" className='pl-1 text-white bg-transparent hover:bg-transparent'>
  //             {date?.from ? (
  //               date.to ? (
  //                 <span className='whitespace-nowrap text-ellipsis overflow-hidden'>
  //                   {format(date.from, "LLL dd, y")} -{" "}
  //                   {format(date.to, "LLL dd, y")}
  //                 </span>
  //               ) : (
  //                 format(date.from, "LLL dd, y")
  //               )
  //             ) : (
  //               <span>Pick a date</span>
  //             )}
  //           </Button>
  //         </PopoverTrigger>
  //         <div className="col-span-1 flex justify-end mt-1">
  //           <MdOutlineCancel className="h-5 w-5" onClick={clear} />
  //         </div>
  //       </div>

  //       <PopoverContent align="center" className={`bg-[#2d3d52]  ${contentWidthClass}`}>
  //         <Calendar
  //           mode="range"
  //           numberOfMonths={numberOfMonths}
  //           defaultMonth={
  //             selectedRange?.from
  //               ? selectedRange.from
  //               : addMonths(new Date(), -1) // fallback to 1 month before today
  //           }
  //           selected={selectedRange}
  //           onSelect={(date) => {
  //             if (!date) return 
  //           }}
  //           required={false}
  //           // className="w-full shadow-sm bg-[#2d3d52]"
  //           classNames={{
  //             day: "h-9 w-9 text-sm flex items-center justify-center rounded-md hover:bg-orange-500/30",
  //           }}
  //         />
  //         {/* <Calendar
  //           mode="range"
  //           defaultMonth={
  //             selectedRange?.from
  //               ? selectedRange.from
  //               : addMonths(new Date(), -1) // fallback to 1 month before today
  //           }
  //           selected={selectedRange}
  //           onSelect={(date) => {
  //             if (!date) return
  //             setFilters((prev) => ({
  //               ...prev,
  //               [column.id]: date, // store date under header id
  //             }))
  //           }}
  //           numberOfMonths={2}
  //           className="rounded-lg border shadow-sm"
  //         /> */}
  //       </PopoverContent>
  //     </Popover>
  //   );
  // };

  const renderCalendar = () => {
    const {
      calendarMode = 'range',
      numberOfMonths = 2,
      dateFormat = "LLL dd, y",
    } = meta;

    const fv = column.getFilterValue();
    const selectedRange: DateRange | undefined =
      calendarMode === 'range' && fv && typeof fv === 'object' && 'from' in fv
        ? (fv as DateRange)
        : undefined;

    const clear = () => {
      column.setFilterValue(undefined);
      clearFilter(headerid);
      setIsPopoverOpen(false);
    };

    const handleSelect = (date: DateRange | Date | undefined) => {
      if (!date) return;

      if (calendarMode === 'single' && date instanceof Date) {
        column.setFilterValue(date);
        handleInputChange(format(date, "yyyy-MM-dd"), headerid, column);
      } else if (calendarMode === 'range' && typeof date === 'object' && 'from' in date) {
        const range = date as DateRange;
        column.setFilterValue(range);
        handleInputChange(
          {
            from: range.from ? format(range.from, "yyyy-MM-dd") : "",
            to: range.to ? format(range.to, "yyyy-MM-dd") : "",
          },
          headerid,
          column
        );
      }
    };


    const contentWidthClass =
      numberOfMonths > 1 ? 'w-[550px] max-w-[95vw]' : 'w-[320px] max-w-[95vw]';

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <div className="grid grid-cols-6 w-full justify-start items-center text-left font-normal h-8 px-1 text-white bg-[#2d3d52] font-bold border  border-orange-500 rounded-md" >
           <PopoverTrigger asChild className='col-span-5'>
            <Button
              id="date"
              className="flex-1 justify-start text-white text-sm bg-transparent hover:bg-transparent px-2 py-1 h-8"
            >
              {fv && (fv as DateRange).from ? (
                (fv as DateRange).to ? (
                  <span className="truncate">
                    {format((fv as DateRange).from!, dateFormat)} -{' '}
                    {format((fv as DateRange).to!, dateFormat)}
                  </span>
                ) : (
                  format((fv as DateRange).from!, dateFormat)
                )
              ) : (
                <span className="text-muted-foreground">Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>

          <MdOutlineCancel
            className="mx-2 h-5 w-5 text-white cursor-pointer hover:text-orange-400"
            onClick={clear}
          />
        </div>

        <PopoverContent
          align="center"
          className={`p-2 bg-[#2d3d52] border border-orange-500 rounded-lg shadow-md ${contentWidthClass}`}
        >
          <Calendar
            mode="range"
            numberOfMonths={numberOfMonths}
            defaultMonth={
              selectedRange?.from
                ? selectedRange.from
                : addMonths(new Date(), -1)
            } 
            selected={selectedRange}
            onSelect={handleSelect}
            classNames={{
              months: "flex gap-4",
              month: "space-y-4",
              caption: "text-sm text-white",
              day: "h-9 w-9 text-sm flex items-center justify-center rounded-md hover:bg-orange-500/40 data-[selected]:bg-orange-500 data-[selected]:text-white",
              day_selected: "bg-orange-500 text-white",
              day_today: "border border-orange-400",
              head_cell: "text-gray-300 font-medium text-xs",
            }}
          />
        </PopoverContent>
      </Popover>
    );
  };




  return filterVariant === 'select' ? (
    renderSelect()
  ) :
    filterVariant === 'calender' ? (
      renderCalendar()
    ) : (
      <Suspense fallback="">
        {/* <InputTag column={column} handleInputChange={handleInputChange} headerid={headerid} clearFilter={clearFilter} /> */}
        <div className="flex  w-full h-7 border  border-orange-500 rounded-md bg-[#2d3d52] text-white">
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
            <MdOutlineCancel className="h-5 w-5 text-white " />
          </button>
        </div>
      </Suspense>
    )
}

export default React.memo(Filter)