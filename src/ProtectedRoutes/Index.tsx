import type { RootState } from "@/Redux/Store";
import type { JSX } from "react";
import { useSelector } from "react-redux"; 
import { Navigate } from "react-router";

type Props = {
  children: JSX.Element;
}; 

export default function ProtectedRoute({ children }: Props) { 
  const allowedRoles = useSelector((state: RootState) => state.tableDownClick.user_Name);

  if (allowedRoles === "operator") {
    // 🚫 Not allowed → redirect to Home
    return <Navigate to="/Dashboard" replace />;
  }

  return children;
}
