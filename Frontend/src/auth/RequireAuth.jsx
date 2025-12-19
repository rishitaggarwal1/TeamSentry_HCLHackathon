import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isLoggedIn } from "./auth.storage";
import { authService } from "./auth.service";

export default function RequireAuth() {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const verify = async () => {
      // No token at all → not authenticated
      if (!isLoggedIn()) {
        setAllowed(false);
        setChecking(false);
        return;
      }

      // Token exists → allow route
      // (axios interceptor will refresh if needed)
      setAllowed(true);
      setChecking(false);
    };

    verify();
  }, []);

  if (checking) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Checking authentication...
      </div>
    );
  }

  if (!allowed) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
