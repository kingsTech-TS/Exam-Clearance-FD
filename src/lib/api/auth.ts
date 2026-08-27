import client from "./client";
import type {
  DataResponse,
  TokenResponse,
  StudentRegisterRequest,
  StudentLoginRequest,
  StaffRegisterRequest,
  StaffLoginRequest,
  AdminLoginRequest,
} from "@/types/api";

export const authApi = {
  studentRegister: (data: StudentRegisterRequest) =>
    client.post<DataResponse<{ message: string }>>("/auth/student/register", data),

  studentLogin: (data: StudentLoginRequest) =>
    client.post<DataResponse<TokenResponse>>("/auth/student/login", data),

  staffRegister: (data: StaffRegisterRequest) =>
    client.post<DataResponse<{ message: string }>>("/auth/staff/register", data),

  staffLogin: (data: StaffLoginRequest) =>
    client.post<DataResponse<TokenResponse>>("/auth/staff/login", data),

  adminLogin: (data: AdminLoginRequest) =>
    client.post<DataResponse<TokenResponse>>("/auth/admin/login", data),

  refresh: (refresh_token: string) =>
    client.post<DataResponse<TokenResponse>>("/auth/refresh", { refresh_token }),

  logout: () =>
    client.post<DataResponse<null>>("/auth/logout"),
};
