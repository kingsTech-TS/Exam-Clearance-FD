"use client";

import React from "react";
import { useAuthStore } from "@/lib/auth/authStore";
import { Shield, Lock } from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuthStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "700px" }}>
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>System Settings</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          Administrative security policies and configuration
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Administrator Profile</h3>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Administrator Name</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{user?.full_name || "System Admin"}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)" }}>Email Address</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{user?.email || "admin@eksu.edu.ng"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Security Configuration</h3>
        </div>
        <div className="card-body" style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", lineHeight: 1.6 }}>
          <p style={{ margin: "0 0 0.5rem" }}>
            JWT Bearer authentication tokens expire after 24 hours. Refresh tokens are exchanged automatically in the background.
          </p>
          <p style={{ margin: 0 }}>
            Audit logs are immutable and cryptographically timestamped upon any signature or approval event.
          </p>
        </div>
      </div>
    </div>
  );
}
