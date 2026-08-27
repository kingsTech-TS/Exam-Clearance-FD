import client from "./client";
import type { DataResponse } from "@/types/api";
import type { StaffProfileResponse, StaffDashboardResponse } from "@/types/user";
import type { DocumentResponse } from "@/types/document";

export const staffApi = {
  getMe: () =>
    client.get<DataResponse<StaffProfileResponse>>("/staff/me"),

  updateMe: (data: Partial<{ full_name: string }>) =>
    client.patch<DataResponse<Record<string, unknown>>>("/staff/me", data),

  uploadPassport: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post<DataResponse<Record<string, unknown>>>("/staff/me/passport", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadSignature: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post<DataResponse<Record<string, unknown>>>("/staff/me/signature", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadSeal: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post<DataResponse<Record<string, unknown>>>("/staff/me/seal", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getDashboard: () =>
    client.get<DataResponse<StaffDashboardResponse>>("/staff/me/dashboard"),

  getDocuments: (status?: string) =>
    client.get<DataResponse<DocumentResponse[]>>("/staff/documents", { params: { status } }),

  getDocument: (id: string) =>
    client.get<DataResponse<DocumentResponse>>(`/staff/documents/${id}`),

  getDocumentViewUrl: (id: string) =>
    client.get<DataResponse<{ view_url: string; expires_in_seconds?: number }>>(`/staff/documents/${id}/view`),

  signDocument: (id: string, signing_date: string) =>
    client.post<DataResponse<Record<string, unknown>>>(`/staff/documents/${id}/sign`, { signing_date }),

  rejectDocument: (id: string, reason: string) =>
    client.post<DataResponse<Record<string, unknown>>>(`/staff/documents/${id}/reject`, { reason }),
};
