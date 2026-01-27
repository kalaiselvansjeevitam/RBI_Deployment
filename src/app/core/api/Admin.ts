import { useMutation } from "@tanstack/react-query";
import { GET, POST } from "./axiosInstance";
import { API_URL } from "../constants/coreUrl";
import type {
  allStatusCountersRes,
  BlockPanchayatResponse,
  districtByLocationResponse,
  districtWiseWorkshopBarGraphRes,
  GetAllUsersResponse,
  GetCitizenbyCardRes,
  GetCityCountRes,
  GetDashboardStatsRes,
  GetDistrictListRes,
  GetGenderCountRes,
  GetLocationListRes,
  GetMediaCountResponse,
  GetResponse,
  GetResponsewithFile,
  GetResponseWithId,
  GetResViewTestimony,
  GetWorkshopByFilters,
  GetWorkshopDetails,
  GetWorkshopRes,
  GramPanchayatResponse,
  occupationResponse,
  TestimonyResponse,
  VLEDashboardResponse,
  VLEUsersResponse,
  WorkshopsResponse,
  WorkshopStatusResponse,
} from "../../lib/types";

type UserCreateParams = {
  first_name: string;
  last_name: string;
  mobile_number: string;
  email_id: string;
  address: string;
  salutations: string;
  user_type: string;
  district: string;
  sub_district: string;
  csc_id: string;
};
type SchoolDetailsParams = {
  start_date: string;
  end_date: string;
  offset: string;
  work_shop_status: string;
};

type UserUpdateParams = {
  username: string;
  address: string;
  sub_district_name: string;
  district_name: string;
  state: string;
  pincode: string;
  specilization: string;
  degree: string;
  salutations: string;
  change_user_id: string;
};

type CreateCitizenParams = {
  name: string;
  mobile_number: string;
  occupation: string;
  age: number;
  gender: string;
  work_shop_id: string;
  district: string;
  gram_panchayat_name: string;
  gram_panchayat_code: string;
  block_panchayat_name: string;
};

type CreateWorkShopParams = {
  workshop_name: string;
  date: string;
  from_time: string;
  to_time: string;
  district: string;
  location: string;
  block_panchayat: string;
  gram_panchayat: string;
  gram_panchayat_code: string;
};

export const useGetUserCreateParams = () =>
  useMutation({
    mutationFn: ({
      first_name,
      last_name,
      mobile_number,
      email_id,
      address,
      salutations,
      user_type,
      district,
      sub_district,
      csc_id,
    }: UserCreateParams) => {
      return POST<GetResponse>({
        url: API_URL.createUser,
        data: {
          first_name: first_name,
          last_name: last_name,
          mobile_number: mobile_number,
          email_id: email_id,
          address: address,
          salutations: salutations,
          user_type: user_type,
          district: district,
          sub_district: sub_district,
          csc_id: csc_id,
        },
      });
    },
  });

export const useGetCreateWorkshopParams = () =>
  useMutation({
    mutationFn: ({
      workshop_name,
      date,
      from_time,
      to_time,
      district,
      block_panchayat,
      gram_panchayat,
      gram_panchayat_code,
      location,
    }: CreateWorkShopParams) => {
      return POST<GetResponseWithId>({
        url: API_URL.createWorkShop,
        data: {
          workshop_name: workshop_name,
          date: date,
          from_time: from_time,
          to_time: to_time,
          district: district,
          gram_panchayat_code: gram_panchayat_code,
          gram_panchayat: gram_panchayat,
          block_panchayat: block_panchayat,
          location_manager: location,
        },
      });
    },
  });

export const useGetCreateCitizenParams = () =>
  useMutation({
    mutationFn: ({
      name,
      mobile_number,
      age,
      gender,
      work_shop_id,
      occupation,
      district,
      gram_panchayat_name,
      gram_panchayat_code,
      block_panchayat_name,
    }: CreateCitizenParams) => {
      return POST<GetResponseWithId>({
        url: API_URL.createCitizen,
        data: {
          name: name,
          mobile_number: mobile_number,
          gram_panchayat: gram_panchayat_name,
          gram_panchayat_code: gram_panchayat_code,
          block_panchayat: block_panchayat_name,
          age: age,
          occupation: occupation,
          gender: gender,
          work_shop_id: work_shop_id,
          district: district,
        },
      });
    },
  });

export const useGetWorkshopParams = () =>
  useMutation({
    mutationFn: () => {
      return POST<GetWorkshopRes>({
        url: API_URL.getWorkshop,
      });
    },
  });
export const useGetMediaCount = () =>
  useMutation({
    mutationFn: (data: { workshop_id: string }) => {
      return POST<GetMediaCountResponse>({
        url: API_URL.getworkshoptestimonyCount,
        data,
      });
    },
  });

