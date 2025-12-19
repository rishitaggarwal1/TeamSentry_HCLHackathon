import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth Wrappers
import RequireAuth from "../auth/RequireAuth";
import PublicOnly from "../auth/PublicOnly";
import RequireRole from "../auth/RequireRole";

// Pages
import Login from "../pages/LoginModule/Login";
import SignUp from "../pages/LoginModule/SignUp";
import Dashboard from "../pages/DashboardModule/Dashboard";
import Profile from "../pages/ProfileModule/Profile";
import ChangePassword from "../pages/ProfileModule/ChangePassword";
import ApproveDoctors from "../pages/AdminModule/ApproveDoctors";
import UploadLicense from "../pages/DoctorModule/UploadLicense";
import Home from "../pages/HomeModule/Home";
import PharmacyFinder from "../pages/PharmacyFinder";

// --- NEW IMPORT ---
import BookAppointment from "../pages/PatientModule/BookAppointment";
import DoctorAvailability from "../pages/DoctorModule/DoctorAvailability"; // Import the new file

function AppRoutes() {
  return (
    <Routes>
      {/* --- Public Routes (Only for non-logged in users) --- */}
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/medicines-nearby" element={<PharmacyFinder />} />
        <Route path="/" element={<Home />} />
        {/* Catch-all for public: redirect to Home or Login */}
        <Route path="*" element={<Home />} />
      </Route>

      {/* --- Protected Routes (Requires Login) --- */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* --- NEW ROUTE: Book Appointment --- */}
        {/* Accessible to authenticated users (Patients) */}
        <Route path="/book-appointment" element={<BookAppointment />} />

        {/* Role Based: Admin */}
        <Route element={<RequireRole allowed={["Admin"]} />}>
          <Route path="/admin/doctors" element={<ApproveDoctors />} />
        </Route>

        {/* Role Based: Doctor */}
        <Route element={<RequireRole allowed={["Doctor"]} />}>
          <Route path="/doctor/upload-license" element={<UploadLicense />} />
          <Route
            path="/doctor/set-availability"
            element={<DoctorAvailability />}
          />
        </Route>

        {/* Default protected redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
