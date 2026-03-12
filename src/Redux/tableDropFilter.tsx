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
    nonActiveInstance:number
}

const initialState: CounterState = {
    paginationStore: {
        "filters": { 
        }
    },
    ipAddressStore: "",
    reshedularSelection:0,
    reportType:{}, 
    nonActiveInstance:2
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
        nonActiveInstances: (state, action) => {
            state.nonActiveInstance = action.payload; 
        },
    },
});

export const { setPaginationStore,ipAddressStore, reshedularSelection, reportType, nonActiveInstances } = tableDropDownSlice.actions;
export default tableDropDownSlice.reducer;
