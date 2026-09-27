export type DocumentType = "CLEARANCE" | "COURSE_FORM";

export type DocumentStatus =
  | "PENDING_BURSAR"
  | "PENDING_AUDITOR"
  | "PENDING_HOD"
  | "COMPLETED"
  | "REJECTED";

export interface DocumentEvent {
  id: string;
  action: string;
  actor_name: string;
  actor_role: string;
  description: string;
  timestamp: string;
}

export interface DocumentResponse {
  id: string;
  student_id: string;
  student_name: string;
  student_matric_or_reg?: string; // matric number, or registration number if the student has none
  faculty: string;
  department: string;
  level: string;
  document_type: DocumentType;
  status: DocumentStatus;
  file_url?: string;
  current_reviewer?: string;
  rejection_reason?: string;
  rejected_by?: string;
  rejected_at?: string;
  bursar_signed_at?: string;
  auditor_signed_at?: string;
  hod_signed_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  history: DocumentEvent[];
}
