import type { StaffSubRole, ApprovalStatus } from './user';

export interface AdminStudentRow {
  id: string;
  full_name: string;
  email: string;
  matric_number?: string;
  registration_number?: string;
  faculty: string;
  department: string;
  level: string;
  passport_url?: string;
  is_suspended: boolean;
  documents_count: number;
  created_at: string;
}

export interface AdminStaffRow {
  id: string;
  full_name: string;
  staff_id: string;
  sub_role: StaffSubRole;
  faculty: string;
  department?: string;
  approval_status: ApprovalStatus;
  passport_url?: string;
  created_at: string;
}

export type Semester = "FIRST" | "SECOND";
export type ClearancePeriodStatus = "ACTIVE" | "INACTIVE";

export interface ClearancePeriod {
  id: string;
  session: string;
  semester: Semester;
  start_date: string;
  end_date: string;
  status: ClearancePeriodStatus;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClearancePeriodCreateOrUpdateRequest {
  session: string;
  semester: Semester;
  start_date: string;
  end_date: string;
  status?: ClearancePeriodStatus;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  target_id?: string;
  target_type?: string;
  description: string;
  created_at: string;
}

export interface AnalyticsData {
  total_students: number;
  total_staff: number;
  pending_staff_approvals: number;
  total_documents: number;
  documents_pending: number;
  documents_completed: number;
  documents_rejected: number;
  student_by_faculty: Array<{ faculty: string; count: number }>;
  student_by_level: Array<{ level: string; count: number }>;
  document_processing: {
    avg_bursar_hours: number;
    avg_auditor_hours: number;
    avg_hod_hours: number;
    completion_rate: number;
  };
  staff_activity: Array<{
    staff_name: string;
    signed: number;
    rejected: number;
  }>;
}

export interface HealthData {
  api: { status: "healthy" | "degraded" | "down"; latency_ms?: number };
  mongodb: { status: "healthy" | "degraded" | "down"; latency_ms?: number };
  s3: { status: "healthy" | "degraded" | "down"; latency_ms?: number };
  cloudinary: { status: "healthy" | "degraded" | "down"; latency_ms?: number };
  checked_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
