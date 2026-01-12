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
import CreateLocationManage from "../../pages/Admin/LocationManager/createLocationManage";
import ViewLocationManagerPage from "../../pages/Admin/LocationManager/viewLocationManager";
import VLEReport from "../../pages/Admin/Reports/VLEReport";
import CitizenReport from "../../pages/Admin/Reports/CitizenReport";
import WorkshopReport from "../../pages/Admin/Reports/WorkshopReport";
import RBIDashboard from "../../pages/RBI/RBIDashboard";
import RBIMonthView from "../../pages/RBI/RBIMonthView";
import RBIWorkshopDateWise from "../../pages/RBI/RBIWorkshopDateWise";
import RBIReportsHome from "../../pages/RBI/Reports/RBIReportsHome";
import DistrictStatusReport from "../../pages/RBI/Reports/DistrictStatusReport";
import GenderParticipationReport from "../../pages/RBI/Reports/GenderParticipationReport";
import CitizenDataReport from "../../pages/RBI/Reports/CitizenDataReport";
import LocationScheduleReport from "../../pages/RBI/Reports/LocationScheduleReport";
import DistrictPendingCompleteReport from "../../pages/RBI/Reports/DistrictPendingCompleteReport";
import WorkshopsLt50Report from "../../pages/RBI/Reports/WorkshopsLt50Report";
import DashboardSubAdmin from "../../pages/SubAdmin/SubAdminDashboard";

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
        path: ROUTE_URL.createLoactionManager,
        element: (
          <RequireRole allowedRoles={["admin"]}>
            <CreateLocationManage />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.viewLocationManager,
        element: (
          <RequireRole allowedRoles={["admin"]}>
            <ViewLocationManagerPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.downloadVLEReport,
        element: (
          <RequireRole allowedRoles={["admin"]}>
            <VLEReport />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.downloadCitizenReport,
        element: (
          <RequireRole allowedRoles={["admin"]}>
            <CitizenReport />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.downloadWorkshopReport,
        element: (
          <RequireRole allowedRoles={["admin"]}>
            <WorkshopReport />
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
      {
        path: ROUTE_URL.rbiDashboard,
        element: (
          <RequireRole allowedRoles={["rbi"]}>
            <RBIDashboard />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.rbiMonthView,
        element: (
          <RequireRole allowedRoles={["rbi"]}>
            <RBIMonthView />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.rbiWorkshopDateWise,
        element: (
          <RequireRole allowedRoles={["rbi"]}>
            <RBIWorkshopDateWise />
          </RequireRole>
        ),
      },

      {
        path: ROUTE_URL.rbiReports,
        element: (
          <RequireRole allowedRoles={["rbi","sub_admin"]}>
            <RBIReportsHome />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.rbiReportDistrictStatus,
        element: (
          <RequireRole allowedRoles={["rbi","sub_admin"]}>
            <DistrictStatusReport />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.rbiReportGenderParticipation,
        element: (
          <RequireRole allowedRoles={["rbi","sub_admin"]}>
            <GenderParticipationReport />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.rbiReportCitizenData,
        element: (
          <RequireRole allowedRoles={["rbi","sub_admin"]}>
            <CitizenDataReport />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.rbiReportLocationSchedule,
        element: (
          <RequireRole allowedRoles={["rbi","sub_admin"]}>
            <LocationScheduleReport />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.rbiReportDistrictPendingComplete,
        element: (
          <RequireRole allowedRoles={["rbi","sub_admin"]}>
            <DistrictPendingCompleteReport />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.rbiReportWorkshopsLt50,
        element: (
          <RequireRole allowedRoles={["rbi","sub_admin"]}>
            <WorkshopsLt50Report />
          </RequireRole>
        ),
      },
      {
        path: ROUTE_URL.subAdminDashboard,
        element: (
          <RequireRole allowedRoles={["sub_admin"]}>
            <DashboardSubAdmin />
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
