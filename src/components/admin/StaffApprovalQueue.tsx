"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, AlertCircle, Clock, UserCheck } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { AdminStaffRow } from "@/types/admin";

export function StaffApprovalQueue() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: staffData, isLoading } = useQuery({
    queryKey: ["admin-pending-staff"],
    queryFn: async () => {
      const res = await adminApi.getStaff({ approval_status: "PENDING" });
      return res.data.data.items;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-staff"] });
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setActionError(e?.response?.data?.message || "Failed to approve staff account.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminApi.rejectStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-staff"] });
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setActionError(e?.response?.data?.message || "Failed to reject staff account.");
    },
  });

  const pendingList = staffData || [];

  if (pendingList.length === 0) {
    return (
      <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--foreground-muted)" }}>
        <p style={{ fontSize: "0.875rem", margin: 0 }}>No pending staff registrations awaiting approval.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {actionError && (
        <div className="alert alert-error" style={{ fontSize: "0.8125rem", padding: "0.5rem 0.75rem" }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          {actionError}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Staff ID</th>
              <th>Role</th>
              <th>Faculty / Dept</th>
              <th>Registered</th>
              <th style={{ textAlign: "right" }}>Review Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingList.map((staff) => (
              <tr key={staff.id}>
                <td data-label="Staff Name" style={{ fontWeight: 600 }}>
                  {staff.full_name}
                </td>
                <td data-label="Staff ID" style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                  {staff.staff_id}
                </td>
                <td data-label="Role">
                  <span className="badge badge-pending">{staff.sub_role}</span>
                </td>
                <td data-label="Faculty / Dept" style={{ fontSize: "0.8125rem" }}>
                  {staff.faculty} {staff.department ? `(${staff.department})` : ""}
                </td>
                <td data-label="Registered" style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                  {new Date(staff.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </td>
                <td data-label="Review Action" style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "0.375rem" }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => approveMutation.mutate(staff.id)}
                      disabled={approveMutation.isPending}
                    >
                      <Check size={13} /> Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => rejectMutation.mutate(staff.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <X size={13} /> Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
