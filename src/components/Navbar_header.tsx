// import DarkModeSwitcher from './darkModeSwitcher'

import { useEffect, useState } from "react";  
import { RxHamburgerMenu } from "react-icons/rx";
import {
    Sheet,
    SheetTrigger,
} from "./ui/sheet"  
const basePath = import.meta.env.BASE_URL;

export default function Navbar() {
    // let history = useNavigate();
    const [name, setName] = useState<string>('Dashboard');     
    useEffect(() => {
        locationName();
    }, [location])

    const locationName = () => {
        switch (location.pathname) {
            case `${basePath}Dashboard`:
                return setName('Dashboard')
            case `${basePath}Request`:
                return setName('Request List')
            case `${basePath}Objects`:
                return setName('Objects')
            case `${basePath}ArchiveFolder`:
                return setName('Archive Setting')
            case `${basePath}AltoDisks`:
                return setName('Alto Disks')
            case `${basePath}ArchiveUtility`:
                return setName('Archive Utility')
            case `${basePath}RuleProcessing`:
                return setName('Rule Processing Status')
            case `${basePath}Reports`:
                return setName('Reports')
            case `${basePath}Administration/Create`:
                return setName('Create User')
            case `${basePath}Administration/Delete`:
                return setName('Delete User')
            case `${basePath}Administration/Reset`:
                return setName('Reset Password')
            default:
                break;
        }
    }


    return (
        <header className='sticky top-0 z-9 flex w-full drop-shadow-1 bg-boxdark dark:drop-shadow-none h-1/10 pt-2.5'>
            <div className="flex flex-grow  shadow-2">
                <div className="mr-6 sm:block lg:hidden">
                    <Sheet>
                        <SheetTrigger>
                            <RxHamburgerMenu className="bg-white"/>
                        </SheetTrigger> 
                    </Sheet>
                </div>
                <div className="h-9  w-full text-white font-bold">
                    <div className="w-full h-full grid grid-cols-[15%_70%_15%]">
                        <div className="">{location.pathname === null ? "Dashboard" : name} </div>  
                    </div>
                </div>
            </div>
        </header>
    )
}
