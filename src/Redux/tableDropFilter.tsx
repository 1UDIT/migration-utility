import { createSlice } from '@reduxjs/toolkit';

const username = sessionStorage.getItem("user_Name");

let UserName = username !== null ? username : "";

interface CounterState {
    paginationStore: any;
    ipAddressStore?: any;
    reshedularSelection?:number
    reportType?:any
    nonActiveInstance:number
    user_Name:string
}

const initialState: CounterState = {
    paginationStore: {
        "filters": { 
        }
    },
    ipAddressStore: "",
    reshedularSelection:0,
    reportType:{}, 
    nonActiveInstance:2,
    user_Name:UserName
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
        user_Name: (state, action) => {
            state.user_Name = action.payload; 
        },
    },
});

export const { setPaginationStore,ipAddressStore, reshedularSelection, reportType, nonActiveInstances, user_Name } = tableDropDownSlice.actions;
export default tableDropDownSlice.reducer;
