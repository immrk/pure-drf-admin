import { http } from "@/utils/http";

export type UserResult = {
  success: boolean;
  data: {
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
  msg: string;
};

export type UserListResult = {
  success: boolean;
  data: Array<object>;
  msg: string;
  total: number;
  page: number;
  limit: number;
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
  msg: string;
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/api/user/login/", { data });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/api/token/refresh/", {
    data
  });
};

/** 获取用户数据列表 */
export const getUserList = (params?: object) => {
  return http.request<UserListResult>("get", "/api/user/", { params });
};

/** 更新用户数据 */
export const patchUser = (id?: number, data?: object) => {
  return http.request<UserResult>("patch", "/api/user/" + id + "/", { data });
};

/** 新增用户数据 */
export const postUser = (data?: object) => {
  return http.request<UserResult>("post", "/api/user/", { data });
};

/** 删除用户数据 */
export const deleteUser = (id?: number) => {
  return http.request<UserResult>("delete", "/api/user/" + id + "/");
};
