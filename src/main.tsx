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
import SignIn from './Pages/Auth/signin.tsx';

// console.log('Base path:', basePath);
const queryClient = new QueryClient()
const router = createBrowserRouter(
  createRoutesFromElements(
    <> 
       <Route index path='/' element={<SignIn />} />
      <Route path="/uuid" lazy={() => import("@/Pages/UUID_Details/page.tsx")} />  
      <Route path="/Object" lazy={() => import("@/Pages/Object_Details/page.tsx")} />   
    </>
  ), { basename: basePath }
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <RouterProvider router={router} />  
    </Provider>
  </QueryClientProvider>
  ,
)
