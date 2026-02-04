/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { API_URL } from "../constants/coreUrl";
import { POST } from "./axiosInstance";

export type DownloadReportResponse = {
  result: string; // "Success" | "Error"
  message: string;
  data: string; // Download URL for the generated Excel file
};

export type ReportTableResponse<T> = {
  status: string; // "Success" | "Error"
  message: string;
  count: number; // Total number of records
  data: T[]; // Array of records
};

// DOWNLOAD REPORT HOOKS

// 1) District-wise Workshop Report (Download)
export const useDownloadDistrictWiseWorkshopReport = () =>
  useMutation({
    mutationFn: (data?: { district?: string }) => {
      return POST<DownloadReportResponse>({
        url: API_URL.downloadDistrictWiseWorkshopReport,
        data: {
          district: data?.district ?? "",
        },
      });
    },
  });

// 2) Gender-wise Workshop Report (Download)
export const useDownloadGenderWiseWorkshopReport = () =>
  useMutation({
    mutationFn: (data?: {
      district?: string;
      // block_panchayat: string;
      // gram_panchayat: string;
      // from_date: string;
      // to_date: string;
    }) => {
      return POST<DownloadReportResponse>({
        url: API_URL.downloadGenderWiseWorkshopReport,
        data: {
          district: data?.district ?? "",
          //     block_panchayat: data?.block_panchayat ?? "",
          // gram_panchayat: data?.gram_panchayat ?? "",
          // from_date: data?.from_date ?? "",
          // to_date: data?.to_date ?? "",
        },
      });
    },
  });

// 3) Citizen Data by District Report (Download)
export const useDownloadCitizenDataByDistrictReport = () =>
  useMutation({
    mutationFn: (data: {
      district: string;
      block_panchayat: string;
      gram_panchayat: string;
      start_date?: string;
      end_date?: string;
      work_shop_id?: string;
    }) =>
      POST<{
        result: string; // "success"
        message: string;
        data?: string; // url
      }>({
        url: API_URL.downloadCitizenDataByDistrictReport,
        data,
      }),
  });

/** Workshop lookup (optional) */
export const useGetAllWorkshopLookup = () =>
  useMutation({
    mutationFn: () =>
      POST<{
        result: string;
        message: string;
        list?: any[];
      }>({
        url: API_URL.getAllWorkshopLookup,
      }),
  });

export const useDownloadRBIWorkshopReport = () =>
  useMutation({
    mutationFn: (data: {
      district: string;
      start_date: string;
      end_date: string;
      block_panchayat: string;
      gram_panchayat: string;
    }) => {
      return POST<DownloadReportResponse>({
        url: API_URL.downloadRBIWorkshopReport,
        data,
      });
    },
  });

// 4) Location Manager-wise Workshop Report (Download)
export const useDownloadLocationManagerWiseWorkshopReport = () =>
  useMutation({
    mutationFn: (data: {
      district: string;
      start_date?: string;
      end_date?: string;
    }) => {
      return POST<DownloadReportResponse>({
        url: API_URL.downloadLocationManagerWiseWorkshopReport,
        data: {
          district: data.district,
          start_date: data.start_date ?? "",
          end_date: data.end_date ?? "",
        },
      });
    },
  });

// 5) District-wise by Status Workshop Report (Download)
export const useDownloadDistrictWiseByStatusWorkshopReport = () =>
  useMutation({
    mutationFn: () => {
      return POST<DownloadReportResponse>({
        url: API_URL.downloadDistrictWiseByStatusWorkshopReport,
      });
    },
  });

// 6) Workshops with < 50 Citizens Report (Download)
export const useDownloadCitizenCountLessThan50Report = () =>
  useMutation({
    mutationFn: (data: {
      district: string;
      start_date?: string;
      end_date?: string;
    }) => {
      return POST<DownloadReportResponse>({
        url: API_URL.downloadCitizenCountLessThan50Report,
        data: {
          district: data.district,
          start_date: data.start_date ?? "",
          end_date: data.end_date ?? "",
        },
      });
    },
  });

//  VIEW/TABLE REPORT HOOKS

// 7) District-wise Workshop Report (View)
export type DistrictWorkshopRow = {
  district: string;
  pending_count: string;
  approved_count: string;
  rejected_count: string;
  completed_count: string;
  cancelled_count: string;
  workshops_lt_50: string;
};

export const useViewDistrictWiseWorkshopReport = () =>
  useMutation({
    mutationFn: (data: { district?: string; offset: number }) =>
      POST<ReportTableResponse<DistrictWorkshopRow>>({
        url: API_URL.viewDistrictWiseWorkshopReport,
        data,
      }),
  });

//8) Gender-wise Workshop Report (View)
export type GenderWorkshopRow = {
  district: string;
  gram_panchayat: string;
  block_panchayat: string;
  location: string;
  topic: string;
  male_count: string;
  female_count: string;
  others_count: string;
};

export const useViewGenderWiseWorkshopReport = () =>
  useMutation({
    mutationFn: (data: {
      district?: string;
      offset: number;
      // block_panchayat: string;
      // gram_panchayat: string;
      // from_date: string;
      // to_date: string;
    }) =>
      POST<ReportTableResponse<GenderWorkshopRow>>({
        url: API_URL.viewGenderWiseWorkshopReport,
        data,
      }),
  });

