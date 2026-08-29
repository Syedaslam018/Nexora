import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsApi } from "@/api/notifications.api";
import { getSocket } from "@/lib/socket";
import { useIsAuthenticated } from "@/hooks/useAuth";
import type { Notification } from "@/types/notification";

const KEY = ["notifications"];
const UNREAD_KEY = ["notifications", "unread-count"];

export function useNotificationList(params: { unreadOnly?: boolean; page?: number }) {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: [...KEY, "list", params],
    queryFn: () => notificationsApi.list(params),
    enabled: isAuthenticated,
  });
}

export function useUnreadCount() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: UNREAD_KEY,
    queryFn: () => notificationsApi.unreadCount(),
    enabled: isAuthenticated,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
}

/**
 * Listens for the live "notification:new" push (see backend
 * notification.service.ts) and both toasts it and invalidates the
 * notification queries so the bell badge/list update immediately. Mount
 * once, near the app root (RootLayout, alongside useSocketConnection).
 */
export function useNotificationSocketListener() {
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();

    function handleNew(notification: Notification) {
      toast.info(notification.title, { description: notification.message });
      void queryClient.invalidateQueries({ queryKey: KEY });
      void queryClient.invalidateQueries({ queryKey: UNREAD_KEY });
    }

    socket.on("notification:new", handleNew);
    return () => {
      socket.off("notification:new", handleNew);
    };
  }, [isAuthenticated, queryClient]);
}
