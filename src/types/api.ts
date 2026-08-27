// Generic API response wrappers
export interface DataResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Auth request payloads
export interface StudentRegisterRequest {
  full_name: string;
  email: string;
  matric_number?: string;
  registration_number?: string;
  faculty: string;
  department: string;
  level: string;
  password: string;
  confirm_password: string;
}

export interface StudentLoginRequest {
  identifier: string; // matric or reg number
  password: string;
}

export interface StaffRegisterRequest {
  full_name: string;
  sub_role: "BURSAR" | "AUDITOR" | "HOD";
  faculty: string;
  department?: string;
  staff_id: string;
  password: string;
  confirm_password: string;
}

export interface StaffLoginRequest {
  staff_id: string;
  password: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}
