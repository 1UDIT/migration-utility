 
import { DefaultLayout } from "@/components/layout/defaultLayout";
import { Suspense, lazy } from "react"
const Tabledata = lazy(() => import("./table"));

export function Component() {
    return (
        <DefaultLayout>
            <Suspense fallback={""}>
                <Tabledata />
            </Suspense>
        </DefaultLayout>
    )
}
