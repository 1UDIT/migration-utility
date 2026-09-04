import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route } from "react-router";
import { RouterProvider } from "react-router/dom";
import { store } from './Redux/Store.tsx'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import SignIn from './Pages/Auth/signin.tsx';
import ProtectedRoute from './ProtectedRoutes/Index.tsx';

// console.log('Base path:', basePath);
const queryClient = new QueryClient()

const getBasePath = () => {
  // In production the first URL segment is the Tomcat webapp context.
  // For example, /migrationGEC/Dashboard -> /migrationGEC.
  if (import.meta.env.PROD) {
    const contextPath = window.location.pathname.split('/').filter(Boolean)[0];
    return contextPath ? `/${contextPath}` : '';
  }

  return '';
};


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index path='/' element={<SignIn />} />
      <Route  >
        <Route path="/uuid" lazy={async () => {
          const { UUIDpage } = await import('./Pages/UUID_Details/UUIDpage.tsx');
          return { Component: () => <ProtectedRoute><UUIDpage /></ProtectedRoute> };
        }} />
        <Route path="/masstech" lazy={async () => {
          const { MasstechPage } = await import('./Pages/MassTech/MasstechPage.tsx');
          return { Component: () => <ProtectedRoute><MasstechPage /></ProtectedRoute> };
        }} />
        <Route path="/Object" lazy={async () => {
          const { ObjectPage } = await import('./Pages/Object_Details/ObjectPage.tsx');
          return { Component: () => <ProtectedRoute><ObjectPage /></ProtectedRoute> };
        }} />
        <Route path="/reportViewer" lazy={async () => {
          const { ReportPage } = await import('./Pages/ReportViewer/ReportPage.tsx');
          return { Component: () => <ProtectedRoute><ReportPage /></ProtectedRoute> };
        }} />
        <Route path="/Dashboard" lazy={() => import("@/Pages/InstancesDashboard/page.tsx")} hydrateFallbackElement />
      </Route>
      <Route path="*" element={<SignIn />} />
    </>
  ), { basename: getBasePath(), }
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster position='bottom-left' />
    </Provider>
  </QueryClientProvider>
  ,
)
