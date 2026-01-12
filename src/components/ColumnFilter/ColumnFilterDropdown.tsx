import FilterSearch from "@/Pages/UUID_Details/HandleApiCall/FilterSearch";
import React, { Suspense } from "react"; 

interface ColumnFilterDropdownProps {
  header: any;
  isOpen: boolean;  
  onClear: (id: string) => void;
  Filter: any; 
  handleInputChange: (value: string, idHeader: string, column: any) => void;
  setIsCustomDateSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFirstLoad: React.Dispatch<React.SetStateAction<boolean>>;
}

const ColumnFilterDropdown: React.FC<ColumnFilterDropdownProps> = ({
  header,
  isOpen, 
  onClear,
  Filter,
  handleInputChange, 
  setIsCustomDateSelected,
  setIsFirstLoad
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
            setIsCustomDateSelected={setIsCustomDateSelected}
            setIsFirstLoad={setIsFirstLoad}
          />
        </Suspense>
      )}
    </div>
  );
};


export default ColumnFilterDropdown;
