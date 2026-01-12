import { useEffect, type ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { ROUTE_URL } from "../core/constants/coreUrl";

interface RequireRoleProps {
  allowedRoles: string[];
  children: ReactNode;
}

const getRole = () => (sessionStorage.getItem("user_type") || "").toLowerCase();

const PrivateRoute = () => {
  const token = sessionStorage.getItem("session_token");
  const role = getRole();

  if (!token) {
    return <Navigate to={ROUTE_URL.login} />;
  }

  useEffect(() => {
    if (role === "admin") document.title = "Admin Dashboard";
    else if (role === "vle") document.title = "VLE Dashboard";
    else if (role === "rbi") document.title = "RBI Dashboard";
    else if (role === "sub_admin") document.title = "Sub-Admin Dashboard";
    else document.title = "Dashboard";
  }, [role]);

  return <Outlet />;
};

export default PrivateRoute;

export const RequireRole = ({ allowedRoles, children }: RequireRoleProps) => {
  const role = getRole();

  if (!role) {
    return <Navigate to={ROUTE_URL.login} replace />;
  }

  // allowedRoles should match same casing strategy
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
  if (!normalizedAllowed.includes(role)) {
    if (role === "admin")
      return <Navigate to={ROUTE_URL.adminDashboard} replace />;
    if (role === "vle") return <Navigate to={ROUTE_URL.vleDashboard} replace />;
    if (role === "rbi") return <Navigate to={ROUTE_URL.rbiDashboard} replace />;
    if (role === "sub_admin") return <Navigate to={ROUTE_URL.subAdminDashboard} replace />;

    return <Navigate to={ROUTE_URL.login} replace />;
  }

  return children;
};

export const RoleFallbackRedirect = () => {
  const role = getRole();

  if (role === "admin")
    return <Navigate to={ROUTE_URL.adminDashboard} replace />;
  if (role === "vle") return <Navigate to={ROUTE_URL.vleDashboard} replace />;
  if (role === "rbi") return <Navigate to={ROUTE_URL.rbiDashboard} replace />;
  if (role === "sub_admin") return <Navigate to={ROUTE_URL.subAdminDashboard} replace />;

  return <Navigate to={ROUTE_URL.login} replace />;
};
