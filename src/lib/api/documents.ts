import client from "./client";
import type { DataResponse } from "@/types/api";
import type { DocumentResponse } from "@/types/document";

export const documentsApi = {
  getDocument: (id: string) =>
    client.get<DataResponse<DocumentResponse>>(`/documents/${id}`),

  getViewUrl: (id: string) =>
    client.get<DataResponse<{ view_url: string; expires_in_seconds?: number }>>(`/documents/${id}/view`),

  getDownloadUrl: (id: string) =>
    client.get<DataResponse<{ download_url: string; expires_in_seconds?: number; filename?: string }>>(`/documents/${id}/download`),
};
