import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data: Array<any>;
  msg: string;
  page: number;
  limit: number;
  total: number;
};

export const getLoginlog = (params?: object) => {
  return http.request<Result>("get", "api/monitor/loginlog/", { params });
};

export const deleteAllLoginlog = () => {
  return http.request<Result>("delete", "api/monitor/clearloginlog/");
};

export const getOperationlog = (params?: object) => {
  return http.request<Result>("get", "api/monitor/operationlog/", { params });
};

export const deleteAllOperationlog = () => {
  return http.request<Result>("delete", "api/monitor/clearoperationlog/");
};
