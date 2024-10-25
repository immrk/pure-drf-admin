import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data: Array<any>;
  msg: string;
};

export const getAsyncRoutes = () => {
  return http.request<Result>("get", "api/system/asyncroutes/");
};
