"use client";
import { MobileSidebar } from "./MobileSidebar";
import { NotificationCenter } from "@/components/shared/NotificationCenter";
import { useAuthStore } from "@/lib/auth/authStore";

interface HeaderProps {
  breadcrumb?: string;
}

export function Header({ breadcrumb }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header
      style={{
        height: "56px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 1.25rem",
        gap: "0.75rem",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Mobile & Tablet menu toggle */}
      <div className="show-tablet-mobile">
        <MobileSidebar />
      </div>

      {/* Breadcrumb */}
      {breadcrumb && (
        <span
          style={{
            fontSize: "0.875rem",
            color: "var(--foreground-muted)",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {breadcrumb}
        </span>
      )}
      {!breadcrumb && <div style={{ flex: 1 }} />}

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <NotificationCenter />
        <div
          style={{
            width: "1.75rem",
            height: "1.75rem",
            borderRadius: "50%",
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.6875rem",
            fontWeight: 700,
            color: "white",
            flexShrink: 0,
          }}
          title={user?.full_name || "User"}
        >
          {user?.full_name?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}

