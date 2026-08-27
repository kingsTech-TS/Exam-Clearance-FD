"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Filter, ChevronLeft, ChevronRight, User, Clock } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import type { AuditLog } from "@/types/admin";

export default function AdminAuditLogsPage() {
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["admin-audit-logs", actionFilter, page],
    queryFn: async () => {
      const res = await adminApi.getAuditLogs({
        action: actionFilter || undefined,
        page,
        size: pageSize,
      });
      return res.data.data;
    },
  });

  const logs = logsData?.items || [];
  const total = logsData?.total || 0;
  const totalPages = logsData?.pages || Math.ceil(total / pageSize) || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>System Audit Logs</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          Immutable record of all digital signatures, document submissions, approvals, and administrative actions
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: "0.875rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "0.375rem", overflowX: "auto" }}>
          {[
            { key: "", label: "All Actions" },
            { key: "SIGN_DOCUMENT", label: "Document Signing" },
            { key: "REJECT_DOCUMENT", label: "Rejections" },
            { key: "APPROVE_STAFF", label: "Staff Approvals" },
            { key: "SUSPEND_USER", label: "Suspensions" },
            { key: "SUBMIT_DOCUMENT", label: "Form Submissions" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`btn btn-sm ${actionFilter === tab.key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => {
                setActionFilter(tab.key);
                setPage(1);
              }}
              style={{ fontSize: "0.8125rem" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card">
        {isLoading ? (
          <LoadingSkeleton rows={8} cols={5} />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No audit logs found"
            description="No system events match your selected action filter."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const dateObj = new Date(log.created_at);
                  const formattedDate = dateObj.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const formattedTime = dateObj.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

                  return (
                    <tr key={log.id}>
                      <td data-label="Timestamp" style={{ fontSize: "0.8125rem", whiteSpace: "nowrap", color: "var(--foreground-muted)" }}>
                        {formattedDate}, {formattedTime}
                      </td>
                      <td data-label="Actor" style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                        {log.actor_name}
                      </td>
                      <td data-label="Role">
                        <span className="badge badge-info">{log.actor_role}</span>
                      </td>
                      <td data-label="Action" style={{ fontWeight: 500, fontSize: "0.8125rem" }}>
                        {log.action}
                      </td>
                      <td data-label="Description" style={{ fontSize: "0.8125rem", color: "var(--foreground)" }}>
                        {log.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div
            style={{
              padding: "0.875rem 1.25rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.8125rem",
              color: "var(--foreground-muted)",
            }}
          >
            <span>Showing page {page} of {totalPages} ({total} total records)</span>
            <div style={{ display: "flex", gap: "0.375rem" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
