"use client";

import React, { useState } from "react";
import { X, CheckCircle, CheckCircle2, AlertCircle, PenTool, Calendar } from "lucide-react";
import type { BulkActionResponse } from "@/types/api";

interface BulkSignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  count: number;
  itemNoun: string; // e.g. "document", "registration"
  doneVerb?: string; // e.g. "signed", "approved"
  confirmLabel: string;
  isSubmitting: boolean;
  result: BulkActionResponse | null;
  error: string | null;
  onConfirm: (signingDate: string) => void;
  // Resolves an item id to a human label for the failure list
  labelFor?: (id: string) => string;
}

export function BulkSignDialog({
  isOpen,
  onClose,
  title,
  description,
  count,
  itemNoun,
  doneVerb = "signed",
  confirmLabel,
  isSubmitting,
  result,
  error,
  onConfirm,
  labelFor,
}: BulkSignDialogProps) {
  const [signingDate, setSigningDate] = useState(new Date().toISOString().split("T")[0]);

  if (!isOpen) return null;

  const plural = (n: number) => `${n} ${itemNoun}${n === 1 ? "" : "s"}`;
  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <div className="dialog-overlay" onClick={handleClose}>
      <div className="dialog-box" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{title}</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.125rem" }}>
              {plural(count)} selected
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleClose} disabled={isSubmitting}>
            <X size={16} />
          </button>
        </div>

        <div className="dialog-body">
          {result ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div className={`alert ${result.failed_count === 0 ? "alert-success" : result.success_count === 0 ? "alert-error" : "alert-warning"}`} style={{ fontSize: "0.8125rem" }}>
                {result.failed_count === 0 ? <CheckCircle2 size={14} style={{ flexShrink: 0 }} /> : <AlertCircle size={14} style={{ flexShrink: 0 }} />}
                {plural(result.success_count)} {doneVerb}, {result.failed_count} failed (of {result.total}).
              </div>

              {result.failed.length > 0 && (
                <div
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    maxHeight: "220px",
                    overflowY: "auto",
                    fontSize: "0.8125rem",
                  }}
                >
                  {result.failed.map((f) => (
                    <div key={f.id} style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: 600 }}>{labelFor?.(f.id) ?? f.id}</div>
                      <div style={{ color: "var(--destructive)", marginTop: "0.125rem" }}>{f.error}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
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
                    {description}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar size={15} color="var(--foreground-muted)" />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground-muted)" }}>Signing Date:</span>
                <input
                  type="date"
                  value={signingDate}
                  onChange={(e) => setSigningDate(e.target.value)}
                  className="input input-sm"
                  style={{ width: "150px" }}
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <div className="alert alert-error" style={{ marginTop: "1rem", fontSize: "0.8125rem" }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        <div className="dialog-footer">
          {result ? (
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onConfirm(signingDate)}
                disabled={isSubmitting || count === 0}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
              >
                <PenTool size={14} />
                {isSubmitting ? `Processing ${plural(count)}...` : confirmLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
