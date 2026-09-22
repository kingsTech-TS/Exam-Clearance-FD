"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  ExternalLink,
  PenTool,
  Check,
  X,
  FileCheck2,
  Calendar,
  User,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth/authStore";
import { staffApi } from "@/lib/api/staff";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { LEVEL_LIST } from "@/lib/constants/faculties";
import type { CourseRegistration, CourseRegistrationStatus, SemesterType } from "@/types/course";

type FilterTab = "ALL" | "PENDING_HOD" | "COMPLETED" | "REJECTED";

export default function StaffCourseRegistrationsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Filters
  const [activeTab, setActiveTab] = useState<FilterTab>("PENDING_HOD");
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSession, setSelectedSession] = useState("");

  // Review Modal states
  const [reviewingReg, setReviewingReg] = useState<CourseRegistration | null>(null);
  const [signingDate, setSigningDate] = useState(new Date().toISOString().split("T")[0]);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch course registrations
  const { data: registrations, isLoading } = useQuery({
    queryKey: ["hod-course-registrations", activeTab, selectedSession, selectedSemester, selectedLevel],
    queryFn: async () => {
      const statusParam = activeTab === "ALL" ? undefined : activeTab;
      const res = await staffApi.getCourseRegistrations({
        status: statusParam,
        session: selectedSession || undefined,
        semester: selectedSemester || undefined,
        level: selectedLevel || undefined,
      });
      return res.data.data;
    },
    enabled: user?.sub_role === "HOD",
  });

  // Client search filter
  const filteredRegs = useMemo(() => {
    if (!registrations) return [];
    if (!search.trim()) return registrations;
    const q = search.toLowerCase().trim();
    return registrations.filter(
      (r) =>
        r.student_name?.toLowerCase().includes(q) ||
        r.student_matric_or_reg?.toLowerCase().includes(q)
    );
  }, [registrations, search]);

  // Mutations
  const approveMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      staffApi.approveCourseRegistration(id, date),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["hod-course-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });
      setReviewingReg(null);
      setNotification({
        type: "success",
        text: "Course registration approved and digitally signed. Official Course Form PDF generated.",
      });
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to approve registration.";
      setNotification({ type: "error", text: msg });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      staffApi.rejectCourseRegistration(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hod-course-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });
      setReviewingReg(null);
      setIsRejectMode(false);
      setRejectReason("");
      setNotification({
        type: "success",
        text: "Course registration rejected. The student has been notified to revise courses.",
      });
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to reject registration.";
      setNotification({ type: "error", text: msg });
    },
  });

  const handleOpenReview = (reg: CourseRegistration) => {
    setReviewingReg(reg);
    setIsRejectMode(false);
    setRejectReason("");
    setSigningDate(new Date().toISOString().split("T")[0]);
  };

  if (user && user.sub_role !== "HOD") {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Access Restricted to HOD"
        description="Course registration review and endorsement is restricted to Department Heads. Please use the Clearance Review desk for Bursary or Auditor workflows."
      />
    );
  }

  const pendingCount = (registrations || []).filter((r) => r.status === "PENDING_HOD" || r.status === "SUBMITTED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>
              Course Registration Endorsement
            </h1>
            <span className="badge badge-info" style={{ fontSize: "0.6875rem" }}>
              HOD Signing Desk
            </span>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
            Review, audit, and digitally endorse submitted student course selections for {user?.department || "your department"}.
          </p>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`card ${notification.type === "success" ? "badge-success" : "badge-error"}`}
          style={{
            padding: "0.875rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.875rem",
            borderRadius: "8px",
          }}
        >
          {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Tabs and Filters */}
      <div
        className="card"
        style={{
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "0.75rem",
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(
              [
                { id: "PENDING_HOD", label: "Awaiting Endorsement" },
                { id: "ALL", label: "All Submissions" },
                { id: "COMPLETED", label: "Approved" },
                { id: "REJECTED", label: "Rejected" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`btn btn-sm ${activeTab === tab.id ? "btn-primary" : "btn-ghost"}`}
                style={{ fontSize: "0.8125rem" }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", minWidth: "240px" }}>
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
              placeholder="Search student or matric..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-sm"
              style={{ paddingLeft: "2.25rem", width: "100%" }}
            />
          </div>
        </div>

        {/* Sub-filters (Level, Semester, Session) */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", fontWeight: 600 }}>Filter by:</span>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="input input-sm"
            style={{ width: "120px" }}
          >
            <option value="">All Levels</option>
            {LEVEL_LIST.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl} Level</option>
            ))}
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="input input-sm"
            style={{ width: "130px" }}
          >
            <option value="">All Semesters</option>
            <option value="FIRST">1st Semester</option>
            <option value="SECOND">2nd Semester</option>
          </select>

          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="input input-sm"
            style={{ width: "130px" }}
          >
            <option value="">All Sessions</option>
            <option value="2025/2026">2025/2026</option>
            <option value="2026/2027">2026/2027</option>
            <option value="2024/2025">2024/2025</option>
          </select>
        </div>
      </div>

      {/* Registrations List / Table */}
      {isLoading ? (
        <PageSkeleton />
      ) : filteredRegs.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No Course Registrations"
          description={
            activeTab === "PENDING_HOD"
              ? "All student course registrations have been reviewed. Good job!"
              : "No course registration records found matching the criteria."
          }
        />
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-sunken)" }}>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Student</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Matric / Reg No</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Level</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Session &amp; Semester</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Courses &amp; Units</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegs.map((reg) => (
                  <tr
                    key={reg.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ fontWeight: 600, color: "var(--foreground)" }}>
                        {reg.student_name || "Student"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                        {reg.submitted_at
                          ? `Submitted ${new Date(reg.submitted_at).toLocaleDateString()}`
                          : "Draft"}
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", fontWeight: 600, color: "var(--foreground-muted)" }}>
                      {reg.student_matric_or_reg || "—"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span className="badge badge-info">{reg.level}L</span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", fontSize: "0.8125rem" }}>
                      <div>{reg.session}</div>
                      <div style={{ color: "var(--foreground-muted)" }}>
                        {reg.semester === "FIRST" ? "1st Semester" : "2nd Semester"}
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ fontWeight: 700 }}>{reg.courses?.length || 0}</span> courses &bull;{" "}
                      <span style={{ fontWeight: 700, color: "var(--primary)" }}>{reg.total_units}</span> units
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <StatusBadge status={reg.status} type="registration" />
                    </td>
                    <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.375rem", alignItems: "center", justifyContent: "flex-end" }}>
                        <Link
                          href={`/staff/course-registrations/${reg.id}`}
                          className="btn btn-ghost btn-sm"
                          title="Open Full Registration Page"
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                        >
                          <ExternalLink size={13} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenReview(reg)}
                          className={`btn btn-sm ${reg.status === "PENDING_HOD" || reg.status === "SUBMITTED" ? "btn-primary" : "btn-outline"}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                        >
                          {reg.status === "PENDING_HOD" || reg.status === "SUBMITTED" ? (
                            <>
                              <PenTool size={13} /> Review &amp; Sign
                            </>
                          ) : (
                            <>
                              <Eye size={13} /> View Breakdown
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review & Endorsement Modal */}
      {reviewingReg && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "640px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Course Registration Endorsement
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                  {reviewingReg.student_name} ({reviewingReg.student_matric_or_reg})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReviewingReg(null)}
                className="btn btn-ghost btn-xs"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Student Metadata Card */}
              <div
                style={{
                  background: "var(--surface-sunken)",
                  padding: "1rem",
                  borderRadius: "8px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "0.75rem",
                  fontSize: "0.8125rem",
                }}
              >
                <div>
                  <span style={{ color: "var(--foreground-muted)", display: "block", fontSize: "0.6875rem" }}>Department</span>
                  <span style={{ fontWeight: 600 }}>{reviewingReg.department}</span>
                </div>
                <div>
                  <span style={{ color: "var(--foreground-muted)", display: "block", fontSize: "0.6875rem" }}>Level / Session</span>
                  <span style={{ fontWeight: 600 }}>{reviewingReg.level}L &bull; {reviewingReg.session}</span>
                </div>
                <div>
                  <span style={{ color: "var(--foreground-muted)", display: "block", fontSize: "0.6875rem" }}>Semester</span>
                  <span style={{ fontWeight: 600 }}>{reviewingReg.semester === "FIRST" ? "1st Semester" : "2nd Semester"}</span>
                </div>
              </div>

              {/* Course Breakdown Table */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Enrolled Courses</span>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                    Total Units: <span style={{ color: "var(--primary)", fontSize: "1rem", fontWeight: 800 }}>{reviewingReg.total_units}</span>
                  </span>
                </div>

                <div
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    overflow: "hidden",
                    maxHeight: "220px",
                    overflowY: "auto",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-sunken)", borderBottom: "1px solid var(--border)" }}>
                        <th style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600 }}>Code</th>
                        <th style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600 }}>Title</th>
                        <th style={{ padding: "0.5rem 0.75rem", textAlign: "right", fontWeight: 600 }}>Units</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewingReg.courses.map((course, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "0.5rem 0.75rem", fontWeight: 700 }}>{course.course_code}</td>
                          <td style={{ padding: "0.5rem 0.75rem", color: "var(--foreground-muted)" }}>{course.course_title}</td>
                          <td style={{ padding: "0.5rem 0.75rem", textAlign: "right", fontWeight: 600 }}>{course.units}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* If already approved, show link to document */}
              {(reviewingReg.status === "APPROVED" || reviewingReg.status === "COMPLETED") && (
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "8px",
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid var(--success)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.8125rem",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--success)" }}>Approved &amp; Digitally Signed</span>
                    <p style={{ margin: "0.25rem 0 0", color: "var(--foreground-muted)" }}>
                      Endorsed by {reviewingReg.hod_name || "HOD"}. Course form document generated.
                    </p>
                  </div>
                  {reviewingReg.course_form_document_id && (
                    <Link
                      href={`/staff/documents/${reviewingReg.course_form_document_id}`}
                      className="btn btn-outline btn-sm"
                      style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                    >
                      <Eye size={13} /> View Form PDF
                    </Link>
                  )}
                </div>
              )}

              {/* If in Reject Mode */}
              {isRejectMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--destructive)" }}>
                    Mandatory Reason for Rejection *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Exceeded credit limit or missing prerequisite courses..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="input"
                    style={{ width: "100%", padding: "0.5rem" }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => setIsRejectMode(false)}
                      className="btn btn-ghost btn-sm"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!rejectReason.trim() || rejectMutation.isPending}
                      onClick={() =>
                        rejectMutation.mutate({
                          id: reviewingReg.id,
                          reason: rejectReason.trim(),
                        })
                      }
                      className="btn btn-danger btn-sm"
                    >
                      {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Action controls for pending state */
                (reviewingReg.status === "PENDING_HOD" || reviewingReg.status === "SUBMITTED") && (
                  <div
                    style={{
                      borderTop: "1px solid var(--border)",
                      paddingTop: "1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Calendar size={15} color="var(--foreground-muted)" />
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground-muted)" }}>
                        Signing Date:
                      </span>
                      <input
                        type="date"
                        value={signingDate}
                        onChange={(e) => setSigningDate(e.target.value)}
                        className="input input-sm"
                        style={{ width: "140px" }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "0.625rem" }}>
                      <button
                        type="button"
                        onClick={() => setIsRejectMode(true)}
                        className="btn btn-outline btn-sm"
                        style={{ color: "var(--destructive)" }}
                      >
                        Reject...
                      </button>

                      <button
                        type="button"
                        disabled={approveMutation.isPending}
                        onClick={() =>
                          approveMutation.mutate({
                            id: reviewingReg.id,
                            date: signingDate,
                          })
                        }
                        className="btn btn-primary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                      >
                        <PenTool size={14} />
                        {approveMutation.isPending ? "Signing & Generating PDF..." : "Approve & Apply Digital Signature"}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
