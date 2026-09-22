"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  BookOpen,
  User,
  Building2,
  GraduationCap,
  Calendar,
  Clock,
  AlertCircle,
  Check,
  Loader2,
} from "lucide-react";
import { staffApi } from "@/lib/api/staff";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import type { CourseSnapshot } from "@/types/course";

export default function StaffCourseRegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const registration_id = params?.registration_id as string;

  const [rejectReason, setRejectReason] = useState("");
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [signingDate, setSigningDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showNotif = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  const {
    data: reg,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["hod-registration-detail", registration_id],
    queryFn: async () => {
      const res = await staffApi.getCourseRegistration(registration_id);
      return res.data.data;
    },
    enabled: !!registration_id,
  });

  const approveMutation = useMutation({
    mutationFn: () =>
      staffApi.approveCourseRegistration(registration_id, signingDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hod-course-registrations"] });
      queryClient.invalidateQueries({
        queryKey: ["hod-registration-detail", registration_id],
      });
      showNotif("success", "Registration approved. Student has been notified.");
      refetch();
    },
    onError: (err: any) => {
      showNotif(
        "error",
        err?.response?.data?.message || "Failed to approve registration."
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      staffApi.rejectCourseRegistration(registration_id, rejectReason.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hod-course-registrations"] });
      queryClient.invalidateQueries({
        queryKey: ["hod-registration-detail", registration_id],
      });
      setIsRejectMode(false);
      setRejectReason("");
      showNotif("success", "Registration rejected. Student has been notified.");
      refetch();
    },
    onError: (err: any) => {
      showNotif(
        "error",
        err?.response?.data?.message || "Failed to reject registration."
      );
    },
  });

  if (isLoading) return <PageSkeleton />;

  if (!reg) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <BookOpen size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
        <h3 style={{ margin: "0 0 0.5rem" }}>Registration not found</h3>
        <p style={{ color: "var(--foreground-muted)", fontSize: "0.875rem" }}>
          This registration may have been removed or you don't have access to
          it.
        </p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => router.push("/staff/course-registrations")}
          style={{ marginTop: "1rem" }}
        >
          Back to Registrations
        </button>
      </div>
    );
  }

  const isPending = reg.status === "PENDING_HOD" || reg.status === "SUBMITTED";
  const isApproved = reg.status === "COMPLETED" || reg.status === "APPROVED";
  const isRejected = reg.status === "REJECTED";

  const totalUnits = reg.courses?.reduce(
    (sum: number, c: CourseSnapshot) => sum + (c.units || 0),
    0
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Notification Toast */}
      {notification && (
        <div
          className={`alert alert-${notification.type === "success" ? "success" : "error"}`}
          style={{ fontSize: "0.8125rem" }}
        >
          {notification.type === "success" ? (
            <Check size={14} style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
          )}
          {notification.text}
        </div>
      )}

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}
        >
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => router.push("/staff/course-registrations")}
            style={{ padding: "0.375rem", flexShrink: 0, marginTop: "0.125rem" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                flexWrap: "wrap",
              }}
            >
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                Course Registration Review
              </h1>
              <StatusBadge status={reg.status} />
            </div>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--foreground-muted)",
                margin: "0.25rem 0 0",
              }}
            >
              {reg.session} &mdash; {reg.semester} Semester &bull; {reg.level}{" "}
              Level
            </p>
          </div>
        </div>

        {/* Action Buttons — only when SUBMITTED */}
        {isPending && !isRejectMode && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setIsRejectMode(true)}
              style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
            >
              <XCircle size={15} /> Reject
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
            >
              {approveMutation.isPending ? (
                <Loader2 size={15} className="spin" />
              ) : (
                <CheckCircle2 size={15} />
              )}
              Approve Registration
            </button>
          </div>
        )}
      </div>

      {/* Reject Inline Panel */}
      {isRejectMode && (
        <div
          className="card"
          style={{
            padding: "1.25rem",
            background: "var(--status-error-bg)",
            border: "1px solid var(--status-error-border)",
          }}
        >
          <h4
            style={{
              fontWeight: 600,
              fontSize: "0.9375rem",
              color: "var(--status-error-text)",
              margin: "0 0 0.875rem",
            }}
          >
            Reject Registration
          </h4>
          <div className="form-group" style={{ margin: "0 0 1rem" }}>
            <label className="form-label">
              Reason for Rejection{" "}
              <span style={{ color: "var(--destructive)" }}>*</span>
            </label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Describe why this registration is being rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ resize: "vertical", minHeight: "80px" }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setIsRejectMode(false);
                setRejectReason("");
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => rejectMutation.mutate()}
            >
              {rejectMutation.isPending ? (
                <Loader2 size={13} className="spin" />
              ) : (
                <XCircle size={13} />
              )}
              Confirm Rejection
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: "1.25rem",
          alignItems: "start",
        }}
        className="reg-detail-grid"
      >
        {/* Left: Course List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Course Table */}
          <div className="card">
            <div className="card-header">
              <h3
                style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}
              >
                Registered Courses
              </h3>
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--foreground-muted)",
                }}
              >
                {reg.courses?.length || 0} courses &bull; {totalUnits} total
                units
              </span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th style={{ textAlign: "center" }}>Units</th>
                  </tr>
                </thead>
                <tbody>
                  {reg.courses?.length ? (
                    reg.courses.map((course: CourseSnapshot, idx: number) => (
                      <tr key={course.course_id || idx}>
                        <td
                          data-label="#"
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--foreground-muted)",
                            width: "40px",
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td
                          data-label="Course Code"
                          style={{ fontWeight: 600, fontSize: "0.875rem" }}
                        >
                          {course.course_code}
                        </td>
                        <td data-label="Course Title" style={{ fontSize: "0.875rem" }}>
                          {course.course_title}
                        </td>
                        <td
                          data-label="Units"
                          style={{ textAlign: "center", fontWeight: 600 }}
                        >
                          {course.units}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          color: "var(--foreground-muted)",
                          padding: "1.5rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        No courses in this registration.
                      </td>
                    </tr>
                  )}
                </tbody>
                {reg.courses?.length > 0 && (
                  <tfoot>
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          padding: "0.75rem 1.25rem",
                          borderTop: "2px solid var(--border)",
                          color: "var(--foreground)",
                        }}
                      >
                        Total Credit Units:
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: "1rem",
                          borderTop: "2px solid var(--border)",
                          color: "var(--primary)",
                        }}
                      >
                        {totalUnits}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Rejection Notice */}
          {isRejected && reg.rejection && (
            <div className="alert alert-error" style={{ fontSize: "0.875rem" }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>
                <strong>Rejected</strong> by{" "}
                {reg.rejection.rejected_by_name || "HOD"} on{" "}
                {reg.rejection.timestamp
                  ? new Date(reg.rejection.timestamp).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" }
                    )
                  : "—"}
                <br />
                <span style={{ color: "var(--status-error-text)" }}>
                  Reason: {reg.rejection.reason}
                </span>
              </div>
            </div>
          )}

          {/* Approved Info */}
          {isApproved && (
            <div
              className="card"
              style={{
                padding: "1.25rem",
                background: "var(--status-success-bg)",
                border: "1px solid var(--status-success-border)",
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
              }}
            >
              <CheckCircle2
                size={24}
                style={{ color: "var(--status-success-text)", flexShrink: 0 }}
              />
              <div>
                <p
                  style={{
                    fontWeight: 600,
                    margin: 0,
                    color: "var(--status-success-text)",
                  }}
                >
                  Registration Approved
                </p>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--foreground-muted)",
                    margin: "0.125rem 0 0",
                  }}
                >
                  {reg.approved_at
                    ? `Approved on ${new Date(reg.approved_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
                    : "This registration has been approved."}
                  {reg.hod_name ? ` by ${reg.hod_name}` : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Student Info Sidebar */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Student Info Card */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h4
              style={{
                fontWeight: 600,
                fontSize: "0.875rem",
                margin: "0 0 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <User size={15} /> Student Information
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
                fontSize: "0.8125rem",
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>Name</span>
                <span style={{ fontWeight: 600 }}>
                  {reg.student_name || "—"}
                </span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>
                  Matric / Reg No
                </span>
                <span style={{ fontWeight: 600 }}>
                  {reg.student_matric_or_reg || "—"}
                </span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>Faculty</span>
                <span style={{ fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
                  {reg.faculty}
                </span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>
                  Department
                </span>
                <span style={{ fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
                  {reg.department}
                </span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>Level</span>
                <span style={{ fontWeight: 600 }}>{reg.level} Level</span>
              </div>
            </div>
          </div>

          {/* Registration Meta Card */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h4
              style={{
                fontWeight: 600,
                fontSize: "0.875rem",
                margin: "0 0 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Calendar size={15} /> Registration Details
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
                fontSize: "0.8125rem",
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>
                  Academic Session
                </span>
                <span style={{ fontWeight: 600 }}>{reg.session}</span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>
                  Semester
                </span>
                <span style={{ fontWeight: 600 }}>{reg.semester}</span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>
                  Total Units
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: "var(--primary)",
                    fontSize: "0.9375rem",
                  }}
                >
                  {totalUnits}
                </span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>Status</span>
                <StatusBadge status={reg.status} />
              </div>
              {reg.submitted_at && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--foreground-muted)" }}>
                    Submitted
                  </span>
                  <span style={{ fontWeight: 500 }}>
                    {new Date(reg.submitted_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* HOD Signing Date (if pending) */}
          {isPending && !isRejectMode && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <h4
                style={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  margin: "0 0 0.75rem",
                }}
              >
                Signing Date
              </h4>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.8125rem" }}>
                  Date of Approval
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={signingDate}
                  onChange={(e) => setSigningDate(e.target.value)}
                  style={{ height: "36px" }}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "0.875rem" }}
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? (
                  <Loader2 size={14} className="spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                Approve Registration
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: "100%", marginTop: "0.5rem" }}
                onClick={() => setIsRejectMode(true)}
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .reg-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
