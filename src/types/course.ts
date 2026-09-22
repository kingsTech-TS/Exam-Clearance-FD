export type SemesterType = "FIRST" | "SECOND";
export type CourseStatusType = "ACTIVE" | "INACTIVE";
// Backend statuses: DRAFT → PENDING_HOD → (REJECTED | COMPLETED)
// COMPLETED means HOD has approved and the Course Form PDF has been generated
export type CourseRegistrationStatus = "DRAFT" | "PENDING_HOD" | "REJECTED" | "APPROVED" | "COMPLETED" | "SUBMITTED";

export interface Course {
  id: string;
  course_code: string;
  course_title: string;
  units: number;
  faculty: string;
  department: string;
  level: string;
  semester: SemesterType;
  session: string;
  status: CourseStatusType;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface CourseCreateRequest {
  course_code: string;
  course_title: string;
  units: number;
  level: string;
  semester: SemesterType;
  session: string;
}

export interface CourseUpdateRequest {
  course_code?: string;
  course_title?: string;
  units?: number;
  level?: string;
  semester?: SemesterType;
  session?: string;
  status?: CourseStatusType;
}

export interface CourseBulkError {
  row: number;
  field?: string;
  message: string;
}

export interface CourseBulkResponse {
  success: boolean;
  success_count: number;
  failed_rows: number;
  errors: CourseBulkError[];
}

export interface CourseSnapshot {
  course_id: string;
  course_code: string;
  course_title: string;
  units: number;
}

export interface CourseRejectionInfo {
  rejected_by: string;
  rejected_by_name?: string;
  reason: string;
  timestamp: string;
}

export interface CourseRegistration {
  id: string;
  student_id: string;
  student_name?: string;
  student_matric_or_reg?: string;
  faculty: string;
  department: string;
  level: string;
  session: string;
  semester: SemesterType;
  courses: CourseSnapshot[];
  total_units: number;
  hod_id?: string;
  hod_name?: string;
  status: CourseRegistrationStatus;
  rejection?: CourseRejectionInfo;
  submitted_at?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
  course_form_document_id?: string;
  course_form_document_status?: string;
}

export interface CourseRegistrationCreateRequest {
  course_ids: string[];
  session?: string;
  semester?: SemesterType;
}

export interface CourseRegistrationUpdateRequest {
  course_ids: string[];
}

export interface CourseRegistrationSubmitRequest {
  session?: string;
  semester?: SemesterType;
}