export const useGetMapCitizen = () =>
  useMutation({
    mutationFn: (formData: FormData) => {
      return POST<GetResponsewithFile>({
        url: API_URL.uploadCitizens, // 👈 correct API
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });

export const useGetUpdateTestimony = () =>
  useMutation({
    mutationFn: (formData: FormData) => {
      return POST<GetResponsewithFile>({
        url: API_URL.uploadTestimony,
        timeout: 50000,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });

export const useGetUploadVle = () =>
  useMutation({
    mutationFn: (formData: FormData) => {
      return POST<GetResponsewithFile>({
        url: API_URL.uploadVle,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });

export const useGetWorkshopByFilters = () =>
  useMutation({
    mutationFn: (data: { offset: string; get_by: string }) => {
      return POST<GetWorkshopByFilters>({
        url: API_URL.getWorkshopByFilters,
        data,
      });
    },
  });

export const useGetWorkshopByFiltersByDate = () =>
  useMutation({
    mutationFn: ({
      start_date,
      end_date,
      offset,
      work_shop_status,
    }: SchoolDetailsParams) => {
      return POST<GetWorkshopByFilters>({
        url: API_URL.getWorkshopByFilters,
        data: {
          get_by: "filters",
          offset: offset,
          start_date: start_date,
          end_date: end_date,
          work_shop_status: work_shop_status,
        },
      });
    },
  });

export const useGetupdateChecklist = () =>
  useMutation({
    mutationFn: (data: { work_shop_id: string; checklist: string }) => {
      return POST<GetResponse>({
        url: API_URL.updateChecklist,
        data,
      });
    },
  });

export const useGetupdateWorkshopStatus = () =>
  useMutation({
    mutationFn: (data: {
      work_shop_id: string;
      status: string;
      notes: string;
    }) => {
      return POST<GetResponse>({
        url: API_URL.updateStatus,
        data,
      });
    },
  });

export const useGetViewTestimony = () =>
  useMutation({
    mutationFn: (data: { workshop_id: string }) => {
      return POST<GetResViewTestimony>({
        url: API_URL.viewTestimony,
        data,
      });
    },
  });

export const useGetVLEDashboard = () =>
  useMutation({
    mutationFn: () => {
      return POST<VLEDashboardResponse>({
        url: API_URL.vleDasboard,
      });
    },
  });

export const useGetViewCitizenByCard = () =>
  useMutation({
    mutationFn: (data: {
      work_shop_id: string;
      offset: number;
      getBy: string;
    }) => {
      return POST<GetCitizenbyCardRes>({
        url: API_URL.getCitizens,
        data,
      });
    },
  });

export const useGetWorkshopDetails = () =>
  useMutation({
    mutationFn: (data: { work_shop_id: string }) => {
      return POST<GetWorkshopDetails>({
        url: API_URL.getWorkshopDetails,
        data,
      });
    },
  });

export const useGetgetallusers = () =>
  useMutation({
    mutationFn: (data: { offset: string }) => {
      return POST<GetAllUsersResponse>({
        url: API_URL.getallusers,
        data,
      });
    },
  });

export const useGetUpdateUser = () =>
  useMutation({
    mutationFn: ({
      username,
      address,
      sub_district_name,
      district_name,
      state,
      pincode,
      specilization,
      degree,
      salutations,
      change_user_id,
    }: UserUpdateParams) => {
      return POST<GetResponse>({
        url: API_URL.updateUsers,
        data: {
          username: username,
          address: address,
          specilization: specilization,
          sub_district_name: sub_district_name,
          district_name: district_name,
          degree: degree,
          change_user_id: change_user_id,
          state: state,
          pincode: pincode,
          salutations: salutations,
        },
      });
    },
  });

export const useGetDeleteUser = () =>
  useMutation({
    mutationFn: (data: { delete_user_id: string }) => {
      return POST<GetResponse>({
        url: API_URL.deleteUser,
        data,
      });
    },
  });

export const useChangeUserPassword = () =>
  useMutation({
    mutationFn: (data: { new_password: string; change_user_id: string }) => {
      return POST<GetResponse>({
        url: API_URL.updatePassword,
        data,
      });
    },
  });

export const useGetLocationManagerParams = () =>
  useMutation({
    mutationFn: (data: { getBy: string; offset: number }) => {
      return POST<GetLocationListRes>({
        url: API_URL.getLocationManager,
        data,
      });
    },
  });

export const useGetgenderWiseDonutParams = () =>
  useMutation({
    mutationFn: () => {
      return POST<GetGenderCountRes>({
        url: API_URL.genderWiseDonut,
      });
    },
  });

export const useGetlocationWiseBarChartParams = () =>
  useMutation({
    mutationFn: () => {
      return POST<GetCityCountRes>({
        url: API_URL.locationWiseBarChart,
      });
    },
  });
export const useGetadminDashboardValuesParams = () =>
  useMutation({
    mutationFn: () => {
      return POST<GetDashboardStatsRes>({
        url: API_URL.adminDashboardValues,
      });
    },
  });

export const useGetDistrictParams = () =>
  useMutation({
    mutationFn: () => {
      return GET<GetDistrictListRes>({
        url: API_URL.getDistrict,
      });
    },
  });

export const useGetVleParams = () =>
  useMutation({
    mutationFn: (data: { get_by: string }) => {
      return POST<VLEUsersResponse>({
        url: API_URL.getVLE,
        data,
      });
    },
  });
export const useGetWorkShopParams = () =>
  useMutation({
    mutationFn: () => {
      return POST<WorkshopStatusResponse>({
        url: API_URL.getWorkshopStatus,
      });
    },
  });

export const useGetgetWorkshopList = () =>
  useMutation({
    mutationFn: (data: {
      offset: string;
      work_shop_status: string; // filter - optional
      vle_id: string; // optional
      start_date: string; // optional
      end_date: string; // optional
      district: string;
    }) => {
      return POST<WorkshopsResponse>({
        url: API_URL.getWorkShop,
        data,
      });
    },
  });

export const useGetTestimoniesByWorkshop = () =>
  useMutation({
    mutationFn: (data: { workshop_id: string }) => {
      return POST<TestimonyResponse>({
        url: API_URL.getTestimonyByWorkshop,
        data,
      });
    },
  });

export const useApproveTestimony = () =>
  useMutation({
    mutationFn: (data: {
      testimony_id: number;
      approve_status: string;
      rejected_reason: string;
    }) => {
      return POST<GetResponse>({
        url: API_URL.updateTestimonystatus,
        data,
      });
    },
  });
export const useRejectTestimony = () =>
  useMutation({
    mutationFn: (data: {
      testimony_id: number;
      approve_status: string;
      rejected_reason: string;
    }) => {
      return POST<GetResponse>({
        url: API_URL.updateTestimonystatus,
        data,
      });
    },
  });

export const useGetupdateWorkshopStatusByAdmin = () =>
  useMutation({
    mutationFn: (data: {
      workshop_id: number;
      workshop_status: string;
      rejected_reason: string;
    }) => {
      return POST<GetResponse>({
        url: API_URL.updateWorkshopStatus,
        data,
      });
    },
  });

export const useGetCreateLoactionManager = () =>
  useMutation({
    mutationFn: (data: {
      center_name: string;
      district: string;
      center_address: string;
      gram_panchayat: string;
      block_panchayat: string;
    }) => {
      return POST<GetResponse>({
        url: API_URL.createLocationManage,
        data,
      });
    },
  });

export const useUpdateLocationManager = () =>
  useMutation({
    mutationFn: (data: {
      center_name: string;
      district: string;
      block_panchayat: string;
      gram_panchayat: string;
      gram_panchayat_code: string;
      center_address: string;
      location_manager_id: number;
    }) => {
      return POST<GetResponse>({
        url: API_URL.updateLocationManager,
        data,
      });
    },
  });
export const useDeleteLocationManager = () =>
  useMutation({
    mutationFn: (data: { location_manager_id: number }) => {
      return POST<GetResponse>({
        url: API_URL.deleteLocationManager,
        data,
      });
    },
  });

export const useGetDownloadVLEParams = () =>
  useMutation({
    mutationFn: (data: { district: string }) => {
      return POST<GetResponsewithFile>({
        url: API_URL.downloadVLE,
        data,
      });
    },
  });

export const useGetDownloadCitizenParams = () =>
  useMutation({
    mutationFn: (data: {
      district: string;
      vle_id: string;
      start_date: string;
      end_date: string;
      gender: string;
    }) => {
      return POST<GetResponsewithFile>({
        url: API_URL.downloadCitizen,
        data,
      });
    },
  });
export const useGetDownloadWorkshopParams = () =>
  useMutation({
    mutationFn: (data: { district: string }) => {
      return POST<GetResponsewithFile>({
        url: API_URL.downloadWorkshop,
        data,
      });
    },
  });

export const useGetallStatusCountersParams = () =>
  useMutation({
    mutationFn: () => {
      return POST<allStatusCountersRes>({
        url: API_URL.allStatusCounters,
      });
    },
  });

export const useGetdistrictWiseWorkshopBarGraphParams = () =>
  useMutation({
    mutationFn: (data: { district: string }) => {
      return POST<districtWiseWorkshopBarGraphRes>({
        url: API_URL.districtWiseWorkshopBarGraph,
        data,
      });
    },
  });

export const useDeleteTestimony = () =>
  useMutation({
    mutationFn: (data: { testimony_id: string }) => {
      return POST<GetResponse>({
        url: API_URL.deleteTestimony,
        data,
      });
    },
  });

export const useGetDistrictByLocation = () =>
  useMutation({
    mutationFn: (data: { location_id: number }) => {
      return POST<districtByLocationResponse>({
        url: API_URL.getDistrictByLocation,
        data,
      });
    },
  });

export const useGetBlockPanchayat = () =>
  useMutation({
    mutationFn: (data: { district: string }) => {
      return POST<BlockPanchayatResponse>({
        url: API_URL.getBlockPanchayat,
        data,
      });
    },
  });

export const useGetGramPanchayat = () =>
  useMutation({
    mutationFn: (data: { block_panchayat_name: string }) => {
      return POST<GramPanchayatResponse>({
        url: API_URL.getGramPanchayat,
        data,
      });
    },
  });

export const usegetOccupations = () =>
  useMutation({
    mutationFn: () => {
      return POST<occupationResponse>({
        url: API_URL.getOccupations,
      });
    },
  });
