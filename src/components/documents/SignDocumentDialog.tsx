"use client";

import React, { useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { staffApi } from "@/lib/api/staff";
import type { StaffSubRole } from "@/types/user";

interface SignDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  subRole?: StaffSubRole;
  docTitle?: string;
  onSuccess: () => void;
}

export function SignDocumentDialog({
  isOpen,
  onClose,
  documentId,
  subRole = "BURSAR",
  docTitle = "Document",
  onSuccess,
}: SignDocumentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const today = new Date().toISOString().split("T")[0];

  const getRoleDescription = () => {
    switch (subRole) {
      case "BURSAR":
        return "You are about to sign this document as the Faculty Bursar. Your official signature, signing date, and institutional seal will be appended to the PDF, transitioning it to Auditor Review.";
      case "AUDITOR":
        return "This document has already been verified and signed by the Bursar. Signing now will affix your official Auditor signature & seal, completing the clearance workflow for this student.";
      case "HOD":
        return "You are signing this Course Form as the Head of Department. Your official signature and date will be appended to the course registration PDF.";
      default:
        return "You are about to sign this document digitally.";
    }
  };

  const handleSign = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await staffApi.signDocument(documentId, today);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Failed to digitally sign document. Please check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Confirm Digital Signature</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.125rem" }}>
              {docTitle}
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="dialog-body">
          <div
            style={{
              padding: "1rem",
              background: "var(--primary-light)",
              borderRadius: "6px",
              border: "1px solid var(--primary-muted)",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
              <CheckCircle size={18} color="var(--primary)" style={{ marginTop: "2px", flexShrink: 0 }} />
              <p style={{ fontSize: "0.8125rem", color: "var(--foreground)", margin: 0, lineHeight: 1.5 }}>
                {getRoleDescription()}
              </p>
            </div>
          </div>

          <div style={{ background: "var(--background)", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "0.8125rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ color: "var(--foreground-muted)" }}>Signer Role:</span>
              <span style={{ fontWeight: 600 }}>{subRole}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--foreground-muted)" }}>Signing Date:</span>
              <span style={{ fontWeight: 600 }}>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginTop: "1rem", fontSize: "0.8125rem" }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSign} disabled={isSubmitting}>
            {isSubmitting ? "Signing PDF..." : "Sign Document"}
          </button>
        </div>
      </div>
    </div>
  );
}
