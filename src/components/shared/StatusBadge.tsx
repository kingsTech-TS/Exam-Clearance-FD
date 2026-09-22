"use client";
import type { DocumentStatus } from "@/types/document";
import type { ApprovalStatus } from "@/types/user";
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_BADGE,
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_BADGE,
  COURSE_REGISTRATION_STATUS_LABELS,
  COURSE_REGISTRATION_STATUS_BADGE,
} from "@/lib/constants/status";

interface Props {
  status: DocumentStatus | ApprovalStatus | string;
  type?: "document" | "approval" | "registration";
}

export function StatusBadge({ status, type = "document" }: Props) {
  if (type === "approval") {
    const label = APPROVAL_STATUS_LABELS[status as ApprovalStatus] ?? status;
    const cls = APPROVAL_STATUS_BADGE[status as ApprovalStatus] ?? "badge-info";
    return <span className={`badge ${cls}`}>{label}</span>;
  }

  if (type === "registration") {
    const label = COURSE_REGISTRATION_STATUS_LABELS[status] ?? status;
    const cls = COURSE_REGISTRATION_STATUS_BADGE[status] ?? "badge-info";
    return <span className={`badge ${cls}`}>{label}</span>;
  }

  const label = DOCUMENT_STATUS_LABELS[status as DocumentStatus] ?? status;
  const cls = DOCUMENT_STATUS_BADGE[status as DocumentStatus] ?? "badge-info";
  return <span className={`badge ${cls}`}>{label}</span>;
}
