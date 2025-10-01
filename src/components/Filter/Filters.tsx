import { useState } from "react";
import { FaFilterCircleXmark } from "react-icons/fa6";

type Filter = {
  column: string;
  value: string;
};

const columns = [
  "Name",
  "Category",
  "Date",
  "Size(KB)",
  "Diva Instance",
  "Path",
  "Barcode",
  "Media Name",
  "Object UUID",
  "Is-Match",
  "Instance Migrated",
  "Status",
];

export default function Filters() {
  const [filters, setFilters] = useState<Filter[]>([{ column: "Name", value: "" }]);

  const handleFilterChange = (index: number, field: keyof Filter, newValue: string) => {
    const newFilters = [...filters];
    newFilters[index][field] = newValue;
    setFilters(newFilters);

    // if last filter is filled, add a new one
    if (
      index === filters.length - 1 &&
      (newFilters[index].value.trim() !== "" || newFilters[index].column !== "")
    ) {
      setFilters([...newFilters, { column: "Name", value: "" }]);
    }
  };

  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters.length > 0 ? newFilters : [{ column: "Name", value: "" }]);
  };

  return (
    <div className="flex bg-[#1e2a38] text-white w-full">
      {/* Filters Section */}
      <div className="flex flex-row gap-2 p-2 flex-wrap">
        {filters.map((filter, index) => (
          <div key={index} className="flex items-center gap-2">
            {/* Dropdown for column */}
            <select
              value={filter.column}
              onChange={(e) => handleFilterChange(index, "column", e.target.value)}
              className="rounded-md px-2 py-1 text-black w-32"
            >
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>

            {/* Input for value */}
            <input
              type="text"
              value={filter.value}
              onChange={(e) => handleFilterChange(index, "value", e.target.value)}
              placeholder={`Filter ${index + 1}`}
              className="w-28 rounded-md px-2 py-1 text-black"
            />

            {/* Remove Button */}
            {filters.length > 1 && (
              <FaFilterCircleXmark onClick={()=>removeFilter(index)}/>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
