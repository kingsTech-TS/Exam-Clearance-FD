"use client";

import React, { useState } from "react";
import { X, AlertTriangle, AlertCircle } from "lucide-react";
import { staffApi } from "@/lib/api/staff";

interface RejectDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  docTitle?: string;
  onSuccess: () => void;
}

export function RejectDocumentDialog({
  isOpen,
  onClose,
  documentId,
  docTitle = "Document",
  onSuccess,
}: RejectDocumentDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReject = async () => {
    if (!reason.trim()) {
      setError("Please provide a clear reason for the rejection so the student knows what to correct.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await staffApi.rejectDocument(documentId, reason.trim());
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Failed to reject document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle size={18} color="var(--destructive)" />
            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Reject Document</h3>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="dialog-body">
          <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginBottom: "1rem" }}>
            Rejecting <strong>{docTitle}</strong> will notify the student and allow them to upload a corrected replacement.
          </p>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
              <label className="form-label" style={{ margin: 0 }}>
                Reason for Rejection <span style={{ color: "var(--destructive)" }}>*</span>
              </label>
              <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>{reason.length} / 500</span>
            </div>
            <textarea
              className="form-input"
              rows={4}
              maxLength={500}
              placeholder="e.g. The uploaded course form is for the wrong semester. Please upload the 2025/2026 First Semester form."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          {error && (
            <div className="alert alert-error" style={{ fontSize: "0.8125rem", marginTop: "0.75rem" }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleReject}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}
