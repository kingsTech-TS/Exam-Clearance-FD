"use client";

import React, { useState } from "react";
import { X, ShieldAlert, AlertCircle } from "lucide-react";
import { adminApi } from "@/lib/api/admin";

interface PromoteStaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: string;
  staffName: string;
  onSuccess: () => void;
}

export function PromoteStaffDialog({
  isOpen,
  onClose,
  staffId,
  staffName,
  onSuccess,
}: PromoteStaffDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePromote = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await adminApi.promoteStaff(staffId);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Failed to promote staff member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldAlert size={18} color="var(--primary)" />
            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Promote Staff to Administrator</h3>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="dialog-body">
          <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginBottom: "1rem" }}>
            You are about to promote <strong>{staffName}</strong> to System Administrator.
          </p>

          <div className="alert alert-warning" style={{ fontSize: "0.8125rem", marginBottom: "1rem" }}>
            <div>
              <strong>Permission Warning:</strong> Administrators have full access to manage students, approve/suspend staff, configure clearance periods, inspect audit logs, and oversee all institutional documents.
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ fontSize: "0.8125rem" }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePromote} disabled={isSubmitting}>
            {isSubmitting ? "Promoting..." : "Confirm Promotion"}
          </button>
        </div>
      </div>
    </div>
  );
}
