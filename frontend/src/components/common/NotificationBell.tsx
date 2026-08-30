import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  useNotificationList,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/features/notifications/useNotifications";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: unreadCount } = useUnreadCount();
  const { data } = useNotificationList({ page: 1 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleClick(notification: Notification) {
    if (!notification.isRead) markRead.mutate(notification.id);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {Boolean(unreadCount) && unreadCount! > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-warning px-1 font-mono-data text-[10px] font-bold text-warning-foreground ring-2 ring-background">
            {unreadCount! > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lift">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <span className="font-display text-sm font-semibold">
              Notifications
            </span>
            {Boolean(unreadCount) && unreadCount! > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!data || data.items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No notifications yet
              </p>
            ) : (
              data.items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "block w-full border-b border-border/70 px-4 py-3 text-left text-sm last:border-0 hover:bg-secondary",
                    !n.isRead && "bg-primary/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "font-medium",
                        !n.isRead && "text-foreground",
                      )}
                    >
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="mt-0.5 text-muted-foreground">{n.message}</p>
                  <p className="mt-1 font-mono-data text-[11px] text-muted-foreground">
                    {timeAgo(n.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
