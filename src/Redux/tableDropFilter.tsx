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
}

const initialState: CounterState = {
    paginationStore: {
        "filters": { 
        }
    },
    ipAddressStore: ""
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
        }
    },
});

export const { setPaginationStore,ipAddressStore } = tableDropDownSlice.actions;
export default tableDropDownSlice.reducer;
