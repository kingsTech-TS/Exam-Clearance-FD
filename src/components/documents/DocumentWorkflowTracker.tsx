"use client";

import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { DocumentResponse, DocumentType } from "@/types/document";

interface DocumentWorkflowTrackerProps {
  document: DocumentResponse;
}

export function DocumentWorkflowTracker({ document }: DocumentWorkflowTrackerProps) {
  const isClearance = document.doc_type === "CLEARANCE_FORM";
  const isRejected = document.status === "REJECTED";
  const isCompleted = document.status === "COMPLETED";

  const getClearanceSteps = () => {
    const bursarDone = !!document.bursar_signed_at || document.status === "PENDING_AUDITOR" || isCompleted;
    const auditorDone = !!document.auditor_signed_at || isCompleted;

    return [
      {
        label: "Submission",
        status: "completed",
        date: document.created_at,
        actor: "Student",
      },
      {
        label: "Bursar Review & Seal",
        status: bursarDone ? "completed" : document.status === "PENDING_BURSAR" ? "current" : isRejected ? "rejected" : "pending",
        date: document.bursar_signed_at,
        actor: "Faculty Bursar",
      },
      {
        label: "Auditor Final Review & Seal",
        status: auditorDone ? "completed" : document.status === "PENDING_AUDITOR" ? "current" : "pending",
        date: document.auditor_signed_at,
        actor: "University Auditor",
      },
      {
        label: "Clearance Complete",
        status: isCompleted ? "completed" : isRejected ? "rejected" : "pending",
        date: document.completed_at,
        actor: "System",
      },
    ];
  };

  const getCourseFormSteps = () => {
    const hodDone = !!document.hod_signed_at || isCompleted;

    return [
      {
        label: "Submission",
        status: "completed",
        date: document.created_at,
        actor: "Student",
      },
      {
        label: "HOD Approval & Signature",
        status: hodDone ? "completed" : document.status === "PENDING_HOD" ? "current" : isRejected ? "rejected" : "pending",
        date: document.hod_signed_at,
        actor: "Head of Department",
      },
      {
        label: "Approval Complete",
        status: isCompleted ? "completed" : isRejected ? "rejected" : "pending",
        date: document.completed_at,
        actor: "System",
      },
    ];
  };

  const steps = isClearance ? getClearanceSteps() : getCourseFormSteps();

  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <h4 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "1rem", color: "var(--foreground)" }}>
        Workflow Progress
      </h4>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {steps.map((step, idx) => {
          const isDone = step.status === "completed";
          const isCurrent = step.status === "current";
          const isRej = step.status === "rejected";

          return (
            <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", position: "relative" }}>
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: "11px",
                    top: "24px",
                    bottom: "-16px",
                    width: "2px",
                    background: isDone ? "var(--primary)" : "var(--border)",
                    zIndex: 0,
                  }}
                />
              )}

              {/* Icon / Dot */}
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDone
                    ? "var(--primary)"
                    : isCurrent
                    ? "#ffffff"
                    : isRej
                    ? "var(--destructive)"
                    : "#ffffff",
                  border: isCurrent
                    ? "2px solid var(--primary)"
                    : isDone
                    ? "none"
                    : isRej
                    ? "none"
                    : "2px solid var(--border)",
                  color: isDone || isRej ? "#ffffff" : isCurrent ? "var(--primary)" : "var(--foreground-muted)",
                  zIndex: 1,
                  flexShrink: 0,
                  boxShadow: isCurrent ? "0 0 0 3px var(--primary-light)" : "none",
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={14} />
                ) : isRej ? (
                  <XCircle size={14} />
                ) : isCurrent ? (
                  <Clock size={13} />
                ) : (
                  <span style={{ fontSize: "0.6875rem", fontWeight: 600 }}>{idx + 1}</span>
                )}
              </div>

              {/* Step info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: isCurrent || isDone ? 600 : 500,
                      color: isRej ? "var(--destructive)" : isCurrent ? "var(--primary)" : "var(--foreground)",
                    }}
                  >
                    {step.label}
                  </span>
                  {step.date && (
                    <span style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)" }}>
                      {new Date(step.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", display: "block" }}>
                  {step.actor}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
