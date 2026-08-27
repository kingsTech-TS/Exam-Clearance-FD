"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Eye,
  Check,
  X,
  UserCheck,
  UserX,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin";
import { FACULTY_LIST } from "@/lib/constants/faculties";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { StaffApprovalQueue } from "@/components/admin/StaffApprovalQueue";
import { PromoteStaffDialog } from "@/components/admin/PromoteStaffDialog";
import type { AdminStaffRow } from "@/types/admin";

export default function AdminStaffPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [subRole, setSubRole] = useState("");
  const [faculty, setFaculty] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [promoteTarget, setPromoteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: staffData, isLoading } = useQuery({
    queryKey: ["admin-staff", search, subRole, faculty, status, page],
    queryFn: async () => {
      const res = await adminApi.getStaff({
        search: search || undefined,
        sub_role: subRole || undefined,
        faculty: faculty || undefined,
        approval_status: status || undefined,
        page,
        size: pageSize,
      });
      return res.data.data;
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminApi.suspendStaff(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-staff"] }),
  });

  const unsuspendMutation = useMutation({
    mutationFn: (id: string) => adminApi.unsuspendStaff(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-staff"] }),
  });

  const staffList = staffData?.items || [];
  const total = staffData?.total || 0;
  const totalPages = staffData?.pages || Math.ceil(total / pageSize) || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Staff Directory &amp; Management</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          Manage reviewer credentials, approve pending accounts, and configure permissions
        </p>
      </div>

      {/* Staff Approval Queue */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Pending Approval Queue</h3>
        </div>
        <div className="card-body">
          <StaffApprovalQueue />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "0.75rem" }} className="filter-grid">
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--foreground-muted)" }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by staff name or staff ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: "2.25rem", height: "36px" }}
            />
          </div>

          <select
            className="form-select"
            value={subRole}
            onChange={(e) => {
              setSubRole(e.target.value);
              setPage(1);
            }}
            style={{ height: "36px" }}
          >
            <option value="">All Sub-Roles</option>
            <option value="BURSAR">Bursar</option>
            <option value="AUDITOR">Auditor</option>
            <option value="HOD">Head of Department</option>
          </select>

          <select
            className="form-select"
            value={faculty}
            onChange={(e) => {
              setFaculty(e.target.value);
              setPage(1);
            }}
            style={{ height: "36px" }}
          >
            <option value="">All Faculties</option>
            {FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>

          <select
            className="form-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            style={{ height: "36px" }}
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="card">
        {isLoading ? (
          <LoadingSkeleton rows={6} cols={6} />
        ) : staffList.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No staff members found"
            description="No staff records match your current search and filter criteria."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Staff ID</th>
                  <th>Role</th>
                  <th>Faculty &amp; Department</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((st) => (
                  <tr key={st.id}>
                    <td data-label="Staff Name" style={{ fontWeight: 600 }}>
                      {st.full_name}
                    </td>
                    <td data-label="Staff ID" style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                      {st.staff_id}
                    </td>
                    <td data-label="Role">
                      <span className="badge badge-info">{st.sub_role}</span>
                    </td>
                    <td data-label="Faculty & Department" style={{ fontSize: "0.8125rem" }}>
                      {st.faculty} {st.department ? `(${st.department})` : ""}
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={st.approval_status} type="approval" />
                    </td>
                    <td data-label="Joined" style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                      {new Date(st.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td data-label="Actions" style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.375rem" }}>
                        <Link href={`/admin/staff/${st.id}`} className="btn btn-secondary btn-sm">
                          <Eye size={13} /> View
                        </Link>
                        {st.approval_status === "APPROVED" && (
                          <>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setPromoteTarget({ id: st.id, name: st.full_name })}
                              title="Promote to Admin"
                            >
                              <ShieldAlert size={13} color="var(--primary)" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => suspendMutation.mutate(st.id)}
                              disabled={suspendMutation.isPending}
                              title="Suspend staff account"
                            >
                              <UserX size={13} />
                            </button>
                          </>
                        )}
                        {st.approval_status === "SUSPENDED" && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => unsuspendMutation.mutate(st.id)}
                            disabled={unsuspendMutation.isPending}
                            title="Unsuspend account"
                          >
                            <UserCheck size={13} />
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
            <span>Showing page {page} of {totalPages} ({total} total staff)</span>
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

      {/* Promote Staff Dialog */}
      {promoteTarget && (
        <PromoteStaffDialog
          isOpen={true}
          onClose={() => setPromoteTarget(null)}
          staffId={promoteTarget.id}
          staffName={promoteTarget.name}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-staff"] })}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .filter-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
