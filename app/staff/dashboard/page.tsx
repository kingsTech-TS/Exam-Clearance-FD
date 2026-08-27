"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  ArrowRight,
  Shield,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth/authStore";
import { staffApi } from "@/lib/api/staff";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import type { StaffSubRole } from "@/types/user";

export default function StaffDashboardPage() {
  const { user } = useAuthStore();
  const subRole: StaffSubRole = user?.sub_role || "BURSAR";

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["staff-dashboard"],
    queryFn: async () => {
      const res = await staffApi.getDashboard();
      return res.data.data;
    },
  });

  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ["staff-assigned-documents"],
    queryFn: async () => {
      const res = await staffApi.getDocuments();
      return res.data.data;
    },
  });

  if (dashLoading || docsLoading) return <PageSkeleton />;

  const pendingCount = dashboard?.pending_count ?? dashboard?.pending_documents_count ?? 0;
  const signedToday = dashboard?.signed_today ?? dashboard?.signed_documents_count ?? 0;
  const rejectedCount = dashboard?.rejected_count ?? dashboard?.rejected_documents_count ?? 0;
  const recentDocs = documents?.slice(0, 8) || [];

  const getSubRoleTitle = () => {
    switch (subRole) {
      case "BURSAR":
        return "Faculty Bursar Review Queue";
      case "AUDITOR":
        return "University Auditor Final Clearance Queue";
      case "HOD":
        return `Departmental Course Form Queue — ${user?.department || "Department"}`;
      default:
        return "Staff Review Queue";
    }
  };

  const getSubRoleDescription = () => {
    switch (subRole) {
      case "BURSAR":
        return `Review and stamp Clearance Forms for ${user?.faculty || "your faculty"}. Approved forms advance to the Auditor.`;
      case "AUDITOR":
        return "Review and stamp Bursar-approved Clearance Forms to complete university clearance.";
      case "HOD":
        return `Review and sign Course Registration Forms for students in ${user?.department || "your department"}.`;
      default:
        return "Review and process assigned university forms.";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>{getSubRoleTitle()}</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          {getSubRoleDescription()}
        </p>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <StatCard
          label="Pending Review"
          value={pendingCount}
          subtitle="Awaiting your action"
          icon={Clock}
          variant={pendingCount > 0 ? "warning" : "default"}
          href="/staff/documents"
        />
        <StatCard
          label="Approved / Signed"
          value={signedToday}
          subtitle="Signed documents"
          icon={CheckCircle2}
          variant="success"
          href="/staff/documents"
        />
        <StatCard
          label="Rejected"
          value={rejectedCount}
          subtitle="Returned to student"
          icon={XCircle}
          variant={rejectedCount > 0 ? "danger" : "default"}
          href="/staff/documents"
        />
        <StatCard
          label="Assigned Queue"
          value={documents?.length || 0}
          subtitle="Total visible forms"
          icon={FileText}
          href="/staff/documents"
        />
      </div>

      {/* Recent Assigned Documents Table */}
      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Pending Action Items</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
              Documents routed to your desk for approval
            </span>
          </div>
          <Link href="/staff/documents" className="btn btn-secondary btn-sm" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            View All ({documents?.length || 0}) <ArrowRight size={13} />
          </Link>
        </div>

        {recentDocs.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All Caught Up!"
            description="There are no pending documents awaiting your review at this time."
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>Student Name</th>
                  <th>Matric / Reg No</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {doc.doc_type === "CLEARANCE_FORM"
                          ? "Student Clearance Form"
                          : "Course Registration Form"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                        {(doc as unknown as { original_filename?: string }).original_filename || `${doc.doc_type?.toLowerCase() ?? "document"}.pdf`}
                      </div>
                    </td>
                    <td>{doc.student_name || "—"}</td>
                    <td>
                      <code>{doc.matric_number || "—"}</code>
                    </td>
                    <td>{doc.department || doc.faculty || "—"}</td>
                    <td>
                      <StatusBadge status={doc.status} />
                    </td>
                    <td style={{ color: "var(--foreground-muted)", fontSize: "0.8125rem" }}>
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/staff/documents/${doc.id}`}
                        className="btn btn-primary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "none" }}
                      >
                        <Eye size={13} /> Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
