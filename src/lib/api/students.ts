import client from "./client";
import type { DataResponse } from "@/types/api";
import type { StudentProfileResponse, StudentDashboardResponse } from "@/types/user";
import type { DocumentResponse } from "@/types/document";

export const studentsApi = {
  getMe: () =>
    client.get<DataResponse<StudentProfileResponse>>("/students/me"),

  updateMe: (data: Partial<{ full_name: string; email: string }>) =>
    client.patch<DataResponse<Record<string, unknown>>>("/students/me", data),

  uploadPassport: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post<DataResponse<Record<string, unknown>>>("/students/me/passport", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadSignature: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post<DataResponse<Record<string, unknown>>>("/students/me/signature", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getDashboard: () =>
    client.get<DataResponse<StudentDashboardResponse>>("/students/me/dashboard"),

  getDocuments: () =>
    client.get<DataResponse<DocumentResponse[]>>("/students/me/documents"),

  uploadDocument: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post<DataResponse<DocumentResponse>>("/students/me/documents", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
