"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Users,
  Clock,
  FileCheck,
  Shield,
  ArrowRight,
  FileText,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin";
import { StatCard } from "@/components/shared/StatCard";
import { StaffApprovalQueue } from "@/components/admin/StaffApprovalQueue";
import { ClearancePeriodCard } from "@/components/admin/ClearancePeriodCard";
import { SystemHealthStatus } from "@/components/admin/SystemHealthStatus";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

export default function AdminDashboardPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await adminApi.getAnalytics();
      return res.data.data;
    },
  });

  const { data: recentDocs } = useQuery({
    queryKey: ["admin-recent-documents"],
    queryFn: async () => {
      const res = await adminApi.getDocuments();
      return res.data.data.slice(0, 6);
    },
  });

  if (isLoading) return <PageSkeleton />;

  const totalStudents = analytics?.total_students ?? 0;
  const totalStaff = analytics?.total_staff ?? 0;
  const pendingApprovals = analytics?.pending_staff_approvals ?? 0;
  const docsPending = analytics?.documents_pending ?? 0;
  const docsCompleted = analytics?.documents_completed ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Institutional Overview</h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
            Ekiti State University Digital Clearance &amp; Signing System Operations
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/admin/students" className="btn btn-secondary btn-sm">
            <GraduationCap size={14} /> Student Directory
          </Link>
          <Link href="/admin/staff" className="btn btn-secondary btn-sm">
            <Users size={14} /> Staff Directory
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <StatCard
          label="Total Registered Students"
          value={totalStudents}
          icon={GraduationCap}
          href="/admin/students"
        />
        <StatCard
          label="Active Staff Members"
          value={totalStaff}
          icon={Users}
          href="/admin/staff"
        />
        <StatCard
          label="Pending Staff Approvals"
          value={pendingApprovals}
          icon={Clock}
          delta={pendingApprovals > 0 ? "Requires admin action" : "All reviewed"}
          deltaType={pendingApprovals > 0 ? "down" : "up"}
          href="/admin/staff"
        />
        <StatCard
          label="Documents in Review"
          value={docsPending}
          icon={FileText}
          href="/admin/documents"
        />
        <StatCard
          label="Completed Clearances"
          value={docsCompleted}
          icon={FileCheck}
          delta="Fully signed &amp; sealed"
          deltaType="up"
          href="/admin/documents"
        />
      </div>

      {/* Clearance Submission Window Settings */}
      <ClearancePeriodCard />

      {/* Staff Approval Queue Card */}
      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Staff Self-Registration Approval Queue</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", margin: "0.125rem 0 0" }}>
              Pending verification before access is granted
            </p>
          </div>
          <Link href="/admin/staff" className="btn btn-ghost btn-sm">
            Manage All Staff <ArrowRight size={13} />
          </Link>
        </div>
        <div className="card-body">
          <StaffApprovalQueue />
        </div>
      </div>

      {/* Recent Institutional Documents & System Health Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.25rem" }} className="admin-bottom-grid">
        {/* Recent Documents Table */}
        <div className="card">
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Recent Form Submissions</h3>
            <Link href="/admin/documents" className="btn btn-ghost btn-sm">
              All Documents <ArrowRight size={13} />
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocs && recentDocs.length > 0 ? (
                    recentDocs.map((doc) => (
                      <tr key={doc.id}>
                        <td data-label="Student" style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                          {doc.student_name}
                        </td>
                        <td data-label="Type" style={{ fontSize: "0.75rem" }}>
                          {doc.doc_type === "CLEARANCE_FORM" ? "Clearance" : "Course Form"}
                        </td>
                        <td data-label="Status">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td data-label="Submitted" style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                          {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", color: "var(--foreground-muted)", padding: "1.5rem" }}>
                        No document activity recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Health Status */}
        <SystemHealthStatus />
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .admin-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
