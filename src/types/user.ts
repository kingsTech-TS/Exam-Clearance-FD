export type UserRole = "STUDENT" | "STAFF" | "ADMIN";
export type StaffSubRole = "BURSAR" | "AUDITOR" | "HOD";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface MediaAsset {
  public_id: string;
  url: string;
  processed_url?: string;
  uploaded_at?: string;
}

export interface StudentProfileResponse {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  matric_number?: string;
  registration_number?: string;
  faculty: string;
  department: string;
  level: string;
  passport?: MediaAsset;
  signature?: MediaAsset;
  passport_url?: string;
  signature_url?: string;
  passport_uploaded?: boolean;
  signature_uploaded?: boolean;
  profile_completed?: boolean;
  profile_complete?: boolean;
  is_suspended?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StaffProfileResponse {
  id: string;
  user_id?: string;
  full_name: string;
  staff_id: string;
  sub_role: StaffSubRole;
  faculty: string;
  department?: string;
  passport?: MediaAsset;
  signature?: MediaAsset;
  seal?: MediaAsset;
  passport_url?: string;
  signature_url?: string;
  seal_url?: string;
  passport_uploaded?: boolean;
  signature_uploaded?: boolean;
  seal_uploaded?: boolean;
  profile_completed?: boolean;
  profile_complete?: boolean;
  approval_status: ApprovalStatus;
  created_at?: string;
  updated_at?: string;
}

export interface AdminProfileResponse {
  id: string;
  full_name: string;
  email: string;
  role: "ADMIN";
  created_at?: string;
}

export interface StudentDashboardResponse {
  profile?: StudentProfileResponse;
  profile_complete?: boolean;
  profile_completed?: boolean;
  clearance_status?: string | null;
  course_form_status?: string | null;
  total_documents?: number;
  pending_documents?: number;
  completed_documents?: number;
  rejected_documents?: number;
  clearance_form?: import('./document').DocumentResponse;
  course_form?: import('./document').DocumentResponse;
}

export interface StaffDashboardResponse {
  profile?: StaffProfileResponse;
  pending_count?: number;
  signed_today?: number;
  rejected_count?: number;
  pending_documents_count?: number;
  signed_documents_count?: number;
  rejected_documents_count?: number;
  recent_documents?: import('./document').DocumentResponse[];
}
