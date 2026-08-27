"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Shield,
  FileText,
  User,
  Building,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/authStore";
import { staffApi } from "@/lib/api/staff";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PdfViewer } from "@/components/documents/PdfViewer";
import { DocumentWorkflowTracker } from "@/components/documents/DocumentWorkflowTracker";
import { DocumentTimeline } from "@/components/documents/DocumentTimeline";
import { SignDocumentDialog } from "@/components/documents/SignDocumentDialog";
import { RejectDocumentDialog } from "@/components/documents/RejectDocumentDialog";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

export default function StaffDocumentReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuthStore();

  const [isSignOpen, setIsSignOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const { data: docData, isLoading, refetch } = useQuery({
    queryKey: ["staff-document-detail", id],
    queryFn: async () => {
      const res = await staffApi.getDocument(id);
      return res.data.data;
    },
    enabled: !!id,
  });

  const { data: viewUrlData } = useQuery({
    queryKey: ["staff-doc-view-url", id],
    queryFn: async () => {
      const res = await staffApi.getDocumentViewUrl(id);
      return res.data.data.view_url ?? null;
    },
    enabled: !!id,
  });

  if (isLoading) return <PageSkeleton />;

  if (!docData) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>Document not found</h3>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => router.push("/staff/documents")} style={{ marginTop: "1rem" }}>
          Back to Documents
        </button>
      </div>
    );
  }

  const isClearance = docData.doc_type === "CLEARANCE_FORM";
  const subRole = user?.sub_role || "BURSAR";

  // Check if current staff can sign this document
  const canSign =
    (subRole === "BURSAR" && docData.status === "PENDING_BURSAR") ||
    (subRole === "AUDITOR" && docData.status === "PENDING_AUDITOR") ||
    (subRole === "HOD" && docData.status === "PENDING_HOD");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => router.push("/staff/documents")}
            style={{ padding: "0.375rem" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                {isClearance ? "Clearance Form Review" : "Course Form Review"}
              </h1>
              <StatusBadge status={docData.status} />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
              Student: {docData.student_name} ({docData.matric_number || docData.registration_number || "—"})
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {canSign && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setIsRejectOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
            >
              <XCircle size={15} /> Reject
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsSignOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
            >
              <CheckCircle size={15} /> Sign &amp; Approve
            </button>
          </div>
        )}
      </div>

      {/* Main Split Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem" }} className="review-split-grid">
        {/* Left: PDF Viewer */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <PdfViewer
            url={viewUrlData || docData.file_url}
            title={`${docData.student_name} — ${isClearance ? "Clearance" : "Course"} Form`}
          />
        </div>

        {/* Right: Review details, Student info, Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Student Info Card */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h4 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem" }}>Student Information</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8125rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--foreground-muted)" }}>Name:</span>
                <span style={{ fontWeight: 600 }}>{docData.student_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--foreground-muted)" }}>Matric / Reg No:</span>
                <span style={{ fontWeight: 600 }}>{docData.matric_number || docData.registration_number || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--foreground-muted)" }}>Faculty:</span>
                <span style={{ fontWeight: 500 }}>{docData.faculty}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--foreground-muted)" }}>Department:</span>
                <span style={{ fontWeight: 500 }}>{docData.department}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--foreground-muted)" }}>Level:</span>
                <span style={{ fontWeight: 500 }}>{docData.level} Level</span>
              </div>
            </div>
          </div>

          {/* Quick Action Box if pending */}
          {canSign && (
            <div className="card" style={{ padding: "1.25rem", background: "var(--primary-light)", borderColor: "var(--primary-muted)" }}>
              <h4 style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--primary)", marginBottom: "0.375rem" }}>
                Your Review is Required
              </h4>
              <p style={{ fontSize: "0.8125rem", color: "var(--foreground)", margin: "0 0 1rem" }}>
                Inspect the document on the left. Click Sign &amp; Approve to append your digital signature and seal.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsSignOpen(true)}
                  style={{ flex: 1 }}
                >
                  <CheckCircle size={14} /> Sign Form
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsRejectOpen(true)}
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          )}

          {/* Rejection notice if already rejected */}
          {docData.status === "REJECTED" && docData.rejection_reason && (
            <div className="alert alert-error" style={{ fontSize: "0.8125rem" }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <div>
                <strong>Rejection Reason:</strong> {docData.rejection_reason}
              </div>
            </div>
          )}

          {/* Workflow Progress */}
          <DocumentWorkflowTracker document={docData} />

          {/* Audit Timeline */}
          <DocumentTimeline events={docData.history || []} />
        </div>
      </div>

      {/* Modals */}
      <SignDocumentDialog
        isOpen={isSignOpen}
        onClose={() => setIsSignOpen(false)}
        documentId={docData.id}
        subRole={subRole}
        docTitle={`${docData.student_name} — ${isClearance ? "Clearance Form" : "Course Form"}`}
        onSuccess={() => {
          refetch();
        }}
      />

      <RejectDocumentDialog
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        documentId={docData.id}
        docTitle={`${docData.student_name} — ${isClearance ? "Clearance Form" : "Course Form"}`}
        onSuccess={() => {
          refetch();
        }}
      />

      <style>{`
        @media (max-width: 1024px) {
          .review-split-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
