// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"
// import { Link, useNavigate } from "react-router-dom"

// export default function TokenExpire({ showModal, setshowModal }: { showModal: any, setshowModal: any }) {
//     const navigation = useNavigate();
//     const backTologinPage = () => {
//         navigation("/");
//         location.reload();
//         sessionStorage.clear();
//         setshowModal(false)
//     }
//     return (
//         < >
//             <AlertDialog open={showModal} onOpenChange={setshowModal}>
//                 <AlertDialogContent className="bg-[#24303f] w-[90%] text-white border border-slate-950">
//                     <AlertDialogHeader>
//                         <AlertDialogTitle>Session Expire Please Login Again</AlertDialogTitle>
//                         <AlertDialogDescription>
//                             Session Expire
//                         </AlertDialogDescription>
//                     </AlertDialogHeader>
//                     <AlertDialogFooter>
//                         {/* <AlertDialogCancel className="bg-[#d94040] text-white rounded-md border border-black relative text-sm m-2 px-6 py-2"> */}
//                             <Link onClick={() => backTologinPage()}
//                                 to="/">Log-Out</Link>
//                         {/* </AlertDialogCancel> */}
//                     </AlertDialogFooter>
//                 </AlertDialogContent>
//             </AlertDialog>
//         </ >
//     )
// }


import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { sessionOut } from "@/Redux/tableDropFilter";
import React, { useEffect, useState } from 'react';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

interface Props {
    showModal: boolean;
    setshowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const TokenExpire = React.memo(({ showModal, setshowModal }: Props) => {
    const [countdown, setCountdown] = useState(5); // Countdown starts at 5 seconds
    const navigation = useNavigate();
    const Dispatch = useDispatch();
    useEffect(() => {
        if (showModal) {
            setCountdown(5); // Reset countdown when modal is shown
            Dispatch(sessionOut(true));
            const interval = setInterval(() => {
                setCountdown(prev => {
                    // if (prev === 1) {
                    //     navigation("/");
                    //     sessionStorage.clear();
                    //     window.location.reload();
                    //     sessionStorage.setItem("SessionNotif", JSON.stringify(true));
                    //     return 0;
                    // }
                    if (prev === 1) {
                        sessionStorage.clear();
                        sessionStorage.setItem("SessionNotif", JSON.stringify(true)); // set it immediately after clearing

                        navigation("/");

                        // Delay reload just a bit to ensure the item is stored before reload
                        // setTimeout(() => {
                        //     window.location.reload();
                        // }, 50); // 50ms gives the browser a moment to commit the storage
                        return 0;
                    }
                    return prev - 1;
                });
            }, 550);
            return () => clearInterval(interval);
        }
    }, [showModal]);

    const Logout = () => { 
        navigation("/");  
        sessionStorage.clear();
    };

    return (
        <AlertDialog open={showModal} onOpenChange={setshowModal}>
            <AlertDialogContent className="bg-[#24303f] w-[90%] text-white border border-slate-950">
                <AlertDialogHeader>
                    <AlertDialogTitle>Session Expired</AlertDialogTitle>
                    <AlertDialogDescription>
                        You will be logged out in <span className="text-red-400 font-bold">{countdown}</span> seconds.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className='grid grid-cols-2'>
                    <AlertDialogCancel
                        className="bg-[#d94040] text-white rounded-md border border-black relative text-sm m-2 px-6 py-2"
                        onClick={Logout}
                    >
                        Logout Now
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
});

export default TokenExpire;
