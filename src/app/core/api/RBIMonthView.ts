/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { API_URL } from "../constants/coreUrl";
import { POST } from "./axiosInstance";

/**
 * Backend typically returns:
 * { result: "Success"|"Error", message: string, data: ... }
 * if backend differs, we have to adjust after seeing the response JSON.
 */
export type ApiEnvelope<T> = {
  list: any;
  result: string;
  message: string;
  total : number;
  data: T;
};

/** ---------- Month View: Card Values ---------- */
export type MonthViewCardData = {
  total_planned_sessions: number;
  total_completed: number;
  pending_approval: number;
  rejected: number;
};

// If backend returns keys like Planned/Completed/etc instead,
// we’ll normalize later, but this is the clean expected shape.
export type MonthViewCardResponse = ApiEnvelope<MonthViewCardData>;

export const useMonthViewCardValues = () =>
  useMutation({
    mutationFn: (data: { month: string }) => {
      return POST<MonthViewCardResponse>({
        url: API_URL.monthViewCardValues,
        data,
      });
    },
  });

/** ---------- Month View: Table (Month + optional District) ---------- */
export type MonthDistrictRow = {
  district: string;
  scheduled: number;
  completed: number;
  approved: number;
  rejected: number;
};

export type MonthAndDistrictResponse = ApiEnvelope<{
  list: MonthDistrictRow[];
  total?: number;
  offset?: number;
}>;

export const useMonthAndDistrict = () =>
  useMutation({
    mutationFn: (data: {
      month: string;
      offset: number;
      district?: string; // optional
    }) => {
      // if district not provided, don’t send it
      const payload: any = { month: data.month, offset: data.offset };
      if (data.district && data.district.trim())
        payload.district = data.district.trim();

      return POST<MonthAndDistrictResponse>({
        url: API_URL.monthAndDistrict,
        data: payload,
      });
    },
  });
