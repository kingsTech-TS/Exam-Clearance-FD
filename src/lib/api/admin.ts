import client from "./client";
import type { DataResponse, PaginatedResponse } from "@/types/api";
import type { AdminStudentRow, AdminStaffRow, ClearancePeriod, ClearancePeriodCreateOrUpdateRequest, AuditLog, AnalyticsData, HealthData } from "@/types/admin";
import type { DocumentResponse } from "@/types/document";

export const adminApi = {
  // Students
  getStudents: (params?: { search?: string; faculty?: string; department?: string; level?: string; page?: number; size?: number }) =>
    client.get<PaginatedResponse<AdminStudentRow>>("/admin/students", { params }),

  getStudent: (id: string) =>
    client.get<DataResponse<AdminStudentRow>>(`/admin/students/${id}`),

  suspendStudent: (id: string, suspend: boolean) =>
    client.patch<DataResponse<Record<string, unknown>>>(`/admin/students/${id}/suspend`, null, { params: { suspend } }),

  getStudentDocuments: (id: string) =>
    client.get<DataResponse<DocumentResponse[]>>(`/admin/students/${id}/documents`),

  // Staff
  getStaff: (params?: { search?: string; sub_role?: string; faculty?: string; department?: string; approval_status?: string; page?: number; size?: number }) =>
    client.get<PaginatedResponse<AdminStaffRow>>("/admin/staff", { params }),

  getStaffMember: (id: string) =>
    client.get<DataResponse<AdminStaffRow>>(`/admin/staff/${id}`),

  approveStaff: (id: string) =>
    client.post<DataResponse<Record<string, unknown>>>(`/admin/staff/${id}/approve`),

  rejectStaff: (id: string) =>
    client.post<DataResponse<Record<string, unknown>>>(`/admin/staff/${id}/reject`),

  suspendStaff: (id: string) =>
    client.post<DataResponse<Record<string, unknown>>>(`/admin/staff/${id}/suspend`),

  unsuspendStaff: (id: string) =>
    client.post<DataResponse<Record<string, unknown>>>(`/admin/staff/${id}/unsuspend`),

  deleteStaff: (id: string) =>
    client.delete<DataResponse<Record<string, unknown>>>(`/admin/staff/${id}`),

  updateStaff: (id: string, data: Record<string, unknown>) =>
    client.patch<DataResponse<Record<string, unknown>>>(`/admin/staff/${id}`, data),

  promoteStaff: (id: string) =>
    client.post<DataResponse<Record<string, unknown>>>(`/admin/staff/${id}/promote`),

  // Documents
  getDocuments: (params?: { doc_type?: string; status?: string; faculty?: string; department?: string }) =>
    client.get<DataResponse<DocumentResponse[]>>("/admin/documents", { params }),

  // Clearance Period
  getClearancePeriod: () =>
    client.get<DataResponse<ClearancePeriod>>("/admin/clearance-period"),

  updateClearancePeriod: (data: ClearancePeriodCreateOrUpdateRequest) =>
    client.patch<DataResponse<Record<string, unknown>>>("/admin/clearance-period", data),

  // Audit Logs
  getAuditLogs: (params?: { action?: string; actor_id?: string; page?: number; size?: number }) =>
    client.get<PaginatedResponse<AuditLog>>("/admin/audit-logs", { params }),

  // Analytics
  getAnalytics: () =>
    client.get<DataResponse<AnalyticsData>>("/admin/analytics"),

  // Health
  getHealth: () =>
    client.get<DataResponse<HealthData>>("/admin/health"),
};
