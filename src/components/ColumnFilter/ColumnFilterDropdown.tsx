import FilterSearch from "@/Pages/UUID_Details/HandleApiCall/FilterSearch";
import React, { Suspense } from "react"; 

interface ColumnFilterDropdownProps {
  header: any;
  isOpen: boolean;  
  onClear: (id: string) => void;
  Filter: any; 
  handleInputChange: (value: string, idHeader: string, column: any) => void;
}

const ColumnFilterDropdown: React.FC<ColumnFilterDropdownProps> = ({
  header,
  isOpen, 
  onClear,
  Filter,
  handleInputChange, 
}) => {
  return (
    <div className="flex items-center">      
      {isOpen && (
        <Suspense fallback={null}>
          <FilterSearch
            column={header.column}
            headerid={header.id}
            handleInputChange={handleInputChange}
            Filter={Filter}
            clearFilter={onClear} 
          />
        </Suspense>
      )}
    </div>
  );
};


export default ColumnFilterDropdown;
