"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye, Filter, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { staffApi } from "@/lib/api/staff";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import type { DocumentResponse } from "@/types/document";

export default function StaffDocumentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const { data: docs, isLoading } = useQuery({
    queryKey: ["staff-all-documents"],
    queryFn: async () => {
      const res = await staffApi.getDocuments();
      return res.data.data;
    },
  });

  const filteredDocs = (docs || []).filter((doc) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && doc.status.startsWith("PENDING")) ||
      doc.status === statusFilter;

    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      doc.student_name.toLowerCase().includes(term) ||
      (doc.matric_number && doc.matric_number.toLowerCase().includes(term)) ||
      (doc.registration_number && doc.registration_number.toLowerCase().includes(term)) ||
      doc.department.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Assigned Documents Registry</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          Review, approve, or reject student clearance and course forms
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: "0.875rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--foreground-muted)" }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by student name, matric number, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.25rem", height: "36px" }}
          />
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
          {[
            { key: "ALL", label: "All Assigned" },
            { key: "PENDING", label: "Pending Review" },
            { key: "COMPLETED", label: "Signed / Approved" },
            { key: "REJECTED", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`btn btn-sm ${statusFilter === tab.key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setStatusFilter(tab.key)}
              style={{ fontSize: "0.8125rem" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <LoadingSkeleton rows={6} cols={6} />
        ) : filteredDocs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents found"
            description="No student documents match your current search and filter criteria."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Matric / Reg No</th>
                  <th>Faculty &amp; Department</th>
                  <th>Document Type</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
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
                      {doc.faculty} &bull; {doc.department} ({doc.level}L)
                    </td>
                    <td data-label="Document Type">
                      <span style={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                        {doc.doc_type === "CLEARANCE_FORM" ? "Clearance Form" : "Course Form"}
                      </span>
                    </td>
                    <td data-label="Submitted" style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                      {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td data-label="Action" style={{ textAlign: "right" }}>
                      <Link href={`/staff/documents/${doc.id}`} className="btn btn-primary btn-sm">
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
