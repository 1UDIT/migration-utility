import { Link, useLocation } from "react-router";

  

export default function NoMatch() {
    let location = useLocation();

    return (
        // <div>
        //     <h3>
        //         No match for <code>{location.pathname}</code>
        //     </h3>
        // </div> 
        <div>
            <section className="p-10">
                <div className="container">
                    <div className="row">
                        <div className="col-sm-12 ">
                            <div className="col-sm-10 col-sm-offset-1  text-center">
                                <div className="h-150 bg-anime bg-no-repeat bg-center">
                                    <h1 className="text-6xl text-center">404 ERROR</h1>
                                </div>
                                <div className="text-center text-xl">
                                    <h3 className="font-bold">Something Went Wrong..!</h3>
                                    <p>The page Not Available!{location.pathname}</p>
                                    <Link to={"/"} className="bg-blue-700 p-2 text-white inline-block mt-10">
                                        Go to Home
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}