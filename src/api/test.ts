import { http } from "@/utils/http";

// 定义权限接口返回数据
export type Permission = {
  success: boolean;
  data: object;
  msg: string;
};

/** 权限测试接口 */
export const getTestPermission = (params?: object) => {
  return http.request<Permission>("get", "/api/test/permission/", { params });
};

/** 权限测试接口 */
export const getTestPermission2 = (data?: object) => {
  return http.request<Permission>("get", "/api/test/permission2/", { data });
};
