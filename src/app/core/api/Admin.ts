import { useMutation } from "@tanstack/react-query";
import { GET, POST } from "./axiosInstance";
import { API_URL } from "../constants/coreUrl";
import type {
  GetAllUsersResponse,
  GetCitizenbyCardRes,
  GetCityCountRes,
  GetDistrictListRes,
  GetGenderCountRes,
  GetLocationListRes,
  GetResponse,
  GetResponsewithFile,
  GetResponseWithId,
  GetResViewTestimony,
  GetWorkshopByFilters,
  GetWorkshopDetails,
  GetWorkshopRes,
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
  district_name: string;
  sub_district_name: string;
  city: string;
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
  email_id: string;
  qualification: string;
  age: number;
  gender: string;
  work_shop_id: string;
  father_name: string;
  mother_name: string;
  district: string;
  state: string;
  pincode: string;
};

type CreateWorkShopParams = {
  workshop_name: string;
  date: string;
  from_time: string;
  to_time: string;
  city: string;
  pincode: string;
  location: string;
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
      city,
      pincode,
      location,
    }: CreateWorkShopParams) => {
      return POST<GetResponseWithId>({
        url: API_URL.createWorkShop,
        data: {
          workshop_name: workshop_name,
          date: date,
          from_time: from_time,
          to_time: to_time,
          city: city,
          pincode: pincode,
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
      email_id,
      qualification,
      age,
      gender,
      work_shop_id,
      father_name,
      mother_name,
      district,
      state,
      pincode,
    }: CreateCitizenParams) => {
      return POST<GetResponseWithId>({
        url: API_URL.createCitizen,
        data: {
          name: name,
          mobile_number: mobile_number,
          email_id: email_id,
          qualification: qualification,
          age: age,
          gender: gender,
          work_shop_id: work_shop_id,
          father_name: father_name,
          mother_name: mother_name,
          district: district,
          state: state,
          pincode: pincode,
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
    mutationFn: (data: { work_shop_id: string; status: string }) => {
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
      district_name,
      sub_district_name,
      city,
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
          district_name: district_name,
          specilization: specilization,
          sub_district_name: sub_district_name,
          city: city,
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
    mutationFn: (data:{workshop_id : string}) => {
      return POST<TestimonyResponse>({
        url: API_URL.getWorkshopStatus,
        data
      });
    },
  });

  export const useApproveTestimony = () =>
  useMutation({
    mutationFn: (data:{testimony_id : number,approve_status:string,rejected_reason:string}) => {
      return POST<TestimonyResponse>({
        url: API_URL.getWorkshopStatus,
        data
      });
    },
  });
  export const useRejectTestimony = () =>
  useMutation({
    mutationFn: (data:{workshop_id : string}) => {
      return POST<TestimonyResponse>({
        url: API_URL.getWorkshopStatus,
        data
      });
    },
  });