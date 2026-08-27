"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/lib/auth/authStore";
import { studentsApi } from "@/lib/api/students";
import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();

  const { data: profileData } = useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => {
      const res = await studentsApi.getMe();
      return res.data.data;
    },
    enabled: isAuthenticated && user?.role === "STUDENT",
  });

  const isProfileComplete = Boolean(
    profileData?.profile_complete ||
    profileData?.profile_completed ||
    (profileData?.passport_uploaded && profileData?.signature_uploaded)
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user && user.role !== "STUDENT") {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (profileData) {
      updateUser({
        full_name: profileData.full_name,
        matric_number: profileData.matric_number,
        registration_number: profileData.registration_number,
        faculty: profileData.faculty,
        department: profileData.department,
        level: profileData.level,
        profile_complete: isProfileComplete,
      });
    }
  }, [profileData, isProfileComplete, updateUser]);

  const isProfileIncomplete = profileData && !isProfileComplete;

  return (
    <AppShell breadcrumb="Student Portal">
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
              <strong>Action Required:</strong> Your profile is incomplete. Please upload your passport photograph and signature before submitting documents.
            </span>
          </div>
          <Link
            href="/student/profile"
            className="btn btn-primary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", flexShrink: 0, textDecoration: "none" }}
          >
            Complete Profile <ArrowRight size={13} />
          </Link>
        </div>
      )}
      <div style={{ padding: "1.5rem" }}>{children}</div>
    </AppShell>
  );
}
