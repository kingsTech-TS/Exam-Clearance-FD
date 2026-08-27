"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  User,
  Settings,
  Users,
  Shield,
  ClipboardList,
  BarChart2,
  Calendar,
  Activity,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/authStore";
import type { UserRole, StaffSubRole } from "@/types/user";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

function getNavItems(role: UserRole, subRole?: StaffSubRole): NavItem[] {
  if (role === "STUDENT") {
    return [
      { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
      { label: "My Documents", href: "/student/documents", icon: FileText },
      { label: "Profile", href: "/student/profile", icon: User },
      { label: "Settings", href: "/student/settings", icon: Settings },
    ];
  }
  if (role === "STAFF") {
    return [
      { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
      { label: "Documents", href: "/staff/documents", icon: FileText },
      { label: "Profile", href: "/staff/profile", icon: User },
      { label: "Settings", href: "/staff/settings", icon: Settings },
    ];
  }
  // Admin
  return [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Staff", href: "/admin/staff", icon: Users },
    { label: "Documents", href: "/admin/documents", icon: FileText },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardList },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
    { label: "Clearance Period", href: "/admin/clearance-period", icon: Calendar },
    { label: "System Health", href: "/admin/system-health", icon: Activity },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];
}

function getRoleLabel(role: UserRole, subRole?: StaffSubRole): string {
  if (role === "STUDENT") return "Student Portal";
  if (role === "STAFF") {
    const sub = subRole ? { BURSAR: "Bursar", AUDITOR: "Auditor", HOD: "HOD" }[subRole] : "Staff";
    return `${sub} Portal`;
  }
  return "Admin Portal";
}

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const navItems = getNavItems(user?.role ?? "STUDENT", user?.sub_role);
  const roleLabel = getRoleLabel(user?.role ?? "STUDENT", user?.sub_role);

  function handleLogout() {
    clearAuth();
    window.location.href = "/login";
  }

  return (
    <div
      className="sidebar"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "0",
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          padding: "1.25rem 1rem",
          borderBottom: "1px solid var(--sidebar-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div
            style={{
              width: "2rem",
              height: "2rem",
              background: "var(--primary)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Shield size={14} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "white", lineHeight: 1.2 }}>
              EKSU Clearance
            </div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: "1px" }}>{roleLabel}</div>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "0.375rem",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close menu"
          >
            <LogOut size={14} style={{ display: "none" }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0.75rem 0.75rem", overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`sidebar-nav-item${isActive ? " active" : ""}`}
              style={{ marginBottom: "2px" }}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div
        style={{
          padding: "0.875rem 1rem",
          borderTop: "1px solid var(--sidebar-border)",
        }}
      >
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "white", lineHeight: 1.3 }}>
            {user?.full_name ?? "—"}
          </div>
          <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
            {user?.matric_number ?? user?.staff_id ?? user?.email ?? ""}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-nav-item"
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer" }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );
}
