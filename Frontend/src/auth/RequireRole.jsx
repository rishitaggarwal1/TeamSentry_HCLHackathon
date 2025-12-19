import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAuth, isLoggedIn } from "./auth.storage";

export default function RequireRole({ allowed = [] }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const role = getAuth()?.role;
  if (!role || (allowed.length && !allowed.includes(role))) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
