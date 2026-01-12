// import axios,{AxiosRequestConfig,AxiosResponse} from 'axios';
// import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios, { type AxiosResponse } from "axios";
import type { AxiosRequestConfig } from "axios";

// import { useNavigate } from 'react-router-dom';
import { DEFAULT_API_TIMEOUT } from "../constants/constants";
import { ROUTE_URL } from "../constants/coreUrl";
import Swal from "sweetalert2";

const axiosInstance = axios.create({
  // baseURL: "http://localhost/olympiad/",
  baseURL: "http://lochanaragupathy.com/rbi_deployment/api/",
  // baseURL :"https://jeevitam.in/rbi-deployment/api/",
  // baseURL :"https://jeevitam.in/jeevitam.in/kalaiarasan/rbi-deployment/api/",
  timeout: DEFAULT_API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("session_token");
  const userId = sessionStorage.getItem("user_id");

  if (config.url?.includes("/user-login")) {
    return config;
  }

  if (
    config.method === "post" ||
    config.method === "put" ||
    config.method === "delete"
  ) {
    if (config.data) {
      if (config.data instanceof FormData) {
        if (token) config.data.append("session_token", token);
        if (userId) config.data.append("user_id", userId);
      } else if (typeof config.data === "object") {
        config.data = {
          ...config.data,
          session_token: token,
          user_id: userId,
        };
      }
    } else {
      config.data = {
        session_token: token,
        user_id: userId,
      };
    }
  }

  return config;
});

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if ([440].includes(error.response?.status)) {
      await sessionStorage.removeItem("session_token");
      await Swal.fire(
        "Error",
        "Something went wrong! Login Again",
        "error",
      ).then(() => {
        setTimeout(() => {
          window.location.href = ROUTE_URL.login;
        }, 1000); // 1 second delay
      });
    }
    return Promise.reject(error);
  },
);

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response.status === 404) {
//       const navigate = useNavigate();
//       navigate(ROUTE_URL.login);
//       Swal.fire("Error", "Something went wrong! Login Again", "error");
//     }
//     return Promise.reject(error);
//   },
// );

type AxiosRequestConfigType = Omit<AxiosRequestConfig, "method">;

const axiosClient = async <TResponseData>(
  axiosConfig: AxiosRequestConfig,
): Promise<TResponseData> => {
  return axiosInstance({ ...axiosConfig }).then((res) => res.data);
};

export const GET = <TResponseData>(
  config: AxiosRequestConfigType,
): Promise<TResponseData> => axiosClient({ method: "GET", ...config });

export const POST = <TResponseData>(
  config: AxiosRequestConfigType,
): Promise<TResponseData> => axiosClient({ method: "POST", ...config });

export const PUT = <TResponseData>(
  config: AxiosRequestConfigType,
): Promise<TResponseData> => axiosClient({ method: "PUT", ...config });

export const DELETE = <TResponseData>(
  config: AxiosRequestConfigType,
): Promise<AxiosResponse<TResponseData>> =>
  axiosClient({ method: "DELETE", ...config });
