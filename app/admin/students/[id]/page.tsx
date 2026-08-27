"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserX, UserCheck, Eye, Shield, FileText, Download } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin";
import { documentsApi } from "@/lib/api/documents";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import type { DocumentResponse } from "@/types/document";

export default function AdminStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const queryClient = useQueryClient();

  const { data: student, isLoading: isStudentLoading } = useQuery({
    queryKey: ["admin-student-detail", id],
    queryFn: async () => {
      const res = await adminApi.getStudent(id);
      return res.data.data;
    },
    enabled: !!id,
  });

  const { data: documents, isLoading: isDocsLoading } = useQuery({
    queryKey: ["admin-student-documents", id],
    queryFn: async () => {
      const res = await adminApi.getStudentDocuments(id);
      return res.data.data;
    },
    enabled: !!id,
  });

  const suspendMutation = useMutation({
    mutationFn: (suspend: boolean) => adminApi.suspendStudent(id, suspend),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-student-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-students-list"] });
    },
  });

  if (isStudentLoading || isDocsLoading) return <PageSkeleton />;

  if (!student) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>Student not found</h3>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => router.push("/admin/students")} style={{ marginTop: "1rem" }}>
          Back to Students
        </button>
      </div>
    );
  }

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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.push("/admin/students")} style={{ padding: "0.375rem" }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>{student.full_name}</h1>
              <span className={`badge ${student.is_suspended ? "badge-error" : "badge-success"}`}>
                {student.is_suspended ? "Suspended" : "Active"}
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
              Matric / Reg: {student.matric_number || student.registration_number || "—"} &bull; {student.department}
            </span>
          </div>
        </div>

        <button
          type="button"
          className={`btn ${student.is_suspended ? "btn-secondary" : "btn-danger"}`}
          onClick={() => suspendMutation.mutate(!student.is_suspended)}
          disabled={suspendMutation.isPending}
          style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
        >
          {student.is_suspended ? <UserCheck size={14} /> : <UserX size={14} />}
          {student.is_suspended ? "Unsuspend Student" : "Suspend Student"}
        </button>
      </div>

      {/* Student Profile Card */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Student Profile &amp; Verification Assets</h3>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Full Name</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{student.full_name}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Email Address</span>
              <span style={{ fontWeight: 500, fontSize: "0.9375rem" }}>{student.email}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Faculty</span>
              <span style={{ fontWeight: 500, fontSize: "0.9375rem" }}>{student.faculty}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Department</span>
              <span style={{ fontWeight: 500, fontSize: "0.9375rem" }}>{student.department}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Level</span>
              <span style={{ fontWeight: 500, fontSize: "0.9375rem" }}>{student.level} Level</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Registered Date</span>
              <span style={{ fontWeight: 500, fontSize: "0.9375rem" }}>
                {new Date(student.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submitted Documents */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Submitted Clearance &amp; Course Forms</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>Submitted Date</th>
                  <th>Current Status</th>
                  <th>Current Reviewer</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents && documents.length > 0 ? (
                  documents.map((doc: DocumentResponse) => (
                    <tr key={doc.id}>
                      <td data-label="Document Type">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {doc.doc_type === "CLEARANCE_FORM" ? (
                            <Shield size={16} color="var(--primary)" />
                          ) : (
                            <FileText size={16} color="var(--primary)" />
                          )}
                          <span style={{ fontWeight: 600 }}>
                            {doc.doc_type === "CLEARANCE_FORM" ? "Clearance Form" : "Course Form"}
                          </span>
                        </div>
                      </td>
                      <td data-label="Submitted Date" style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                        {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td data-label="Current Status">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td data-label="Current Reviewer" style={{ fontSize: "0.8125rem" }}>
                        {doc.current_reviewer || (doc.status === "COMPLETED" ? "Approved" : "—")}
                      </td>
                      <td data-label="Action" style={{ textAlign: "right" }}>
                        {doc.status === "COMPLETED" && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDownload(doc.id, `${doc.doc_type}.pdf`)}
                          >
                            <Download size={13} /> PDF
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "var(--foreground-muted)", padding: "1.5rem" }}>
                      No documents submitted by this student yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
