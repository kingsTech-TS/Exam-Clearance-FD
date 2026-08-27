"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/lib/auth/authStore";
import { staffApi } from "@/lib/api/staff";
import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();

  const { data: staffProfile } = useQuery({
    queryKey: ["staff-profile"],
    queryFn: async () => {
      const res = await staffApi.getMe();
      return res.data.data;
    },
    enabled: isAuthenticated && user?.role === "STAFF",
  });

  const isProfileComplete = Boolean(
    staffProfile?.profile_complete ||
    staffProfile?.profile_completed ||
    (staffProfile?.signature_uploaded && (staffProfile?.sub_role === "HOD" || staffProfile?.seal_uploaded))
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user && user.role !== "STAFF") {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (staffProfile) {
      updateUser({
        full_name: staffProfile.full_name,
        staff_id: staffProfile.staff_id,
        sub_role: staffProfile.sub_role,
        faculty: staffProfile.faculty,
        department: staffProfile.department,
        approval_status: staffProfile.approval_status,
        profile_complete: isProfileComplete,
      });
    }
  }, [staffProfile, isProfileComplete, updateUser]);

  const isProfileIncomplete = staffProfile && !isProfileComplete;

  return (
    <AppShell breadcrumb={`Staff Portal — ${user?.sub_role || "Reviewer"}`}>
      {isProfileIncomplete && (
        <div
          style={{
            background: "var(--status-pending-bg)",
            borderBottom: "1px solid var(--status-pending-border)",
            padding: "0.75rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            color: "var(--status-pending-text)",
            fontSize: "0.8125rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>Setup Required:</strong> Please complete your signing credentials (signature{user?.sub_role !== "HOD" ? " & seal" : ""}) to sign documents.
            </span>
          </div>
          <Link
            href="/staff/profile"
            className="btn btn-primary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", flexShrink: 0, textDecoration: "none" }}
          >
            Setup Credentials <ArrowRight size={13} />
          </Link>
        </div>
      )}
      <div style={{ padding: "1.5rem" }}>{children}</div>
    </AppShell>
  );
}
