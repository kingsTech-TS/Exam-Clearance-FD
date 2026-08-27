"use client";
import Link from "next/link";
import { ShieldCheck, Lock, Users, ArrowRight, ArrowLeft, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function AdminRegisterPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "520px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                background: "#1e1b4b",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={16} color="#818cf8" />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.9375rem", display: "block", lineHeight: 1.2 }}>
                EKSU Control Center
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                Administrator Provisioning Guide
              </span>
            </div>
          </div>
          <Link href="/admin/login" className="btn btn-ghost btn-sm" style={{ textDecoration: "none", fontSize: "0.8125rem" }}>
            <ArrowLeft size={13} /> Admin Sign In
          </Link>
        </div>

        {/* Card */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, marginBottom: "0.25rem" }}>
              Administrator Account Access
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", margin: 0 }}>
              Institutional security protocol for administrative role assignment
            </p>
          </div>

          <div className="card-body">
            <div className="alert alert-info" style={{ marginBottom: "1.5rem", fontSize: "0.8125rem" }}>
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>
                To uphold institution-wide document integrity, Administrator accounts cannot be created via public open registration.
              </span>
            </div>

            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.75rem" }}>
              How Administrator Accounts Are Provisioned:
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "1.75rem",
                    height: "1.75rem",
                    borderRadius: "50%",
                    background: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  1
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>System Initial Super-Admin</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "2px" }}>
                    The primary Administrator account is provisioned directly by the university ICT Center during system setup.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "1.75rem",
                    height: "1.75rem",
                    borderRadius: "50%",
                    background: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  2
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Promotion from Approved Staff Member</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "2px" }}>
                    An existing Administrator can promote any verified staff member (Bursar, Auditor, or HOD) to Administrator status directly from the Staff Management Console.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link
                href="/admin/login"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", textDecoration: "none", background: "#1e1b4b", borderColor: "#1e1b4b" }}
              >
                Proceed to Administrator Sign In <ArrowRight size={14} />
              </Link>
              <Link
                href="/staff/register"
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}
              >
                <Users size={14} /> Register as Staff Member
              </Link>
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
          Need technical assistance? Contact university ICT at{" "}
          <a href="mailto:support@eksu.edu.ng" style={{ color: "var(--primary)", fontWeight: 500, textDecoration: "none" }}>
            support@eksu.edu.ng
          </a>
        </p>
      </div>
    </div>
  );
}
