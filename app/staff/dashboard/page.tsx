"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  ArrowRight,
  Shield,
  Search,
  AlertCircle,
  Building2,
  User,
  GraduationCap,
  Sparkles,
  FileCheck2,
  Calendar,
  BookOpen,
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

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "PENDING" | "CLEARANCE" | "COURSE">("ALL");

  const { data: staffProfile } = useQuery({
    queryKey: ["staff-profile"],
    queryFn: async () => {
      const res = await staffApi.getMe();
      return res.data.data;
    },
  });

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

  const { data: pendingHodRegistrations } = useQuery({
    queryKey: ["staff-hod-pending-registrations"],
    queryFn: async () => {
      const res = await staffApi.getCourseRegistrations({ status: "SUBMITTED" });
      return res.data.data;
    },
    enabled: subRole === "HOD",
  });

  const isProfileComplete = Boolean(
    staffProfile?.profile_complete ||
    staffProfile?.profile_completed ||
    (staffProfile?.signature_uploaded && (staffProfile?.sub_role === "HOD" || staffProfile?.seal_uploaded))
  );

  const pendingCount = dashboard?.pending_count ?? dashboard?.pending_documents_count ?? 0;
  const signedToday = dashboard?.signed_today ?? dashboard?.signed_documents_count ?? 0;
  const rejectedCount = dashboard?.rejected_count ?? dashboard?.rejected_documents_count ?? 0;
  const allDocs = documents || [];

  const filteredDocs = useMemo(() => {
    return allDocs.filter((doc) => {
      // Filter tab
      if (filterType === "PENDING" && !doc.status.startsWith("PENDING")) {
        return false;
      }
      if (filterType === "CLEARANCE" && doc.doc_type !== "CLEARANCE_FORM") {
        return false;
      }
      if (filterType === "COURSE" && doc.doc_type !== "COURSE_FORM") {
        return false;
      }

      // Search query
      if (search.trim()) {
        const term = search.toLowerCase().trim();
        const matchesName = doc.student_name?.toLowerCase().includes(term);
        const matchesMatric = doc.matric_number?.toLowerCase().includes(term) || doc.registration_number?.toLowerCase().includes(term);
        const matchesDept = doc.department?.toLowerCase().includes(term) || doc.faculty?.toLowerCase().includes(term);
        return matchesName || matchesMatric || matchesDept;
      }

      return true;
    });
  }, [allDocs, filterType, search]);

  const recentDocs = filteredDocs.slice(0, 10);

  if (dashLoading || docsLoading) return <PageSkeleton />;

  const getSubRoleMeta = () => {
    switch (subRole) {
      case "BURSAR":
        return {
          title: "Faculty Bursar Review Desk",
          badge: "Bursary Officer",
          badgeClass: "badge-info",
          description: `Review, verify payments, and stamp clearance forms for students in ${user?.faculty || staffProfile?.faculty || "your designated faculty"}.`,
          jurisdiction: user?.faculty || staffProfile?.faculty || "Assigned Faculty",
          docFocus: "Clearance Forms (Bursar Stage)",
        };
      case "AUDITOR":
        return {
          title: "University Auditor Clearance Desk",
          badge: "Internal Auditor",
          badgeClass: "badge-success",
          description: "Perform final audit verification, security checks, and official seal authentication for university clearance.",
          jurisdiction: "University-Wide",
          docFocus: "Clearance Forms (Final Audit)",
        };
      case "HOD":
        return {
          title: `Head of Department Review Desk — ${user?.department || staffProfile?.department || "Department"}`,
          badge: "Head of Department",
          badgeClass: "badge-pending",
          description: `Review and digitally endorse Course Registration Forms for students in ${user?.department || staffProfile?.department || "your department"}.`,
          jurisdiction: user?.department || staffProfile?.department || "Assigned Department",
          docFocus: "Course Registration Forms",
        };
      default:
        return {
          title: "Staff Clearance Review Desk",
          badge: "Reviewing Officer",
          badgeClass: "badge-info",
          description: "Review and process assigned university examination clearance forms.",
          jurisdiction: "Staff Desk",
          docFocus: "Assigned Documents",
        };
    }
  };

  const roleMeta = getSubRoleMeta();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Hero / Header Card */}
      <div
        className="card"
        style={{
          padding: "1.5rem",
          background: "linear-gradient(135deg, var(--surface) 0%, var(--primary-light) 100%)",
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.25rem" }}>
          <div style={{ maxWidth: "750px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              <span className={`badge ${roleMeta.badgeClass}`} style={{ fontSize: "0.8125rem", padding: "0.25rem 0.625rem" }}>
                <Shield size={13} /> {roleMeta.badge}
              </span>
              <span className="badge badge-info" style={{ fontSize: "0.8125rem" }}>
                <Building2 size={13} /> {roleMeta.jurisdiction}
              </span>
              {staffProfile?.staff_id && (
                <span className="badge badge-info" style={{ fontSize: "0.8125rem" }}>
                  ID: {staffProfile.staff_id}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.375rem 0", color: "var(--foreground)" }}>
              {roleMeta.title}
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--foreground-muted)", margin: 0, lineHeight: 1.5 }}>
              {roleMeta.description}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            {subRole === "HOD" && (
              <>
                <Link
                  href="/staff/course-registrations"
                  className="btn btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", textDecoration: "none" }}
                >
                  <GraduationCap size={15} /> Registrations ({pendingHodRegistrations?.length ?? 0})
                </Link>
                <Link
                  href="/staff/courses"
                  className="btn btn-outline"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", textDecoration: "none" }}
                >
                  <BookOpen size={15} /> Course Catalog
                </Link>
              </>
            )}
            <Link
              href="/staff/documents"
              className="btn btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", textDecoration: "none" }}
            >
              <FileText size={15} /> Documents ({allDocs.length})
            </Link>
            <Link
              href="/staff/profile"
              className="btn btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", textDecoration: "none" }}
            >
              <User size={15} /> Credentials
            </Link>
          </div>
        </div>
      </div>

      {/* Credential Incomplete Warning if needed */}
      {!isProfileComplete && (
        <div
          className="card"
          style={{
            padding: "1.25rem",
            background: "var(--status-pending-bg)",
            borderColor: "var(--status-pending-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <AlertCircle size={20} color="var(--status-pending-text)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--status-pending-text)" }}>
                Signing Credentials Required for Digital Endorsements
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--status-pending-text)", opacity: 0.9, marginTop: "2px" }}>
                Upload your transparent digital signature {subRole !== "HOD" ? "and official office seal" : ""} to enable one-click document stamping.
              </div>
            </div>
          </div>
          <Link
            href="/staff/profile"
            className="btn btn-primary btn-sm"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            Setup Credentials <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        {subRole === "HOD" && (
          <StatCard
            label="Course Registrations"
            value={pendingHodRegistrations?.length ?? 0}
            subtitle="Awaiting HOD Endorsement"
            icon={GraduationCap}
            variant={(pendingHodRegistrations?.length ?? 0) > 0 ? "warning" : "default"}
            href="/staff/course-registrations"
          />
        )}
        <StatCard
          label="Pending Review"
          value={pendingCount}
          subtitle="Awaiting your desk approval"
          icon={Clock}
          variant={pendingCount > 0 ? "warning" : "default"}
          href="/staff/documents"
        />
        <StatCard
          label="Approved / Signed"
          value={signedToday}
          subtitle="Successfully endorsed"
          icon={CheckCircle2}
          variant="success"
          href="/staff/documents"
        />
        <StatCard
          label="Returned / Rejected"
          value={rejectedCount}
          subtitle="Returned to student"
          icon={XCircle}
          variant={rejectedCount > 0 ? "danger" : "default"}
          href="/staff/documents"
        />
        <StatCard
          label="Total Assigned Queue"
          value={allDocs.length}
          subtitle="Active desk documents"
          icon={FileText}
          variant="default"
          href="/staff/documents"
        />
      </div>

      {/* Main Review Queue Card */}
      <div className="card">
        {/* Card Header */}
        <div
          className="card-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileCheck2 size={18} color="var(--primary)" /> Action Items &amp; Document Queue
            </h3>
            <span style={{ fontSize: "0.78125rem", color: "var(--foreground-muted)", marginTop: "2px", display: "block" }}>
              Showing {recentDocs.length} of {filteredDocs.length} {filteredDocs.length === 1 ? "document" : "documents"}
            </span>
          </div>

          <Link
            href="/staff/documents"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
          >
            View All ({allDocs.length}) <ArrowRight size={13} />
          </Link>
        </div>

        {/* Filter and Search Bar inside card */}
        <div
          style={{
            padding: "0.875rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--background)",
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Search box */}
          <div style={{ position: "relative", flex: 1, minWidth: "220px", maxWidth: "420px" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--foreground-muted)",
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Filter by student, matric, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.25rem", height: "34px", fontSize: "0.8125rem" }}
            />
          </div>

          {/* Quick filter pills */}
          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
            {[
              { key: "ALL", label: `All (${allDocs.length})` },
              { key: "PENDING", label: `Pending (${pendingCount})` },
              { key: "CLEARANCE", label: "Clearance Forms" },
              { key: "COURSE", label: "Course Forms" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`btn btn-sm ${filterType === tab.key ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setFilterType(tab.key as typeof filterType)}
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.625rem" }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {recentDocs.length === 0 ? (
          <EmptyState
            icon={allDocs.length === 0 ? CheckCircle2 : Search}
            title={allDocs.length === 0 ? "All Caught Up!" : "No matching documents found"}
            description={
              allDocs.length === 0
                ? "There are currently no documents assigned to your desk awaiting review."
                : "No documents in your queue match the selected filter or search term."
            }
            action={
              search ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSearch("");
                    setFilterType("ALL");
                  }}
                >
                  Clear Filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>Student Name</th>
                  <th>Matric / Reg No</th>
                  <th>Faculty &amp; Department</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td data-label="Document Type">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                          style={{
                            width: "1.875rem",
                            height: "1.875rem",
                            borderRadius: "6px",
                            background: doc.doc_type === "CLEARANCE_FORM" ? "var(--primary-light)" : "var(--status-processing-bg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: doc.doc_type === "CLEARANCE_FORM" ? "var(--primary)" : "var(--status-processing-text)",
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={15} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--foreground)" }}>
                            {doc.doc_type === "CLEARANCE_FORM" ? "Clearance Form" : "Course Form"}
                          </div>
                          <div style={{ fontSize: "0.71875rem", color: "var(--foreground-muted)" }}>
                            {(doc as unknown as { original_filename?: string }).original_filename || `${doc.doc_type?.toLowerCase() || "doc"}.pdf`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Student Name" style={{ fontWeight: 600, color: "var(--foreground)" }}>
                      {doc.student_name || "—"}
                    </td>
                    <td data-label="Matric / Reg No">
                      <code
                        style={{
                          background: "var(--background)",
                          border: "1px solid var(--border)",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {doc.matric_number || doc.registration_number || "—"}
                      </code>
                    </td>
                    <td data-label="Department & Faculty" style={{ fontSize: "0.8125rem" }}>
                      <div>{doc.department || "—"}</div>
                      <div style={{ fontSize: "0.71875rem", color: "var(--foreground-muted)" }}>
                        {doc.faculty} {doc.level ? `(${doc.level}L)` : ""}
                      </div>
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td data-label="Submitted" style={{ color: "var(--foreground-muted)", fontSize: "0.78125rem", whiteSpace: "nowrap" }}>
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td data-label="Action" style={{ textAlign: "right" }}>
                      <Link
                        href={`/staff/documents/${doc.id}`}
                        className="btn btn-primary btn-sm"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                      >
                        <Eye size={13} /> Review &amp; Sign
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Desk Guidelines & Security Info Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {/* Verification Overview */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <Shield size={16} color="var(--primary)" />
            <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>Signing Security &amp; Workflow</h4>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", margin: "0 0 0.75rem", lineHeight: 1.5 }}>
            Each document approved through your desk receives a cryptographically hashed endorsement. Your verified digital signature
            {subRole !== "HOD" ? " and official office seal" : ""} will be dynamically rendered on the student's PDF certificate.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> 256-bit Encrypted Hash
            </span>
            <span className="badge badge-info">
              <Sparkles size={12} /> Auto Transparent Stamp
            </span>
          </div>
        </div>

        {/* Quick Help & Portal Links */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <GraduationCap size={16} color="var(--primary)" />
            <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>Quick Desk Shortcuts</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link
              href="/staff/documents"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem 0.75rem",
                background: "var(--background)",
                borderRadius: "6px",
                textDecoration: "none",
                color: "var(--foreground)",
                fontSize: "0.8125rem",
                fontWeight: 500,
              }}
            >
              <span>Search &amp; Filter Full Registry</span>
              <ArrowRight size={13} color="var(--foreground-muted)" />
            </Link>
            <Link
              href="/staff/profile"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem 0.75rem",
                background: "var(--background)",
                borderRadius: "6px",
                textDecoration: "none",
                color: "var(--foreground)",
                fontSize: "0.8125rem",
                fontWeight: 500,
              }}
            >
              <span>Update Signature / Official Stamp</span>
              <ArrowRight size={13} color="var(--foreground-muted)" />
            </Link>
            <Link
              href="/staff/settings"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem 0.75rem",
                background: "var(--background)",
                borderRadius: "6px",
                textDecoration: "none",
                color: "var(--foreground)",
                fontSize: "0.8125rem",
                fontWeight: 500,
              }}
            >
              <span>Staff Profile &amp; Account Settings</span>
              <ArrowRight size={13} color="var(--foreground-muted)" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
