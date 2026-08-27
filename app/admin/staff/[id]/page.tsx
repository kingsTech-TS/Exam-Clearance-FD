"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  X,
  UserCheck,
  UserX,
  ShieldAlert,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PromoteStaffDialog } from "@/components/admin/PromoteStaffDialog";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

export default function AdminStaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const queryClient = useQueryClient();
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);

  const { data: staff, isLoading } = useQuery({
    queryKey: ["admin-staff-detail", id],
    queryFn: async () => {
      const res = await adminApi.getStaffMember(id);
      return res.data.data;
    },
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => adminApi.approveStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-staff-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => adminApi.rejectStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-staff-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: () => adminApi.suspendStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-staff-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    },
  });

  const unsuspendMutation = useMutation({
    mutationFn: () => adminApi.unsuspendStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-staff-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      router.push("/admin/staff");
    },
  });

  if (isLoading) return <PageSkeleton />;

  if (!staff) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>Staff member not found</h3>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => router.push("/admin/staff")} style={{ marginTop: "1rem" }}>
          Back to Staff Directory
        </button>
      </div>
    );
  }

  const isPending = staff.approval_status === "PENDING";
  const isApproved = staff.approval_status === "APPROVED";
  const isSuspended = staff.approval_status === "SUSPENDED";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.push("/admin/staff")} style={{ padding: "0.375rem" }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>{staff.full_name}</h1>
              <StatusBadge status={staff.approval_status} type="approval" />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
              Staff ID: {staff.staff_id} &bull; Role: {staff.sub_role} &bull; {staff.faculty}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {isPending && (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
              >
                <Check size={14} /> Approve Account
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
              >
                <X size={14} /> Reject
              </button>
            </>
          )}

          {isApproved && (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsPromoteOpen(true)}
              >
                <ShieldAlert size={14} color="var(--primary)" /> Promote to Admin
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => suspendMutation.mutate()}
                disabled={suspendMutation.isPending}
              >
                <UserX size={14} /> Suspend Staff
              </button>
            </>
          )}

          {isSuspended && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => unsuspendMutation.mutate()}
              disabled={unsuspendMutation.isPending}
            >
              <UserCheck size={14} /> Unsuspend Staff
            </button>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ color: "var(--destructive)" }}
            onClick={() => {
              if (confirm("Are you sure you want to permanently delete this staff member?")) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Staff Details Card */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Staff &amp; Appointment Overview</h3>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Full Name</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{staff.full_name}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Staff ID</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{staff.staff_id}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Sub-Role</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{staff.sub_role}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Faculty</span>
              <span style={{ fontWeight: 500, fontSize: "0.9375rem" }}>{staff.faculty}</span>
            </div>
            {staff.department && (
              <div>
                <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Department</span>
                <span style={{ fontWeight: 500, fontSize: "0.9375rem" }}>{staff.department}</span>
              </div>
            )}
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Approval Status</span>
              <StatusBadge status={staff.approval_status} type="approval" />
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Joined On</span>
              <span style={{ fontWeight: 500, fontSize: "0.9375rem" }}>
                {new Date(staff.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Promote Modal */}
      <PromoteStaffDialog
        isOpen={isPromoteOpen}
        onClose={() => setIsPromoteOpen(false)}
        staffId={staff.id}
        staffName={staff.full_name}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-staff-detail", id] });
        }}
      />
    </div>
  );
}
