import { useMutation } from "@tanstack/react-query";
import { POST } from "./axiosInstance";
import { API_URL } from "../constants/coreUrl";

type loginPayload = {
  username: string;
  password: string;
};
type loginRes = {
  message: string;
  result: string;
  data: {
    unique_user_id: string;
    name: string;
    last_log_in: string;
    last_login_via: string;
    user_type: string;
    session_token: string;
    login_update: string;
  };
};
export const login = () =>
  useMutation({
    mutationFn: (payload: loginPayload) =>
      POST<loginRes>({
        url: API_URL.login,
        data: payload,
      }),
  });
