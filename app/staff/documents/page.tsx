"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, Filter, FileText, CheckCircle2, PenTool } from "lucide-react";
import Link from "next/link";
import { staffApi, BULK_MAX_ITEMS } from "@/lib/api/staff";
import { useAuthStore } from "@/lib/auth/authStore";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { BulkSignDialog } from "@/components/documents/BulkSignDialog";
import type { DocumentResponse, DocumentStatus } from "@/types/document";
import type { BulkActionResponse } from "@/types/api";

// Bulk signing is only available to Bursars and Auditors, each for their own pending stage
const SIGNABLE_STATUS: Partial<Record<string, DocumentStatus>> = {
  BURSAR: "PENDING_BURSAR",
  AUDITOR: "PENDING_AUDITOR",
};

export default function StaffDocumentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const signableStatus = user?.sub_role ? SIGNABLE_STATUS[user.sub_role] : undefined;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkActionResponse | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

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
      doc.student_matric_or_reg?.toLowerCase().includes(term) ||
      doc.department.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const isSignable = (doc: DocumentResponse) => !!signableStatus && doc.status === signableStatus;
  const visibleSignable = filteredDocs.filter(isSignable);
  // Only act on selections that are still visible and signable (filters or refetches may hide them)
  const selectedSignable = visibleSignable.filter((d) => selectedIds.has(d.id));
  const allVisibleSelected = visibleSignable.length > 0 && selectedSignable.length === visibleSignable.length;

  const toggleOne = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAllVisible = () =>
    setSelectedIds(allVisibleSelected ? new Set() : new Set(visibleSignable.map((d) => d.id)));

  const bulkSignMutation = useMutation({
    mutationFn: ({ ids, date }: { ids: string[]; date: string }) => staffApi.bulkSignDocuments(ids, date),
    onSuccess: (res) => {
      setBulkResult(res.data.data);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["staff-all-documents"] });
      queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setBulkError(e?.response?.data?.message || "Bulk signing failed. Please try again.");
    },
  });

  const openBulk = () => {
    setBulkResult(null);
    setBulkError(null);
    setBulkOpen(true);
  };

  const docLabel = (id: string) => {
    const d = docs?.find((x) => x.id === id);
    return d ? `${d.student_name} (${d.student_matric_or_reg || "—"})` : id;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Assigned Documents Registry</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          Review, approve, or reject student clearance and course forms
        </p>
      </div>

      {/* Bulk Sign Bar */}
      {signableStatus && selectedSignable.length > 0 && (
        <div className="card" style={{ padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
            {selectedSignable.length} document{selectedSignable.length === 1 ? "" : "s"} selected
            {selectedSignable.length > BULK_MAX_ITEMS && (
              <span style={{ color: "var(--destructive)", fontWeight: 500 }}> &mdash; maximum {BULK_MAX_ITEMS} per batch</span>
            )}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedIds(new Set())}>
              Clear
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={openBulk}
              disabled={selectedSignable.length > BULK_MAX_ITEMS}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
            >
              <PenTool size={13} /> Sign Selected
            </button>
          </div>
        </div>
      )}

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
                  {signableStatus && (
                    <th style={{ width: "36px" }}>
                      <input
                        type="checkbox"
                        aria-label="Select all documents awaiting your signature"
                        checked={allVisibleSelected}
                        disabled={visibleSignable.length === 0}
                        onChange={toggleAllVisible}
                      />
                    </th>
                  )}
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
                    {signableStatus && (
                      <td data-label="Select">
                        {isSignable(doc) && (
                          <input
                            type="checkbox"
                            aria-label={`Select ${doc.student_name}`}
                            checked={selectedIds.has(doc.id)}
                            onChange={() => toggleOne(doc.id)}
                          />
                        )}
                      </td>
                    )}
                    <td data-label="Student" style={{ fontWeight: 600 }}>
                      {doc.student_name}
                    </td>
                    <td data-label="Matric / Reg No" style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                      {doc.student_matric_or_reg || "—"}
                    </td>
                    <td data-label="Faculty & Department" style={{ fontSize: "0.8125rem" }}>
                      {doc.faculty} &bull; {doc.department} ({doc.level}L)
                    </td>
                    <td data-label="Document Type">
                      <span style={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                        {doc.document_type === "CLEARANCE" ? "Clearance Form" : "Course Form"}
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

      <BulkSignDialog
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Bulk Sign Clearance Forms"
        description={
          user?.sub_role === "AUDITOR"
            ? "Your Auditor signature and seal will be applied to every selected Bursar-signed clearance form, completing clearance for those students. Any form that fails validation is skipped; the rest are still signed."
            : "Your Bursar signature and seal will be applied to every selected clearance form, forwarding them to the Auditor. Any form that fails validation is skipped; the rest are still signed."
        }
        count={selectedSignable.length}
        itemNoun="document"
        confirmLabel="Sign All Selected"
        isSubmitting={bulkSignMutation.isPending}
        result={bulkResult}
        error={bulkError}
        labelFor={docLabel}
        onConfirm={(date) => {
          setBulkError(null);
          bulkSignMutation.mutate({ ids: selectedSignable.map((d) => d.id), date });
        }}
      />
    </div>
  );
}
