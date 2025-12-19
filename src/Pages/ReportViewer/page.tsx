import { DefaultLayout } from "@/components/layout/defaultLayout";
import { Suspense, lazy } from "react" 
import Table from "./table";

export function Component() {
    return (
        <DefaultLayout>
            <Suspense fallback={""}>
                <Table />
            </Suspense>
        </DefaultLayout>
    )
}
