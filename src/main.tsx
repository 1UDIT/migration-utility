import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route } from "react-router";
import { RouterProvider } from "react-router/dom";
import { store } from './Redux/Store.tsx'
const basePath = import.meta.env.BASE_URL;
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';

// console.log('Base path:', basePath);
const queryClient = new QueryClient()
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* <Route index path='/' element={<SignIn />} /> */}
      <Route >
        <Route path="/uuid" lazy={() => import("@/Pages/UUID_Details/page.tsx")}  hydrateFallbackElement />
        <Route path="/masstech" lazy={() => import("@/Pages/MassTech/page.tsx")}  hydrateFallbackElement />
        <Route path="/" lazy={() => import("@/Pages/Object_Details/page.tsx")} hydrateFallbackElement/>
        <Route path="/reportViewer" lazy={() => import("@/Pages/ReportViewer/page.tsx")} hydrateFallbackElement/>
        <Route path="/InstanceView" lazy={() => import("@/Pages/InstancesDashboard/page.tsx")} hydrateFallbackElement/>
      </Route>
      {/* <Route path="*" element={<SignIn />} /> */}
    </>
  ), { basename: basePath }
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <RouterProvider router={router} />
       <Toaster />
    </Provider>
  </QueryClientProvider>
  ,
)
