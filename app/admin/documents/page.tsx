"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye, Download, FileText, Shield, Filter } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { documentsApi } from "@/lib/api/documents";
import { FACULTY_LIST, getDepartmentsForFaculty } from "@/lib/constants/faculties";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PdfViewer } from "@/components/documents/PdfViewer";
import type { DocumentResponse } from "@/types/document";

export default function AdminDocumentsPage() {
  const [search, setSearch] = useState("");
  const [docType, setDocType] = useState("");
  const [status, setStatus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [previewDoc, setPreviewDoc] = useState<DocumentResponse | null>(null);

  const departments = getDepartmentsForFaculty(faculty);

  const { data: docs, isLoading } = useQuery({
    queryKey: ["admin-documents", docType, status, faculty, department],
    queryFn: async () => {
      const res = await adminApi.getDocuments({
        doc_type: docType || undefined,
        status: status || undefined,
        faculty: faculty || undefined,
        department: department || undefined,
      });
      return res.data.data;
    },
  });

  const { data: previewUrl } = useQuery({
    queryKey: ["admin-preview-url", previewDoc?.id],
    queryFn: async () => {
      if (!previewDoc) return null;
      const res = await documentsApi.getViewUrl(previewDoc.id);
      return res.data.data.view_url ?? null;
    },
    enabled: !!previewDoc,
  });

  const filteredDocs = (docs || []).filter((doc) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      doc.student_name.toLowerCase().includes(term) ||
      (doc.matric_number && doc.matric_number.toLowerCase().includes(term)) ||
      (doc.registration_number && doc.registration_number.toLowerCase().includes(term)) ||
      doc.department.toLowerCase().includes(term)
    );
  });

  const handleDownload = async (docId: string, filename: string) => {
    try {
      const res = await documentsApi.getDownloadUrl(docId);
      if (res.data.data.download_url) {
        window.open(res.data.data.download_url, "_blank");
      }
    } catch {
      alert("Unable to open download URL.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Institutional Document Registry</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          System-wide repository of all student clearance forms and course registrations
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: "0.75rem" }} className="admin-docs-filter">
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--foreground-muted)" }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by student name, matric, or reg number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.25rem", height: "36px" }}
            />
          </div>

          <select className="form-select" value={docType} onChange={(e) => setDocType(e.target.value)} style={{ height: "36px" }}>
            <option value="">All Document Types</option>
            <option value="CLEARANCE_FORM">Clearance Form</option>
            <option value="COURSE_FORM">Course Form</option>
          </select>

          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)} style={{ height: "36px" }}>
            <option value="">All Statuses</option>
            <option value="PENDING_BURSAR">Pending Bursar</option>
            <option value="PENDING_AUDITOR">Pending Auditor</option>
            <option value="PENDING_HOD">Pending HOD</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            className="form-select"
            value={faculty}
            onChange={(e) => {
              setFaculty(e.target.value);
              setDepartment("");
            }}
            style={{ height: "36px" }}
          >
            <option value="">All Faculties</option>
            {FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>

          <select
            className="form-select"
            value={department}
            disabled={!faculty}
            onChange={(e) => setDepartment(e.target.value)}
            style={{ height: "36px" }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="card">
        {isLoading ? (
          <LoadingSkeleton rows={6} cols={6} />
        ) : filteredDocs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents found"
            description="No institutional documents match your filter criteria."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Matric / Reg No</th>
                  <th>Faculty &amp; Department</th>
                  <th>Form Type</th>
                  <th>Status</th>
                  <th>Current Reviewer</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td data-label="Student" style={{ fontWeight: 600 }}>
                      {doc.student_name}
                    </td>
                    <td data-label="Matric / Reg No" style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                      {doc.matric_number || doc.registration_number || "—"}
                    </td>
                    <td data-label="Faculty & Department" style={{ fontSize: "0.8125rem" }}>
                      {doc.faculty} &bull; {doc.department}
                    </td>
                    <td data-label="Form Type">
                      <span style={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                        {doc.doc_type === "CLEARANCE_FORM" ? "Clearance Form" : "Course Form"}
                      </span>
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td data-label="Current Reviewer" style={{ fontSize: "0.8125rem" }}>
                      {doc.current_reviewer || (doc.status === "COMPLETED" ? "All Approved" : "—")}
                    </td>
                    <td data-label="Submitted" style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                      {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </td>
                    <td data-label="Actions" style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.375rem" }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setPreviewDoc(doc)}
                        >
                          <Eye size={13} /> Preview
                        </button>
                        {doc.status === "COMPLETED" && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleDownload(doc.id, `${doc.doc_type}.pdf`)}
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

      {/* PDF Preview Modal */}
      {previewDoc && (
        <div className="dialog-overlay" onClick={() => setPreviewDoc(null)}>
          <div
            className="dialog-box"
            style={{ maxWidth: "900px", width: "95vw", height: "85vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ flex: 1, overflow: "hidden" }}>
              <PdfViewer
                url={previewUrl || previewDoc.file_url}
                title={`${previewDoc.student_name} — ${previewDoc.doc_type === "CLEARANCE_FORM" ? "Clearance" : "Course"} Form`}
                canDownload={previewDoc.status === "COMPLETED"}
                onDownload={() => handleDownload(previewDoc.id, `${previewDoc.doc_type}.pdf`)}
              />
            </div>
            <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .admin-docs-filter {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
