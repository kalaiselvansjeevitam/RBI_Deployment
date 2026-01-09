// import { useMutation } from "@tanstack/react-query";
// import { POST } from "./axiosInstance";
// import { API_URL } from "../constants/coreUrl";

// import type {
//   GetStudentPaymentDetails,
//   GetSchoolPaymentDetailsView,
//   GetSchoolResgistrations,
//   GetSendPaymentLink,
//   GetStudentDetails,
//   GetSchoolPaymentDetails,
//   GetDashboardValues,
//   GetStudentDashboardValues,
//   GetAdminUserLogout,
// } from "../../lib/types";
// type StudentDetailsParams = {
//   start_date: string;
//   filter_by: string;
//   end_date: string;
//   offset: string;
// };
// type SchoolDetailsParams = {
//   start_date: string;
//   end_date: string;
//   offset: string;
// };

// type PaymentDetailsParams = {
//   school_id: number;
//   total_registrations: string;
// };
// type StudentRegistrationParams = {
//   file: File;
//   form_data: FormData;
// };

// export const useGetStudentDetails = () =>
//   useMutation({
//     mutationFn: () => {
//       return POST<GetStudentDetails>({
//         url: API_URL.getStudentDetails,
//         data: { get_by: "index" },
//       });
//     },
//   });

// import {
//   ActivityListResponse,
//   AssignmentListResponse,
//   DashboardValuesResponse,
//   LeadsResponse,
//   LiveEventsResponse,
//   TaskResponse,
//   ViewSocietyDataResponse,
// } from '@/app/lib/types';

// export const useGetDashboardValues = () =>
//   useMutation({
//     mutationFn: (userId: string) => {
//       return POST<DashboardValuesResponse>({
//         url: API_URL.dashboard,
//         data: { user_id: userId },
//       });
//     },
//   });

// export const useGetAllSocietyList = () =>
//   useMutation({
//     mutationFn: (userId: string) => {
//       return POST<AssignmentListResponse>({
//         url: API_URL.getAllsociety,
//         data: { user_id: userId },
//       });
//     },
//   });

// export const useGetSocietybyId = (userId: string) =>
//   useMutation({
//     mutationFn: (societyId: string) => {
//       return POST<ActivityListResponse>({
//         url: API_URL.getSocietyById,
//         data: { user_id: userId, assignment_id: societyId },
//       });
//     },
//   });

// export const useGetLiveOfflineEvents = (userId: string) =>
//   useMutation({
//     mutationFn: (date: string) => {
//       return POST<LiveEventsResponse>({
//         url: API_URL.getLiveOfflineEvents,
//         data: { user_id: userId, date: date },
//       });
//     },
//   });

// export const useGetSocietyViewData = (userId: string) =>
//   useMutation({
//     mutationFn: ({
//       assignment_id,
//       activityId,
//     }: {
//       assignment_id: string;
//       activityId: string;
//     }) => {
//       return POST<ViewSocietyDataResponse>({
//         url: API_URL.getSocietyViewData,
//         data: {
//           user_id: userId,
//           assignment_id: assignment_id,
//           activity_id: activityId,
//         },
//       });
//     },
//   });

// export const useGetLeadsByActivity = (userId: string) =>
//   useMutation({
//     mutationFn: ({
//       assignment_id,
//       activityId,
//     }: {
//       assignment_id: string;
//       activityId: string;
//     }) => {
//       return POST<LeadsResponse>({
//         url: API_URL.getLeadsByActivity,
//         data: {
//           user_id: userId,
//           assignment_id: assignment_id,
//           activity_id: activityId,
//         },
//       });
//     },
//   });

// export const useGetTaskBySocietyId = (userId: string) =>
//   useMutation({
//     mutationFn: ({ assignment_id }: { assignment_id: string }) => {
//       return POST<TaskResponse>({
//         url: API_URL.getCompletedTasks,
//         data: {
//           user_id: userId,
//           assignment_id: assignment_id,
//         },
//       });
//     },
//   });
