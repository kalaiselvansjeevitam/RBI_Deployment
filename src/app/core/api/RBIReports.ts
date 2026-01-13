/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { API_URL } from "../constants/coreUrl";
import { POST } from "./axiosInstance";

export type DownloadReportResponse = {
  result: string; // "Success" | "Error"
  message: string;
  data: string; // download URL
};

export type ReportTableResponse<T> = {
  status: string; // "Success"
  message: string;
  count: number;
  data: T[];
};

// 1) District-wise workshop report (district optional)
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

// 2) Gender-wise workshop report (district optional)
export const useDownloadGenderWiseWorkshopReport = () =>
  useMutation({
    mutationFn: (data?: { district?: string }) => {
      return POST<DownloadReportResponse>({
        url: API_URL.downloadGenderWiseWorkshopReport,
        data: {
          district: data?.district ?? "",
        },
      });
    },
  });

// 3) Citizen data by district (district + start/end required per doc)
export const useDownloadCitizenDataByDistrictReport = () =>
  useMutation({
    mutationFn: (data: {
      district: string;
      start_date: string; // YYYY-MM-DD
      end_date: string; // YYYY-MM-DD
    }) => {
      return POST<DownloadReportResponse>({
        url: API_URL.downloadCitizenDataByDistrictReport,
        data,
      });
    },
  });

// 4) Location-manager-wise workshop report (district required, dates optional)
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

// 5) District-wise by status workshop report (no filters)
export const useDownloadDistrictWiseByStatusWorkshopReport = () =>
  useMutation({
    mutationFn: () => {
      return POST<DownloadReportResponse>({
        url: API_URL.downloadDistrictWiseByStatusWorkshopReport,
      });
    },
  });

// 6) Workshops < 50 report (district required, dates optional)
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

// 7) District-wise Workshop Report (VIEW)
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

// 8) Gender-wise Workshop Report (VIEW)
export type GenderWorkshopRow = {
  district: string;
  location: string;
  topic: string;
  male_count: string;
  female_count: string;
  others_count: string;
};

export const useViewGenderWiseWorkshopReport = () =>
  useMutation({
    mutationFn: (data: { district?: string; offset: number }) =>
      POST<ReportTableResponse<GenderWorkshopRow>>({
        url: API_URL.viewGenderWiseWorkshopReport,
        data,
      }),
  });

// 9) Citizen Data by District (VIEW)
export type CitizenRow = {
  vle_id: string;
  vle_name: string;
  district: string;
  citizen_name: string;
  mobile_number: string;
  program_name: string;
  gender: string;
  program_date: string;
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

export const useViewCitizenDataByDistrictReport = () =>
  useMutation({
    mutationFn: (payload: {
      district: string;
      offset: number;
      start_date?: string;
      end_date?: string;
    }) => {
      // Build the data object - district and offset are required
      const data: any = {
        district: payload.district,
        offset: payload.offset,
      };

      // Add optional date fields if provided
      if (payload.start_date) data.start_date = payload.start_date;
      if (payload.end_date) data.end_date = payload.end_date;

      // NOTE: session_token and user_id should be automatically added
      // by your POST utility or axios interceptor
      return POST<ViewCitizenResponse>({
        url: API_URL.viewCitizenDataByDistrictReport,
        data,
      });
    },
  });

// 10) District-wise by Status Workshop Report (VIEW)
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

// 11) Workshops with Citizen Count Less Than 50 (VIEW)
export type ViewLt50Row = {
  district: string;
  location: string;
  vle_name: string;
  date: string;
  citizens_count: string;
};

export type ViewLt50Response = {
  status: string; // "Success"
  message: string;
  count: number; // total rows
  data: ViewLt50Row[];
};

export const useViewCitizenCountLessThan50Report = () =>
  useMutation({
    mutationFn: (payload: {
      district?: string;
      start_date?: string;
      end_date?: string;
      offset?: number;
    }) => {
      const data: Record<string, any> = {
        offset: payload.offset ?? 0,
      };

      if (payload.district) data.district = payload.district;
      if (payload.start_date) data.start_date = payload.start_date;
      if (payload.end_date) data.end_date = payload.end_date;

      return POST<any>({
        url: API_URL.viewCitizenCountLessThan50Report,
        data,
      });
    },
  });
