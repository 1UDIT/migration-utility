import { DefaultLayout } from "@/components/layout/defaultLayout";
import { Suspense, lazy } from "react"
const Tabledata = lazy(() => import("./table"));

export function MasstechPage() {
    return (
        <DefaultLayout>
            <Suspense fallback={""}>
                <Tabledata />
            </Suspense>
        </DefaultLayout>
    )
}
