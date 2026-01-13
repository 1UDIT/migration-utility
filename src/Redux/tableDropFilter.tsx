import { createSlice } from '@reduxjs/toolkit';

interface PaginationState {
    "filters": {
        "UUID": string,
        "migratedObjectSize": string,
        "sourceName": string,
        "destinationName": string,
        "objectName": string,
        "status": string
    }
}

interface CounterState {
    paginationStore: any;
    ipAddressStore?: any;
    reshedularSelection?:number
    reportType?:any
}

const initialState: CounterState = {
    paginationStore: {
        "filters": { 
        }
    },
    ipAddressStore: "",
    reshedularSelection:0,
    reportType:{}
};

const tableDropDownSlice = createSlice({
    name: 'tableDownClick',
    initialState,
    reducers: {
        setPaginationStore: (state, action) => {
            state.paginationStore = action.payload; 
        },
        ipAddressStore: (state, action) => {
            state.ipAddressStore = action.payload; 
        },
        reshedularSelection: (state, action) => {
            state.reshedularSelection = action.payload; 
        },
        reportType: (state, action) => {
            state.reportType = action.payload; 
        },
    },
});

export const { setPaginationStore,ipAddressStore, reshedularSelection, reportType } = tableDropDownSlice.actions;
export default tableDropDownSlice.reducer;
