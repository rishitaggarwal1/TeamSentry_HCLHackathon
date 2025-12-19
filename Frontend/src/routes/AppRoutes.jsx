import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../auth/RequireAuth";
import PublicOnly from "../auth/PublicOnly";
import RequireRole from "../auth/RequireRole";
import Login from "../pages/LoginModule/Login";
import SignUp from "../pages/LoginModule/SignUp";
import Dashboard from "../pages/DashboardModule/Dashboard";
import Profile from "../pages/ProfileModule/Profile";
import ChangePassword from "../pages/ProfileModule/ChangePassword";
import ApproveDoctors from "../pages/AdminModule/ApproveDoctors";
import UploadLicense from "../pages/DoctorModule/UploadLicense";
import Home from "../pages/HomeModule/Home";
import PharmacyFinder from "../pages/PharmacyFinder";

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/medicines-nearby" element={<PharmacyFinder />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Route>

      {/* Protected */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route element={<RequireRole allowed={["Admin"]} />}>
          <Route path="/admin/doctors" element={<ApproveDoctors />} />
        </Route>
        <Route element={<RequireRole allowed={["Doctor"]} />}>
          <Route path="/doctor/upload-license" element={<UploadLicense />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Home and catch-all */}
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default AppRoutes;
