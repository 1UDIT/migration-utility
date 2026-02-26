
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
  setIsCustomDateSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFirstLoad: React.Dispatch<React.SetStateAction<boolean>>;
}


const customStyles = {
  container: (base: any) => ({
    ...base,
    width: '100%',
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
    width: '100%',
    fontWeight: "500"
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
    padding: "2px 8px"

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

const ValueContainer = (props: ValueContainerProps<any, boolean>) => {
  const selected = props.getValue?.() ?? [];
  const labels = selected
    .map((v: any) => String(v?.label ?? v?.value ?? ""))
    .filter(Boolean);

  const tooltip = labels.join(", ");

  return (
    <components.ValueContainer {...props}>
      {labels.length > 0 ? (
        <div
          title={tooltip}
          style={{
            display: "flex",
            alignItems: "center",
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {labels[0]}
            {labels.length > 1 ? " ..." : ""}
          </span>
        </div>
      ) : (
        props.children
      )}
    </components.ValueContainer>
  );
};




export const Filter = ({
  column, headerid, handleInputChange, clearFilter, date, setIsCustomDateSelected, setIsFirstLoad
}: props) => {
  const columnFilterValue = column.getFilterValue();
  const meta = column.columnDef.meta ?? {};
  const { filterVariant } = meta;
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
        isSearchable={false} 
        onChange={(val: any, actionMeta: any) => {
          const action = actionMeta?.action;

          // clear-like actions for both single & multi
          if (action === "clear" || action === "remove-value" || action === "pop-value") {
            column.setFilterValue(undefined);
            clearFilter(headerid);
            return;
          }

          if (isMulti) {
            const next = Array.isArray(val) ? val.map((o: any) => o.value) : [];
            column.setFilterValue(next.length ? next : undefined);
            handleInputChange(next, headerid, column);
          } else {
            // react-select uses null for "no selection"
            const next = val?.value ?? undefined;
            column.setFilterValue(next);

            // IMPORTANT: don't send '' on clear; only send when next exists
            if (next === undefined) {
              clearFilter(headerid);
              return;
            }
            handleInputChange(next, headerid, column);
          }
        }}
        isClearable
        menuPosition="absolute"
        menuPlacement="bottom"
        menuPortalTarget={document.body}
        placeholder={placeholder}
        styles={customStyles}
        className="text-sm" 
        components={{ ValueContainer }}
      />
    );
  };


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
      // setIsCustomDateSelected(false); // ✅ back to "no custom date"
      setIsPopoverOpen(false);
    };

    const handleSelect = (range: DateRange | undefined) => {

      if (!range?.from) return; // nothing selected

      // user is picking date -> mark custom
      setIsCustomDateSelected(true);
      setIsFirstLoad(false);
      // Keep DateRange in column filter so UI (Pick a date) works nicely
      column.setFilterValue(range);

      // Build payload for API filter (strings)
      const payload = {
        from: format(range.from, "yyyy-MM-dd"),
        to: range.to ? format(range.to, "yyyy-MM-dd") : "",
      };

      // IMPORTANT: pass payload to your existing handler properly
      handleInputChange(payload, headerid, column);

      // Close popover only when range is complete (optional)
      // if (range.to) setIsPopoverOpen(false);
    };


    const contentWidthClass =
      numberOfMonths > 1 ? 'w-[500px] max-w-[95vw]' : 'w-[320px] max-w-[95vw]';

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
            onClick={() => { clear(); setIsFirstLoad(true) }}
          />
        </div>

        <PopoverContent
          align="center"
          className={`p-2 bg-[#020517] border border-orange-500 rounded-lg shadow-md ${contentWidthClass}`}

        >
          <Calendar
            mode="range"
            numberOfMonths={numberOfMonths}
            defaultMonth={addMonths(new Date(), -1)}
            selected={selectedRange}
            onSelect={handleSelect}
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
          <input
            autoFocus
            placeholder="Search"
            value={(columnFilterValue ?? '') as string}
            onChange={(event) => {
              const rawValue = event.target.value;

              const parsed = rawValue.includes(",")
                ? rawValue.split(",").map(v => v.trim()).filter(Boolean)
                : rawValue;

              // ✅ pass rawValue separately so commas stay visible
              handleInputChange(parsed, headerid, column, rawValue);
            }}


            className="flex-grow bg-transparent py-1 px-1 text-sm w-full justify-end  text-white 
                   bg-transparent  shadow-sm transition-colors  placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed 
                    flex whitespace-nowrap text-ellipsis overflow-hidden"
            style={{ minWidth: '0' }}
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