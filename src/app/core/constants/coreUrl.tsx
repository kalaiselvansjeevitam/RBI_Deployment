export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export const VITE_BASE_PATH = import.meta.env.VITE_BASE_PATH || "";

export const ROUTE_URL = {
  login: "/rbi-deployment/admin/login",
  dashboard: "/rbi-deployment/admin",
  adminDashboard: "/rbi-deployment/admin/adminDashboard",
  createUser: "/rbi-deployment/admin/createUser",
  viewUser: "/rbi-deployment/admin/viewUser",
  createCitizens: "/rbi-deployment/admin/createCitizens",
  createWorkShop: "/rbi-deployment/admin/createWorkShop",
  mapCitizen: "/rbi-deployment/admin/uploadCitizen",
  vleDashboard: "/rbi-deployment/admin/VLEDashboard",
  uploadTestimony: "/rbi-deployment/admin/uploadTestimony",
  uploadVle: "/rbi-deployment/admin/uploadVle",
  ViewWorkshop: "/rbi-deployment/admin/ViewWorkshop",
  viewTestimony: "/rbi-deployment/admin/viewTestimony",
  viewCitizenByCard: "/rbi-deployment/admin/viewCitizenDetails",
  viewSession: "/rbi-deployment/admin/viewSession",
  testimonyByWorkshop: "/rbi-deployment/admin/testimonyByWorkshop",
  createLoactionManager: "/rbi-deployment/admin/createLoactionManager",
  viewLocationManager: "/rbi-deployment/admin/viewLoactionManager",
  downloadVLEReport: "/rbi-deployment/admin/DownloadVLEReport",
  downloadCitizenReport: "/rbi-deployment/admin/DownloadCitizenReport",
  downloadWorkshopReport: "/rbi-deployment/admin/DownloadWorkshopReport",
  subAdminDashboard: "/rbi-deployment/admin/sub-admin-dashboard",

  rbiDashboard: "/rbi-deployment/admin/rbiDashboard",
  rbiMonthView: "/rbi-deployment/admin/rbi/month-view",
  rbiWorkshopDateWise: "/rbi-deployment/admin/rbiWorkshopDateWise",

  // Reports hub + individual reports
  rbiReports: "/rbi-deployment/admin/rbiReports",
  rbiReportDistrictStatus: "/rbi-deployment/admin/rbiReports/district-status",
  rbiReportGenderParticipation:
    "/rbi-deployment/admin/rbiReports/gender-participation",
  rbiReportCitizenData: "/rbi-deployment/admin/rbiReports/citizen-data",
  rbiReportLocationSchedule:
    "/rbi-deployment/admin/rbiReports/location-schedule",
  rbiReportDistrictPendingComplete:
    "/rbi-deployment/admin/rbiReports/district-pending-complete",
  rbiReportWorkshopsLt50: "/rbi-deployment/admin/rbiReports/workshops-lt-50",
};

export const API_URL = {
  login: "user-login",
  logout: "user-logout",
  createUser: "create-user",
  createWorkShop: "/createWorkShop",
  createCitizen: "/createCitizens",
  getWorkshop: "/getWorkshop",
  getworkshoptestimonyCount: "/workshop-testimony-count",
  uploadCitizens: "/uploadCitizens",
  uploadTestimony: "/update-testimony",
  uploadVle: "/upload-vle",
  getWorkshopByFilters: "/getWorkshopByFilters",
  updateChecklist: "/updateChecklist",
  updateStatus: "/updateStatus",
  viewTestimony: "/get-testimony-by-user-workshop",
  vleDasboard: "/get-vle-dashboard-card",
  getCitizens: "/getCitizens",
  getWorkshopDetails: "/getWorkshopDetails",
  getallusers: "get-all-users",
  updateUsers: "/update-users-details",
  deleteUser: "/delete-user",
  updatePassword: "/update-users-password",
  getLocationManager: "/getLocationManager",
  genderWiseDonut: "/genderWiseDonut",
  locationWiseBarChart: "/locationWiseBarChart",
  getDistrict: "/getDistrict",
  getWorkShop: "/get-workshop-list",
  getVLE: "/get-users-lookup",
  getWorkshopStatus: "/get-workshop-status-values",
  getTestimonyByWorkshop: "/get-testimony-by-workshop",
  updateTestimonystatus: "/update-testimony-status",
  updateWorkshopStatus: "/update-workshop-status",
  createLocationManage: "/createLocationManager",
  updateLocationManager: "/editLocationManager",
  deleteLocationManager: "/deleteLocationManager",
  adminDashboardValues: "/adminDashboardValues",
  downloadVLE: "/download-vle-report",
  downloadCitizen: "/download-citizen-report",
  downloadWorkshop: "/download-workshop-report",
  allStatusCounters: "/allStatusCounters",
  deleteTestimony: "/delete-testimony",

  // RBI Reports (DOWNLOAD)
  downloadDistrictWiseWorkshopReport: "/download-district-wise-workshop-report",
  downloadGenderWiseWorkshopReport: "/download-gender-wise-workshop-report",
  downloadCitizenDataByDistrictReport:
    "/download-citizen-data-by-district-report",
  downloadLocationManagerWiseWorkshopReport:
    "/download-location-manager-wise-workshop-report",
  downloadDistrictWiseByStatusWorkshopReport:
    "/download-district-wise-by-status-workshop-report",
  downloadCitizenCountLessThan50Report:
    "/download-citizen-count-lessthan-50-report",

  // RBI Reports (VIEW)
  viewDistrictWiseWorkshopReport: "/view-district-wise-workshop-report",
  viewGenderWiseWorkshopReport: "/view-gender-wise-workshop-report",
  viewCitizenDataByDistrictReport: "/view-citizen-data-by-district-report",
  viewLocationManagerWiseWorkshopReport:
    "/view-location-manager-wise-workshop-report",
  viewDistrictWiseByStatusWorkshopReport:
    "/view-district-wise-by-status-workshop-report",
  viewCitizenCountLessThan50Report: "/lessThan50CitizendWorkshop",

  // RBI Month View
  monthViewCardValues: "/monthViewCardValues",
  monthAndDistrict: "/monthAndDistrict",

  // RBI Dashboard
  rbiDashboardValues: "/rbiDashboardValues",
  pendingVSCompleted: "/pendingVSCompleted",
  scheduledVSCancelled: "/scheduledVSCancelled",
  maleVSFemale: "/maleVSFemale",
  districtWiseWorkshopBarGraph: "/districtWiseWorkshopBarGraph",
  monthWiseWorkshopBarGraph: "/monthWiseWorkshopBarGraph",
  programsConductedbarGraph: "/programsConductedbarGraph",
  top5vles: "/top5vles",
  top5districts: "/top5districts",
};
