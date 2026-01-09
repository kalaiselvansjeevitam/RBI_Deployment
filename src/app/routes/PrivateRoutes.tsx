import { Navigate, Outlet } from "react-router-dom";
import { ROUTE_URL } from "../core/constants/coreUrl";
import { useEffect, type ReactNode } from "react";

interface RequireRoleProps {
  allowedRoles: string[];
  children: ReactNode;
}

const PrivateRoute = () => {
  const token = sessionStorage.getItem("session_token");
  const user_type = sessionStorage.getItem("user_type");
  console.log("session token");
  if (!token) {
    console.log("not session token");
    return <Navigate to={ROUTE_URL.login} />;
  }
  useEffect(() => {
    if (user_type === "admin") document.title = "Admin Dashboard";
    else if (user_type === "vle") document.title = "VLE Dashboard";
    else document.title = "Dashboard";
  }, [user_type]);

  return <Outlet />;
};

export default PrivateRoute;

export const RequireRole = ({ allowedRoles, children }: RequireRoleProps) => {
  const user_type = sessionStorage.getItem("user_type");

  if (!user_type) {
    return <Navigate to={ROUTE_URL.login} replace />;
  }

  if (!allowedRoles.includes(user_type)) {
    // 🔁 Redirect based on actual role
    if (user_type === "admin") {
      return <Navigate to={ROUTE_URL.adminDashboard} replace />;
    }

    if (user_type === "vle") {
      return <Navigate to={ROUTE_URL.vleDashboard} replace />;
    }

    // fallback
    return <Navigate to={ROUTE_URL.login} replace />;
  }

  return children;
};

export const RoleFallbackRedirect = () => {
  const role = sessionStorage.getItem("user_type");

  if (role === "admin") {
    return <Navigate to={ROUTE_URL.adminDashboard} replace />;
  }

  if (role === "vle") {
    return <Navigate to={ROUTE_URL.vleDashboard} replace />;
  }

  return <Navigate to={ROUTE_URL.login} replace />;
};
