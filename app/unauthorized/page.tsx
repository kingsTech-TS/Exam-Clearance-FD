"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/auth/authStore";

export default function UnauthorizedPage() {
  const { user } = useAuthStore();

  const getDashboardHref = () => {
    if (!user) return "/login";
    if (user.role === "STUDENT") return "/student/dashboard";
    if (user.role === "STAFF") return "/staff/dashboard";
    if (user.role === "ADMIN") return "/admin/dashboard";
    return "/login";
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--background)",
        padding: "2rem",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "440px",
          width: "100%",
          padding: "2.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "3.5rem",
            height: "3.5rem",
            background: "var(--status-error-bg)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
          }}
        >
          <ShieldAlert size={28} color="var(--destructive)" />
        </div>

        <h2 style={{ marginBottom: "0.5rem" }}>Access Denied</h2>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--foreground-muted)",
            marginBottom: "1.75rem",
            lineHeight: 1.6,
          }}
        >
          You do not have administrative permission to view this resource. Your account role is{" "}
          <strong>{user?.role || "GUEST"}</strong>.
        </p>

        <Link
          href={getDashboardHref()}
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
        >
          <ArrowLeft size={14} /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
