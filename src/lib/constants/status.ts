import type { DocumentStatus } from "@/types/document";

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  PENDING_BURSAR: "Pending Bursar",
  PENDING_AUDITOR: "Pending Auditor",
  PENDING_HOD: "Pending HOD",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

export const DOCUMENT_STATUS_BADGE: Record<DocumentStatus, string> = {
  PENDING_BURSAR: "badge-pending",
  PENDING_AUDITOR: "badge-pending",
  PENDING_HOD: "badge-pending",
  COMPLETED: "badge-success",
  REJECTED: "badge-error",
};

export const DOC_TYPE_LABELS = {
  CLEARANCE_FORM: "Clearance Form",
  COURSE_FORM: "Course Form",
} as const;

export const STAFF_SUB_ROLE_LABELS = {
  BURSAR: "Bursar",
  AUDITOR: "Auditor",
  HOD: "Head of Department",
} as const;

export const APPROVAL_STATUS_LABELS = {
  PENDING: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
} as const;

export const APPROVAL_STATUS_BADGE = {
  PENDING: "badge-pending",
  APPROVED: "badge-success",
  REJECTED: "badge-error",
  SUSPENDED: "badge-error",
} as const;
