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
    paginationStore: PaginationState;
}

const initialState: CounterState = {
    paginationStore: {
        "filters": {
            "UUID": "",
            "migratedObjectSize": "",
            "sourceName": "",
            "destinationName": "",
            "objectName": "",
            "status": ""
        }
    },
};

const tableDropDownSlice = createSlice({
    name: 'tableDownClick',
    initialState,
    reducers: {
        setPaginationStore: (state, action) => {
            state.paginationStore = action.payload; 
        },
    },
});

export const { setPaginationStore } = tableDropDownSlice.actions;
export default tableDropDownSlice.reducer;
