"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  Upload,
  Calendar,
  Building,
  User,
  Shield,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { documentsApi } from "@/lib/api/documents";
import { studentsApi } from "@/lib/api/students";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PdfViewer } from "@/components/documents/PdfViewer";
import { DocumentWorkflowTracker } from "@/components/documents/DocumentWorkflowTracker";
import { DocumentTimeline } from "@/components/documents/DocumentTimeline";
import { DocumentUploadModal } from "@/components/documents/DocumentUploadModal";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

export default function StudentDocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);

  const { data: docData, isLoading, refetch } = useQuery({
    queryKey: ["document-detail", id],
    queryFn: async () => {
      const res = await documentsApi.getDocument(id);
      return res.data.data;
    },
    enabled: !!id,
  });

  const { data: viewUrlData } = useQuery({
    queryKey: ["document-view-url", id],
    queryFn: async () => {
      const res = await documentsApi.getViewUrl(id);
      return res.data.data.view_url ?? null;
    },
    enabled: !!id,
  });

  if (isLoading) return <PageSkeleton />;

  if (!docData) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>Document not found</h3>
        <Link href="/student/documents" className="btn btn-secondary btn-sm" style={{ marginTop: "1rem" }}>
          Back to Documents
        </Link>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      const res = await documentsApi.getDownloadUrl(id);
      if (res.data.data.download_url) {
        const link = document.createElement("a");
        link.href = res.data.data.download_url;
        link.download = `${docData.doc_type}_Signed.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      alert("Unable to generate download link.");
    }
  };

  const isClearance = docData.doc_type === "CLEARANCE_FORM";
  const isCompleted = docData.status === "COMPLETED";
  const isRejected = docData.status === "REJECTED";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => router.push("/student/documents")}
            style={{ padding: "0.375rem" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                {isClearance ? "Clearance Form" : "Course Form"}
              </h1>
              <StatusBadge status={docData.status} />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
              ID: {docData.id} &bull; Submitted on {new Date(docData.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {isCompleted && (
            <button type="button" className="btn btn-primary" onClick={handleDownload}>
              <Download size={15} /> Download Signed PDF
            </button>
          )}
          {isRejected && (
            <button type="button" className="btn btn-primary" onClick={() => setIsReplaceModalOpen(true)}>
              <Upload size={15} /> Upload Replacement
            </button>
          )}
        </div>
      </div>

      {/* Rejection Alert Banner */}
      {isRejected && (
        <div
          className="alert alert-error"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            padding: "1rem",
            borderWidth: "2px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle size={18} />
            <strong style={{ fontSize: "0.9375rem" }}>Action Required: Document was Rejected</strong>
          </div>
          <div style={{ background: "rgba(255,255,255,0.7)", padding: "0.75rem", borderRadius: "4px", fontSize: "0.875rem", color: "var(--foreground)" }}>
            <strong>Reason:</strong> {docData.rejection_reason || "Document details did not match official university records."}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
            Please review the reason above, make the necessary corrections, and click &quot;Upload Replacement&quot; to resubmit your form.
          </div>
        </div>
      )}

      {/* Main Split Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem" }} className="document-detail-grid">
        {/* Left: PDF Preview */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <PdfViewer
            url={viewUrlData || docData.file_url}
            title={`${isClearance ? "Clearance" : "Course"} Form Preview`}
            canDownload={isCompleted}
            onDownload={handleDownload}
          />
        </div>

        {/* Right: Metadata, Tracker, Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Metadata Card */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h4 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem" }}>Document Details</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8125rem" }}>
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
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--foreground-muted)" }}>Reviewer:</span>
                <span style={{ fontWeight: 500 }}>{docData.current_reviewer || (isCompleted ? "Fully Signed" : "Assigned Reviewer")}</span>
              </div>
            </div>
          </div>

          {/* Workflow Tracker */}
          <DocumentWorkflowTracker document={docData} />

          {/* Audit Event Timeline */}
          <DocumentTimeline events={docData.history || []} />
        </div>
      </div>

      {/* Replacement Modal */}
      <DocumentUploadModal
        isOpen={isReplaceModalOpen}
        onClose={() => setIsReplaceModalOpen(false)}
        onSuccess={() => {
          refetch();
        }}
      />

      <style>{`
        @media (max-width: 1024px) {
          .document-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
