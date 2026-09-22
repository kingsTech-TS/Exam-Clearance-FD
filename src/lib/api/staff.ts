import client from "./client";
import type { DataResponse } from "@/types/api";
import type { StaffProfileResponse, StaffDashboardResponse } from "@/types/user";
import type { DocumentResponse } from "@/types/document";
import type {
  Course,
  CourseCreateRequest,
  CourseUpdateRequest,
  CourseBulkResponse,
  CourseRegistration,
} from "@/types/course";

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

  // ── HOD Course Management ───────────────────────────────────────────────────
  getCourses: (params?: { status?: string; level?: string; session?: string; semester?: string }) =>
    client.get<DataResponse<Course[]>>("/staff/courses", { params }),

  getCourse: (course_id: string) =>
    client.get<DataResponse<Course>>(`/staff/courses/${course_id}`),

  createCourse: (data: CourseCreateRequest) =>
    client.post<DataResponse<Course>>("/staff/courses", data),

  updateCourse: (course_id: string, data: CourseUpdateRequest) =>
    client.patch<DataResponse<Course>>(`/staff/courses/${course_id}`, data),

  deactivateCourse: (course_id: string) =>
    client.patch<DataResponse<Course>>(`/staff/courses/${course_id}/deactivate`),

  bulkUploadCourses: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post<DataResponse<CourseBulkResponse>>("/staff/courses/bulk-upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ── HOD Course Registrations ────────────────────────────────────────────────
  getCourseRegistrations: (params?: { status?: string; session?: string; semester?: string; level?: string }) =>
    client.get<DataResponse<CourseRegistration[]>>("/staff/course-registrations", { params }),

  getCourseRegistration: (registration_id: string) =>
    client.get<DataResponse<CourseRegistration>>(`/staff/course-registrations/${registration_id}`),

  approveCourseRegistration: (registration_id: string, signing_date?: string) =>
    client.post<DataResponse<CourseRegistration>>(`/staff/course-registrations/${registration_id}/approve`, {
      signing_date,
    }),

  rejectCourseRegistration: (registration_id: string, reason: string) =>
    client.post<DataResponse<CourseRegistration>>(`/staff/course-registrations/${registration_id}/reject`, {
      reason,
    }),
};