// 9) Citizen Data by District Report (View)
export type CitizenRow = {
  vle_id: string;
  vle_name: string;
  block_panchayat: string;
  gram_panchayat: string;
  district: string;
  citizen_name: string;
  centre_name: string;
  centre_address: string;
  workshop_date: string;
  mobile_number: string;
  program_name: string;
  gender: string;
  date: string;
  father_name: string;
  mother_name: string;
  age: string;
  address: string;
};

export type ViewCitizenResponse = {
  status: "Success" | "Error";
  message: string;
  count: number;
  data: CitizenRow[];
};

export type RBIWorkshopReportRow = {
  workshop_name: string;
  workshop_date: string;
  workshop_from_time: string;
  workshop_to_time: string;
  workshop_district: string;
  workshop_created_at: string;
  workshop_status: string;
  workshop_checklist: string;
  workshop_approved_date: string;
  workshop_rejected_reason: string;
  vle_name: string;
  approver_name: string;
  workshop_id: string;
  workshop_center_name: string;
  workshop_center_address: string;
  participants_count: string;
  workshop_block_panchayat: string;
  workshop_gram_panchayat: string;
};

export type RBIWorkshopReportResponse = {
  status: "Success" | "Error";
  message: string;
  count: number;
  data: RBIWorkshopReportRow[];
};

export const useViewCitizenDataByDistrictReport = () =>
  useMutation({
    mutationFn: (payload: {
      district: string;
      gram_panchayat: string;
      block_panchayat: string;
      start_date: string;
      end_date: string;
      work_shop_id?: string;
      offset: number;
    }) => {
      return POST<ViewCitizenResponse>({
        url: API_URL.viewCitizenDataByDistrictReport,
        data: {
          district: payload.district,
          gram_panchayat: payload.gram_panchayat,
          block_panchayat: payload.block_panchayat,
          start_date: payload.start_date,
          end_date: payload.end_date,
          work_shop_id: payload.work_shop_id,
          offset: payload.offset,
        },
      });
    },
  });

export const useViewWorkshopReport = () =>
  useMutation({
    mutationFn: (payload: {
      district: string;
      gram_panchayat: string;
      block_panchayat: string;
      start_date: string;
      end_date: string;
      offset: number;
    }) => {
      return POST<RBIWorkshopReportResponse>({
        url: API_URL.viewWorkShopReport,
        data: {
          district: payload.district,
          gram_panchayat: payload.gram_panchayat,
          block_panchayat: payload.block_panchayat,
          start_date: payload.start_date,
          end_date: payload.end_date,
          offset: payload.offset,
        },
      });
    },
  });

// 10) Location Manager-wise Workshop Report (View)
export type LocationManagerWorkshopRow = {
  center_name: string;
  center_address: string;
  workshop_name: string;
  workshop_date: string;
  workshop_from_time: string;
  workshop_to_time: string;
  district: string;
  created_at: string;
  workshop_status: string;
  vle_id: string;
  vle_name: string;
};

export type ViewLocationManagerResponse = {
  status: "Success" | "Error";
  message: string;
  count: number;
  data: LocationManagerWorkshopRow[];
};

export const useViewLocationManagerWiseWorkshopReport = () =>
  useMutation({
    mutationFn: (payload: {
      district: string;
      start_date?: string;
      end_date?: string;
      offset: number;
    }) => {
      const data: any = {
        district: payload.district,
        offset: payload.offset,
      };

      if (payload.start_date) data.start_date = payload.start_date;
      if (payload.end_date) data.end_date = payload.end_date;

      return POST<ViewLocationManagerResponse>({
        url: API_URL.viewLocationManagerWiseWorkshopReport,
        data,
      });
    },
  });

// 11) District-wise by Status Workshop Report (View)
export type DistrictStatusRow = {
  district: string;
  vle_name: string;
  vle_id: string;
  location: string;
  pending_count: string;
  completed_count: string;
  approved_count: string;
  rejected_count: string;
  citizens_count_lessthan_50: string;
};

export const useViewDistrictWiseByStatusWorkshopReport = () =>
  useMutation({
    mutationFn: (data: { district?: string; offset: number }) =>
      POST<ReportTableResponse<DistrictStatusRow>>({
        url: API_URL.viewDistrictWiseByStatusWorkshopReport,
        data,
      }),
  });

//12) Workshops with Citizen Count < 50 (View)
export type ViewLt50Row = {
  id: string;
  district: string;
  location: string;
  vle_name: string;
  date: string;
  citizens_count: string;
};

export type ViewLt50Response = {
  result: string; // "Success" | "Error"
  message: string;
  count: number;
  total: number;
  data: ViewLt50Row[];
  list: ViewLt50Row[];
};

export const useViewCitizenCountLessThan50Report = () =>
  useMutation({
    mutationFn: (payload: {
      district?: string;
      start_date?: string;
      end_date?: string;
      offset: number;
    }) => {
      const data: Record<string, any> = {
        offset: payload.offset,
      };

      if (payload.district) data.district = payload.district;
      if (payload.start_date) data.start_date = payload.start_date;
      if (payload.end_date) data.end_date = payload.end_date;

      return POST<ViewLt50Response>({
        url: API_URL.viewCitizenCountLessThan50Report,
        data,
      });
    },
  });
