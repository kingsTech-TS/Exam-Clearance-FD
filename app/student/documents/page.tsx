"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, Download, Eye, Filter, CheckCircle2, Shield } from "lucide-react";
import Link from "next/link";
import { studentsApi } from "@/lib/api/students";
import { documentsApi } from "@/lib/api/documents";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { DocumentUploadModal } from "@/components/documents/DocumentUploadModal";
import type { DocumentResponse, DocumentType } from "@/types/document";

type FilterTab = "ALL" | "CLEARANCE" | "PENDING" | "COMPLETED" | "REJECTED";

export default function StudentDocumentsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: docs, isLoading } = useQuery({
    queryKey: ["student-documents"],
    queryFn: async () => {
      const res = await studentsApi.getDocuments();
      return res.data.data;
    },
  });

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
      alert("Unable to generate download URL.");
    }
  };

  const filteredDocs = (docs || []).filter((d) => {
    if (activeFilter === "CLEARANCE") return d.doc_type === "CLEARANCE_FORM";
    if (activeFilter === "PENDING") return d.status.startsWith("PENDING");
    if (activeFilter === "COMPLETED") return d.status === "COMPLETED";
    if (activeFilter === "REJECTED") return d.status === "REJECTED";
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>My Submitted Documents</h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
            Track the verification progress and download digitally signed forms
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsUploadOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Upload size={16} /> Submit New Form
        </button>
      </div>

      {/* Tabs / Filter bar */}
      <div className="card" style={{ padding: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.25rem", overflowX: "auto", paddingBottom: "2px" }}>
          {[
            { key: "ALL", label: "All Documents" },
            { key: "CLEARANCE", label: "Clearance Forms" },
            { key: "PENDING", label: "In Review" },
            { key: "COMPLETED", label: "Completed" },
            { key: "REJECTED", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`btn btn-sm ${activeFilter === tab.key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setActiveFilter(tab.key as FilterTab)}
              style={{ fontSize: "0.8125rem" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Card View */}
      <div className="card">
        {isLoading ? (
          <LoadingSkeleton rows={5} cols={5} />
        ) : filteredDocs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents found"
            description="You haven't submitted any forms matching the selected filter."
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsUploadOpen(true)}>
                <Upload size={14} /> Submit Form
              </button>
            }
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>Submitted Date</th>
                  <th>Current Status</th>
                  <th>Current Reviewer</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td data-label="Document Type">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        {doc.doc_type === "CLEARANCE_FORM" ? (
                          <Shield size={16} color="var(--primary)" />
                        ) : (
                          <FileText size={16} color="var(--primary)" />
                        )}
                        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                          {doc.doc_type === "CLEARANCE_FORM" ? "Clearance Form" : "Course Form"}
                        </span>
                      </div>
                    </td>
                    <td data-label="Submitted Date" style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                      {new Date(doc.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td data-label="Current Status">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td data-label="Current Reviewer" style={{ fontSize: "0.8125rem" }}>
                      {doc.current_reviewer || (doc.status === "COMPLETED" ? "All Approved" : "—")}
                    </td>
                    <td data-label="Actions" style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.375rem" }}>
                        <Link href={`/student/documents/${doc.id}`} className="btn btn-secondary btn-sm">
                          <Eye size={13} /> View
                        </Link>
                        {doc.status === "COMPLETED" && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleDownload(doc.id, `${doc.doc_type}_Signed.pdf`)}
                          >
                            <Download size={13} /> PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["student-documents"] });
          queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
        }}
      />
    </div>
  );
}
