"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/lib/auth/authStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user && user.role !== "ADMIN") {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, user, router]);

  return (
    <AppShell breadcrumb="System Administration Portal">
      <div style={{ padding: "1.5rem" }}>{children}</div>
    </AppShell>
  );
}
