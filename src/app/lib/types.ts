export interface GetResponse {
  result: string;
  message: string;
}

export interface GetResponseWithId {
  result: string;
  message: string;
  id: number;
}

export interface GetResponsewithFile {
  result: string;
  message: string;
  data: string;
}

export interface GetResViewTestimony {
  result: string;
  message: string;
  data: ViewTestimonytype[];
}
export interface ViewTestimonytype {
  id: string;
  media_type: string;
  filepath: string;
  testimony_note: string;
  approved_by_name: string;
  is_approved: string;
  created_at: string;
  updated_at: string;
}

export interface GetWorkshopByFilters {
  result: string;
  message: string;
  total: number;
  list: WorkshopByFiltersData[];
}

export interface WorkshopByFiltersData {
  id: string;
  workshop_name: string;
  date: string;
  from_time: string;
  to_time: string;
  vle_name: string;
  work_shop_status: string;
  checklist: string;
  total_citizens: string;
  videos_count: string;
  images_count: string;
}

export interface DashboardData {
  total_schools: number;
  link_created: number;
  pending: number;
  paid: number;
  pending_amount: number;
  paid_amount: number;
}

export interface GetDashboardValues {
  result: string;
  message: string;
  list: DashboardData[];
}

export interface GetAdminUserLogout {
  result: string;
  message: string;
}

export interface GetWorkshopRes {
  result: string;
  message: string;
  list: [
    {
      id: string;
      workshop_name: string;
      date: string;
      from_time: string;
      to_time: string;
      vle_name: string;
      conducted_by: string;
      updated_at: string;
      created_at: string;
      total_citizens: string;
      vle_id: string;
      work_shop_status: string;
    },
  ];
}
// Single media count item
export interface MediaTypeCount {
  media_type: "image" | "video";
  media_type_count: string; // API returns string
}

// Full API response
export interface GetMediaCountResponse {
  result: "Success" | "Failure";
  message: string;
  data: MediaTypeCount[];
}

/* ---------- ROOT RESPONSE ---------- */
export interface VLEDashboardResponse {
  result: string;
  message: string;
  data: VLEDashboardData;
}

/* ---------- MAIN DATA ---------- */
export interface VLEDashboardData {
  total_citizens_count: number;
  gender_wise_count: GenderWiseCount;
  total_sessions_count: number;
  workshop_approved_status_count: number;
  bar_graph: WorkshopStatusCount;
}

/* ---------- GENDER COUNT ---------- */
export interface GenderWiseCount {
  Male: number;
  Female: number;
}

/* ---------- WORKSHOP STATUS COUNT ---------- */
export interface WorkshopStatusCount {
  Completed: number;
  Approved: number;
  Rejected: number;
  Cancelled: number;
  SendingForApproval: number;
}

export interface GetCitizenbyCardRes {
  result: string;
  message: string;
  total: number;
  list: [
    {
      name: string;
      mobile_number: string;
      email_id: string;
      qualification: string;
      age: string;
      gender: string;
      father_name: string;
      mother_name: string;
      address: string;
      created_at: string;
    },
  ];
}

export interface GetWorkshopDetails {
  result: string;
  message: string;
  list: WorkshopDetails;
}

export interface WorkshopDetails {
  id: string;
  workshop_name: string;
  date: string;
  from_time: string;
  to_time: string;
  vle_name: string;
  work_shop_status: string;
  checklist: string;
  total_citizens: string;
  videos_count: string;
  images_count: string;
  vle_mobile_number: string;
}

export type GetAllUsersResponse = {
  result: "Success" | "Error";
  message: string;
  count: number;
  data: AllUser[];
};

export type AllUser = {
  unique_user_id: string;
  csc_user_id: string;
  name: string;
  username: string;
  mobile_number: string;
  email_id: string;
  address: string;
  sub_district_name: string;
  district_name: string;
  state: string;
  specilization: string;
  degree: string;
  pincode: string;
  last_log_in: string;
  last_log_out: string;
  created_at: string;
  last_login_via: string;
  user_type: string;
  salutations: string;
};

export interface GetLocationListRes {
  result: string;
  message: string;
  total: number;
  list: LocationType[];
}

export interface LocationType {
  id: string;
  center_name: string;
  center_address: string;
  district: string;
  pincode: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface GenderCount {
  total: string;
  gender: "Male" | "Female" | string;
}

export interface GetGenderCountRes {
  result: string;
  message: string;
  list: GenderCount[];
}

export interface CityCount {
  total: string;
  district: string;
}

export interface GetCityCountRes {
  result: string;
  message: string;
  list: CityCount[];
}

export interface District {
  id: string;
  district: string;
  division: string;
}

export interface GetDistrictListRes {
  result: string;
  message: string;
  list: District[];
}

export interface Workshop {
  workshop_id: string;
  workshop_name: string;
  workshop_date: string;
  workshop_from_time: string;
  workshop_to_time: string;
  workshop_status: string;
  workshop_centre: string;
  workshop_district: string;
  workshop_pincode: string;
  vle_id: string;
  vle_mobile_number: string;
  vle_name: string;
}

export interface WorkshopsResponse {
  result: string;
  message: string;
  count: number;
  data: Workshop[];
}

export interface VLERes {
  unique_user_id: string;
  name: string;
}

export interface VLEUsersResponse {
  result: string;
  message: string;
  data: VLERes[];
}

export interface WorkshopStatusResponse {
  result: string;
  message: string;
  data: string[];
}

export interface Testimony {
  testimony_id: string;
  media_type: string;
  filepath: string;
  testimony_note: string;
  is_approved: string;
  created_at: string; // e.g., "2026-01-02 18:00:41"
  updated_at: string; // e.g., "2026-01-02 18:00:41"
}

// API response wrapper
export interface TestimonyResponse {
  result: string; // "Success"
  message: string; // e.g., "list found"
  data: Testimony[];
}
export interface DashboardStats {
  total_citizens: string;
  total_work: string;
  total_pending: string;
  total_approved: string;
  total_rejected: string;
}

export interface GetDashboardStatsRes {
  result: string;
  message: string;
  list: DashboardStats[];
}

export interface allStatusCounters {
  total_workshops: string;
  pending_count: string;
  completed_count: string;
  approved_count: string;
  cancelled_count: string;
  rejected_count: string;
  total_location_managers: string;
}

export interface allStatusCountersRes {
  result: string;
  message: string;
  list: allStatusCounters[];
}

export interface districtWiseWorkshopBarGraph {
  pending_count: string;
  completed_count: string;
  approved_count: string;
  cancelled_count: string;
  rejected_count: string;
}

export interface districtWiseWorkshopBarGraphRes {
  result: string;
  message: string;
  list: districtWiseWorkshopBarGraph[];
}
