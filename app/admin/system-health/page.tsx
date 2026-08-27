"use client";

import React from "react";
import { SystemHealthStatus } from "@/components/admin/SystemHealthStatus";

export default function AdminSystemHealthPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>System Health &amp; Infrastructure</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          Live monitors for backend services, database, cloud storage, and CDN pipelines
        </p>
      </div>

      <SystemHealthStatus />

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Infrastructure Specifications</h3>
        </div>
        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
          <div>
            <span className="form-label" style={{ color: "var(--foreground-muted)" }}>API Environment</span>
            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Production (FastAPI REST)</span>
          </div>
          <div>
            <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Document Storage</span>
            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Amazon S3 / Local Secure Store</span>
          </div>
          <div>
            <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Image Processing</span>
            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Cloudinary Auto Background Removal</span>
          </div>
          <div>
            <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Database Engine</span>
            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>MongoDB Atlas Replica Cluster</span>
          </div>
        </div>
      </div>
    </div>
  );
}
