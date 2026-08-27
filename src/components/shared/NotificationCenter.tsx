"use client";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, X, Check } from "lucide-react";
import { notificationsApi } from "@/lib/api/notifications";
import type { Notification } from "@/types/admin";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getNotifications({ limit: 20 }),
    refetchInterval: 30000,
  });

  const notifications: Notification[] = data?.data?.data ?? [];
  const unread = notifications.filter((n) => !n.is_read).length;

  const markRead = useMutation({
    mutationFn: (ids?: string[]) =>
      notificationsApi.markRead(ids, !ids ? true : undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const handleMarkAll = useCallback(() => {
    markRead.mutate(undefined);
  }, [markRead]);

  return (
    <div style={{ position: "relative" }}>
      <button
        id="notification-bell"
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.5rem",
          borderRadius: "6px",
          color: "var(--foreground-muted)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              background: "var(--destructive)",
              color: "white",
              borderRadius: "50%",
              width: "1rem",
              height: "1rem",
              fontSize: "0.625rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 0.5rem)",
              width: "360px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              boxShadow: "var(--shadow-lg)",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "0.875rem 1rem",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Notifications</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {unread > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={handleMarkAll}>
                    <Check size={13} />
                    Mark all read
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                  <X size={14} />
                </button>
              </div>
            </div>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--foreground-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead.mutate([n.id])}
                    style={{
                      padding: "0.875rem 1rem",
                      borderBottom: "1px solid var(--border)",
                      cursor: "pointer",
                      background: n.is_read ? "transparent" : "var(--primary-light)",
                      transition: "background 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>{n.title}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", margin: 0 }}>{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
