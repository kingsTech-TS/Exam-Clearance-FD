import client from "./client";
import type { DataResponse } from "@/types/api";
import type { StudentProfileResponse, StudentDashboardResponse } from "@/types/user";
import type { DocumentResponse } from "@/types/document";
import type {
  Course,
  CourseRegistration,
  CourseRegistrationCreateRequest,
  CourseRegistrationUpdateRequest,
  CourseRegistrationSubmitRequest,
} from "@/types/course";

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

  // Course Registration
  getEligibleCourses: (params?: { session?: string; semester?: string }) =>
    client.get<DataResponse<Course[]>>("/students/me/courses", { params }),

  getCourseRegistration: (params?: { session?: string; semester?: string }) =>
    client.get<DataResponse<CourseRegistration | null>>("/students/me/course-registration", { params }),

  createCourseRegistration: (data: CourseRegistrationCreateRequest) =>
    client.post<DataResponse<CourseRegistration>>("/students/me/course-registration", data),

  updateCourseRegistration: (data: CourseRegistrationUpdateRequest) =>
    client.patch<DataResponse<CourseRegistration>>("/students/me/course-registration", data),

  submitCourseRegistration: (data?: CourseRegistrationSubmitRequest) =>
    client.post<DataResponse<CourseRegistration>>("/students/me/course-registration/submit", data ?? {}),

  downloadCourseForm: (params?: { session?: string; semester?: string }) =>
    client.get<DataResponse<{ download_url: string; expires_in_seconds?: number }>>(
      "/students/me/course-registration/download",
      { params }
    ),
};
