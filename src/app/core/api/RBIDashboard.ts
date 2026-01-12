/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { API_URL } from "../constants/coreUrl";
import { POST } from "./axiosInstance";

/** Common backend envelope used in your codebase */
export type ApiEnvelope<T> = {
  result: string; // "Success" | "Error" | sometimes "success"
  message: string;
  data: T;
  list: T;
};

/**
 * We keep response types flexible because backend fields can vary.
 * After you paste one real response JSON, we can tighten + normalize.
 */

// 1) Card values
export type RBIDashboardCards = Record<string, any>;
export const useGetRBIDashboardValues = () =>
  useMutation({
    mutationFn: () => {
      return POST<ApiEnvelope<RBIDashboardCards>>({
        url: API_URL.rbiDashboardValues,
      });
    },
  });

// 2/3/4) Donut graphs
export type DonutApiData = any;

export const useGetPendingVsCompleted = () =>
  useMutation({
    mutationFn: () => {
      return POST<ApiEnvelope<DonutApiData>>({
        url: API_URL.pendingVSCompleted,
      });
    },
  });

export const useGetScheduledVsCancelled = () =>
  useMutation({
    mutationFn: () => {
      return POST<ApiEnvelope<DonutApiData>>({
        url: API_URL.scheduledVSCancelled,
      });
    },
  });

export const useGetMaleVsFemale = () =>
  useMutation({
    mutationFn: () => {
      return POST<ApiEnvelope<DonutApiData>>({
        url: API_URL.maleVSFemale,
      });
    },
  });

// 5) District-wise bar graph (district required)
export type DistrictBarGraphData = any;
export const useGetDistrictWiseWorkshopBarGraph = () =>
  useMutation({
    mutationFn: (data: { district: string }) => {
      return POST<ApiEnvelope<DistrictBarGraphData>>({
        url: API_URL.districtWiseWorkshopBarGraph,
        data,
      });
    },
  });

// 6) Month-wise bar graph (month required)
export type MonthBarGraphData = any;
export const useGetMonthWiseWorkshopBarGraph = () =>
  useMutation({
    mutationFn: (data: { month: string }) => {
      return POST<ApiEnvelope<MonthBarGraphData>>({
        url: API_URL.monthWiseWorkshopBarGraph,
        data,
      });
    },
  });

// 7) Programs conducted bar graph
export type ProgramsConductedRow = {
  program_name: string;
  count: string;
};

export type ProgramsConductedResponse = {
  result: string;
  message: string;
  list: ProgramsConductedRow[];
};

export const useGetProgramsConductedBarGraph = () =>
  useMutation({
    mutationFn: () => {
      return POST<ProgramsConductedResponse>({
        url: API_URL.programsConductedbarGraph,
        // data,
      });
    },
  });

// 8) Top 5 VLEs
export type TopVleRow = {
  vle_id?: string;
  vle_name: string;
  district: string;
  completed_count: string;
  approved_count: string;
};

export type Top5VlesResponse = {
  result: string;
  message: string;
  total?: string; // sometimes "total"
  list: TopVleRow[];
};

export const useGetTop5Vles = () =>
  useMutation({
    mutationFn: (data?: { offset?: number }) => {
      return POST<Top5VlesResponse>({
        url: API_URL.top5vles,
        data: {
          offset: String(data?.offset ?? 0),
        },
      });
    },
  });

// 9) Top 5 Districts
export type TopDistrictRow = {
  district: string;
  completed_count: string;
  approved_count: string;
};

export type Top5DistrictsResponse = {
  result: string;
  message: string;
  total?: string;
  list: TopDistrictRow[];
};

export const useGetTop5Districts = () =>
  useMutation({
    mutationFn: (data?: { offset?: number }) => {
      return POST<Top5DistrictsResponse>({
        url: API_URL.top5districts,
        data: {
          offset: String(data?.offset ?? 0),
        },
      });
    },
  });

// 10) Get Workshop List
export type WorkshopListItem = {
  workshop_id: number;
  workshop_date: string;
  workshop_from_time: string;
  workshop_to_time: string;
  workshop_status: string;
  workshop_centre: string;
  workshop_district: string;
  workshop_pincode: string;
  vle_id: string;
  vle_mobile_number: number;
  vle_name: string;
};

export type GetWorkshopListResponse = {
  result: string; // "Success"
  message: string;
  count: number;
  data: WorkshopListItem[];
};

export const useGetWorkshopList = () =>
  useMutation({
    mutationFn: (data: {
      offset: number;
      work_shop_status?: string;
      vle_id?: string;
      start_date?: string;
      end_date?: string;
      district?: string;
    }) =>
      POST<GetWorkshopListResponse>({
        url: API_URL.getWorkShop,
        data: {
          offset: data.offset ?? 0,
          work_shop_status: data.work_shop_status ?? "",
          vle_id: data.vle_id ?? "",
          start_date: data.start_date ?? "",
          end_date: data.end_date ?? "",
          district: data.district ?? "",
        },
      }),
  });