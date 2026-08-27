"use client";

import React from "react";
import { ClearancePeriodCard } from "@/components/admin/ClearancePeriodCard";

export default function AdminClearancePeriodPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Clearance Submission Window</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          Configure institutional start and end dates for student clearance submissions
        </p>
      </div>

      <ClearancePeriodCard />

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Policy &amp; Guidelines</h3>
        </div>
        <div className="card-body" style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", lineHeight: 1.6 }}>
          <p style={{ margin: "0 0 0.75rem" }}>
            When the clearance submission window is closed, students will see an institutional notification and the submission button will be locked.
          </p>
          <p style={{ margin: 0 }}>
            Active clearance reviews currently in the Bursar or Auditor queues will continue to be accessible to staff for signing and approvals regardless of window status.
          </p>
        </div>
      </div>
    </div>
  );
}
