import { createSlice } from '@reduxjs/toolkit'; 

const Session = sessionStorage.getItem("Session");
const dropMenu = JSON.parse(sessionStorage.getItem("Dropdown") as string);
const dropMedia = JSON.parse(sessionStorage.getItem("Media") as string);
const userCategory = JSON.parse(sessionStorage.getItem("userCategory") as string);
const UsersType = sessionStorage.getItem("userType") as string;
const Ipaddress = sessionStorage.getItem("ipAddress");
const username = sessionStorage.getItem("user_Name");
const SessionNotif = sessionStorage.getItem("SessionNotif");

let tokenBearer, Menu, mediaMenu, userAdmin, addressID, UserName, NotifSession;



tokenBearer = Session !== null ? Session : "";
Menu = dropMenu !== null ? dropMenu : "";
mediaMenu = dropMedia !== null ? dropMedia : "";
//mediaMenu = dropMedia !== null ? dropMedia : [];// fix crash error
userAdmin = UsersType !== null ? UsersType : "";
addressID = Ipaddress !== null ? Ipaddress : "";
UserName = username !== null ? username : "";
NotifSession = SessionNotif !== null ? SessionNotif : false;

export interface CounterState {
    btoken: string,
    sourceMap: string,
    mediaMenu: string,
    filterDateStart: any,
    catUser: string,
    userType: string,
    ApiAddress: string | any,
    userName: string | any,
    searchComment: string,
    sessionOut: string | boolean
}

const initialStateValue: CounterState = {
    sourceMap: Menu,
    mediaMenu: mediaMenu,
    btoken: tokenBearer,
    filterDateStart: { from: '', to: '' },
    catUser: userCategory,
    userType: userAdmin,
    ApiAddress: addressID,
    userName: UserName,
    searchComment: "",
    sessionOut: NotifSession
}

const TableDropDown = createSlice({
    name: 'tableDownClick',
    initialState: initialStateValue,
    reducers: {
        dateFilterStart: (state, action) => {
            state.filterDateStart = action.payload;
            // console.log(action.payload, "dateFilterStart");
        },
        usercat: (state, action) => {
            state.catUser = action.payload;
            // console.log(action.payload, "catUser");
        },
        MediaDrop: (state, action) => {
            state.mediaMenu = action.payload;
            // console.log(action.payload, "dispa");
        },
        sourcedestination: (state, action) => {
            state.sourceMap = action.payload;
            // console.log(action.payload, "dispa");
        },
        btoken: (state, action) => {
            state.btoken = action.payload;
            // console.log(action.payload, "dispa");
        },
        userType: (state, action) => {
            state.userType = action.payload;
            // console.log(action.payload, "dispa");
        },
        ApiAddress: (state, action) => {
            state.ApiAddress = action.payload;
            // console.log(action.payload, "ipAddress Redux");
        },
        user_Name: (state, action) => {
            state.userName = action.payload;
            console.log(action.payload, "ipAddress Redux");
        },
        commentSearch: (state, action) => {
            state.searchComment = action.payload;
            console.log(action.payload, "ipAddress Redux");
        },
        sessionOut: (state, action) => {
            state.sessionOut = action.payload;
        },
    }
});

export const { btoken, sourcedestination, MediaDrop, dateFilterStart, usercat, userType, ApiAddress, user_Name, commentSearch, sessionOut } = TableDropDown.actions;
export default TableDropDown.reducer;