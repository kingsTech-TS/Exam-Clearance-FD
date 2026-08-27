"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Eye,
  ArrowRight,
  Shield,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth/authStore";
import { studentsApi } from "@/lib/api/students";
import { documentsApi } from "@/lib/api/documents";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DocumentUploadModal } from "@/components/documents/DocumentUploadModal";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import type { DocumentResponse } from "@/types/document";

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data: dashboardData, isLoading: dashLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: async () => {
      const res = await studentsApi.getDashboard();
      return res.data.data;
    },
  });

  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: ["student-documents"],
    queryFn: async () => {
      const res = await studentsApi.getDocuments();
      return res.data.data;
    },
  });

  const isLoading = dashLoading || docsLoading;

  if (isLoading) {
    return <PageSkeleton />;
  }

  const clearanceForm = dashboardData?.clearance_form || docsData?.find((d) => d.doc_type === "CLEARANCE_FORM");
  const courseForm = dashboardData?.course_form || docsData?.find((d) => d.doc_type === "COURSE_FORM");
  
  const isProfileComplete = Boolean(
    dashboardData?.profile_complete ||
    dashboardData?.profile_completed ||
    dashboardData?.profile?.profile_complete ||
    dashboardData?.profile?.profile_completed ||
    (dashboardData?.profile?.passport_uploaded && dashboardData?.profile?.signature_uploaded) ||
    user?.profile_complete
  );

  const isBursarSigned = Boolean(
    clearanceForm?.bursar_signed_at ||
    clearanceForm?.status === "PENDING_AUDITOR" ||
    clearanceForm?.status === "COMPLETED"
  );
  const isAuditorSigned = Boolean(
    clearanceForm?.auditor_signed_at ||
    clearanceForm?.status === "COMPLETED"
  );
  const isBursarRejected = clearanceForm?.status === "REJECTED" && !clearanceForm?.bursar_signed_at;
  const isAuditorRejected = clearanceForm?.status === "REJECTED" && Boolean(clearanceForm?.bursar_signed_at);

  const handleDownload = async (docId: string, filename: string) => {
    try {
      const res = await documentsApi.getDownloadUrl(docId);
      if (res.data.data.download_url) {
        const link = document.createElement("a");
        link.href = res.data.data.download_url;
        link.download = filename;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      alert("Unable to generate download link. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Welcome & Info Banner */}
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
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>
            Welcome back, {user?.full_name || dashboardData?.profile?.full_name || "Student"}
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
            Matric: {user?.matric_number || user?.registration_number || dashboardData?.profile?.matric_number || dashboardData?.profile?.registration_number || "—"} &bull; {user?.faculty || dashboardData?.profile?.faculty || "Faculty"} &bull; {user?.department || dashboardData?.profile?.department || "Department"} ({user?.level || dashboardData?.profile?.level || "100"}L)
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsUploadOpen(true)}
          disabled={!isProfileComplete}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Upload size={16} /> Submit Form for Signing
        </button>
      </div>

      {/* Profile Setup Status Card */}
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
            <AlertCircle size={20} color="var(--status-pending-text)" />
            <div>
              <div style={{ fontWeight: 600, color: "var(--status-pending-text)" }}>Profile Setup Required</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--status-pending-text)", marginTop: "0.125rem" }}>
                Please upload your passport photograph and digital signature to activate document submissions.
              </div>
            </div>
          </div>
          <Link
            href="/student/profile"
            className="btn btn-primary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "none" }}
          >
            Complete Setup <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Primary Forms Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="dashboard-cards-grid">
        {/* Clearance Form Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div
                style={{
                  width: "2rem",
                  height: "2rem",
                  background: "var(--primary-light)",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                }}
              >
                <Shield size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Student Clearance Form</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>Faculty Sequential Signing (Bursar &rarr; Auditor)</span>
              </div>
            </div>
            {clearanceForm && <StatusBadge status={clearanceForm.status} />}
          </div>

          <div className="card-body" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {clearanceForm ? (
              <>
                {/* Workflow steps */}
                <div style={{ background: "var(--background)", padding: "0.875rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground-muted)", marginBottom: "0.625rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Signing Pipeline
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        {isBursarSigned ? (
                          <CheckCircle2 size={14} color="var(--status-success-text)" />
                        ) : (
                          <Clock size={14} color="var(--foreground-muted)" />
                        )}
                        1. Faculty Bursar Review
                      </span>
                      <StatusBadge status={isBursarSigned ? "COMPLETED" : isBursarRejected ? "REJECTED" : "PENDING_BURSAR"} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        {isAuditorSigned ? (
                          <CheckCircle2 size={14} color="var(--status-success-text)" />
                        ) : (
                          <Clock size={14} color="var(--foreground-muted)" />
                        )}
                        2. University Auditor Clearance
                      </span>
                      <StatusBadge status={isAuditorSigned ? "COMPLETED" : isAuditorRejected ? "REJECTED" : isBursarSigned ? "PENDING_AUDITOR" : "PENDING_BURSAR"} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                  <Link href={`/student/documents/${clearanceForm.id}`} className="btn btn-outline btn-sm" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", textDecoration: "none" }}>
                    <Eye size={14} /> View Details
                  </Link>
                  {clearanceForm.status === "COMPLETED" && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDownload(clearanceForm.id, "clearance-form-signed.pdf")}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                    >
                      <Download size={14} /> Download Signed
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", textAlign: "center", gap: "0.75rem" }}>
                <FileText size={32} color="var(--foreground-muted)" style={{ opacity: 0.5 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>No Clearance Form Submitted</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.125rem" }}>
                    Upload your official university clearance form to begin the signing workflow.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsUploadOpen(true)}
                  disabled={!isProfileComplete}
                  style={{ marginTop: "0.25rem" }}
                >
                  Upload Clearance Form
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Course Form Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div
                style={{
                  width: "2rem",
                  height: "2rem",
                  background: "var(--primary-light)",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                }}
              >
                <UserCheck size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Course Registration Form</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>Departmental Signing (HOD Approval)</span>
              </div>
            </div>
            {courseForm && <StatusBadge status={courseForm.status} />}
          </div>

          <div className="card-body" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {courseForm ? (
              <>
                <div style={{ background: "var(--surface-sunken)", padding: "0.875rem", borderRadius: "6px" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground-muted)", marginBottom: "0.625rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Department Approval
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      {courseForm.status === "COMPLETED" ? (
                        <CheckCircle2 size={14} color="var(--status-success-text)" />
                      ) : (
                        <Clock size={14} color="var(--foreground-muted)" />
                      )}
                      Head of Department ({user?.department || dashboardData?.profile?.department || "HOD"})
                    </span>
                    <StatusBadge status={courseForm.status} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                  <Link href={`/student/documents/${courseForm.id}`} className="btn btn-outline btn-sm" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", textDecoration: "none" }}>
                    <Eye size={14} /> View Details
                  </Link>
                  {courseForm.status === "COMPLETED" && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDownload(courseForm.id, "course-form-signed.pdf")}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                    >
                      <Download size={14} /> Download Signed
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", textAlign: "center", gap: "0.75rem" }}>
                <FileText size={32} color="var(--foreground-muted)" style={{ opacity: 0.5 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>No Course Form Submitted</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.125rem" }}>
                    Upload your registered course form to obtain your HOD's digital signature.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsUploadOpen(true)}
                  disabled={!isProfileComplete}
                  style={{ marginTop: "0.25rem" }}
                >
                  Upload Course Form
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
        }}
      />
    </div>
  );
}
