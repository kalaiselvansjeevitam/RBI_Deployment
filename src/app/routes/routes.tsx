import { ROUTE_URL } from "../core/constants/coreUrl";
import PrivateRoute, {
  RequireRole,
  RoleFallbackRedirect,
} from "./PrivateRoutes";
import { ScrollRestoration } from "react-router-dom";

import Login from "../../pages/Login/Login";
// import Dashboard from "../../pages/Dashboard/Dashboard";
import AdminDashboard from "../../pages/Admin/AdminDashboard";
import CreateUser from "../../pages/Admin/CreateUser";
import CreateWorkshop from "../../pages/VLE/WorkShop/CreateWorkshop";
import CreateCitizen from "../../pages/VLE/Citizen/CreateCitizen";
import MapCitizen from "../../pages/VLE/WorkShop/MapCitizen";
import VLEDashboard from "../../pages/VLE/VLEDashboard";
import UploadTestimony from "../../pages/VLE/WorkShop/UploadTestimony";
import VleUpload from "../../pages/Admin/VleUpload";
import { ViewWorkshop } from "../../pages/VLE/WorkShop/ViewWorkshop";
import { ViewTestimony } from "../../pages/VLE/WorkShop/ViewTestimony";
import ViewCitizenByCard from "../../pages/VLE/WorkShop/ViewCitizenByCard";
import { ViewUser } from "../../pages/Admin/ViewUser";
import ViewManageSession from "../../pages/Admin/ManageSession/ViewManageSession";
import TestimonyByWorkshop from "../../pages/Admin/ManageSession/shared/testimonybyworkshop";

export const authProtectedRoutes = [
  {
    element: (
      <>
        {/* <Layout> */}
        <ScrollRestoration />
        <PrivateRoute />
        {/* </Layout> */}
      </>
    ),
    children: [
      // {
      //   path: ROUTE_URL.dashboard,
      //   element: (
      //     <>
      //       <Dashboard />
      //     </>
      //   ),
      // },
      {
        path: ROUTE_URL.adminDashboard,
        element: (
          <RequireRole allowedRoles={["admin"]}>
            <AdminDashboard />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.createUser,
        element: (
          <RequireRole allowedRoles={["admin"]}>
            <CreateUser />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.viewUser,
        element: (
          <RequireRole allowedRoles={["admin"]}>
            <ViewUser />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.uploadVle,
        element: (
          <RequireRole allowedRoles={["admin"]}>
            <VleUpload />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.viewSession,
        element: (
          <RequireRole allowedRoles={["admin"]}>
            <ViewManageSession />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.testimonyByWorkshop,
        element: (
          <RequireRole allowedRoles={["admin"]}>
            <TestimonyByWorkshop />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.ViewWorkshop,
        element: (
          <RequireRole allowedRoles={["vle"]}>
            <ViewWorkshop />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.createWorkShop,
        element: (
          <RequireRole allowedRoles={["vle"]}>
            <CreateWorkshop />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.createCitizens,
        element: (
          <RequireRole allowedRoles={["vle"]}>
            <CreateCitizen />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.mapCitizen,
        element: (
          <RequireRole allowedRoles={["vle"]}>
            <MapCitizen />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.vleDashboard,
        element: (
          <RequireRole allowedRoles={["vle"]}>
            <VLEDashboard />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.uploadTestimony,
        element: (
          <RequireRole allowedRoles={["vle"]}>
            <UploadTestimony />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.viewTestimony,
        element: (
          <RequireRole allowedRoles={["vle"]}>
            <ViewTestimony />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.viewCitizenByCard,
        element: (
          <RequireRole allowedRoles={["vle"]}>
            <ViewCitizenByCard />
          </RequireRole>
        ),
      },
      { path: "*", element: <RoleFallbackRedirect /> },
    ],
  },
  {
    path: ROUTE_URL.login,
    element: <Login />,
  },
];

export const authRoutes = [];
