import { DefaultLayout } from "@/components/layout/defaultLayout";
import { Suspense, lazy } from "react" 
import Table from "./table";

export function ReportPage() {
    return (
        <DefaultLayout>
            <Suspense fallback={""}>
                <Table />
            </Suspense>
        </DefaultLayout>
    )
}
