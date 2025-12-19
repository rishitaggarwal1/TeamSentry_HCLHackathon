import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn } from "./auth.storage";

export default function PublicOnly() {
  return isLoggedIn() ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
