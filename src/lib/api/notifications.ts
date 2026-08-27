import client from "./client";
import type { DataResponse } from "@/types/api";
import type { Notification } from "@/types/admin";

export const notificationsApi = {
  getNotifications: (params?: { unread_only?: boolean; limit?: number }) =>
    client.get<DataResponse<Notification[]>>("/notifications", { params }),

  markRead: (notification_ids?: string[], mark_all?: boolean) =>
    client.post<DataResponse<Record<string, unknown>>>("/notifications/read", {
      notification_ids,
      mark_all,
    }),
};
