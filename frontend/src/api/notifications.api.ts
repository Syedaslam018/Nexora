import { apiClient, type ApiSuccessResponse } from "./client";
import type { PaginationMeta } from "@/types/product";
import type { Notification } from "@/types/notification";

export const notificationsApi = {
  async list(params: { unreadOnly?: boolean; page?: number; pageSize?: number }) {
    const { data } = await apiClient.get<
      ApiSuccessResponse<{ items: Notification[]; meta: PaginationMeta }>
    >("/notifications", { params });
    return data.data;
  },

  async unreadCount() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ count: number }>>(
      "/notifications/unread-count",
    );
    return data.data.count;
  },

  async markRead(id: string) {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllRead() {
    await apiClient.patch("/notifications/read-all");
  },
};
