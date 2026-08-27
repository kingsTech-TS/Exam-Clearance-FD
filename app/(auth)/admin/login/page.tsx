"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Shield, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/auth/authStore";
import { adminLoginSchema, type AdminLoginForm } from "@/lib/validations/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginForm) => {
    setError("");
    try {
      const res = await authApi.adminLogin(data);
      const { access_token, refresh_token } = res.data.data;
      setAuth(
        { id: "", role: "ADMIN", full_name: "Administrator", email: data.email },
        access_token,
        refresh_token
      );
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number } };
      if (e?.response?.status === 401) {
        setError("Invalid administrative email or password.");
      } else if (e?.response?.status === 403) {
        setError(e?.response?.data?.message ?? "Access restricted. This account does not possess administrator privileges.");
      } else {
        setError("Failed to connect to authentication gateway. Please check backend service.");
      }
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }} className="auth-grid">
      {/* Left Brand Panel (Desktop only - Hidden on Tablet & Mobile) */}
      <div
        style={{
          background: "linear-gradient(135deg, #0b1329 0%, #1e1b4b 50%, #1e3a8a 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "3.5rem 3rem",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 70% 30%, rgba(99,102,241,0.15) 0%, transparent 50%), " +
              "radial-gradient(circle at 20% 80%, rgba(30,58,138,0.2) 0%, transparent 60%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "2.5rem" }}>
            <div
              style={{
                width: "3rem",
                height: "3rem",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <ShieldCheck size={22} color="#a5b4fc" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.125rem", lineHeight: 1.2 }}>EKSU Control Center</div>
              <div style={{ fontSize: "0.75rem", color: "#c7d2fe" }}>System Administration &amp; Governance</div>
            </div>
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              lineHeight: 1.25,
              marginBottom: "1rem",
              color: "white",
            }}
          >
            Institutional
            <br />
            Administration
            <br />
            &amp; Security Portal
          </h1>

          <p style={{ fontSize: "0.9375rem", color: "#e0e7ff", lineHeight: 1.65, marginBottom: "2rem", maxWidth: "340px" }}>
            Full system control: staff approvals, clearance submission window schedules, immutable audit trail, and university document oversight.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {[
              { title: "Staff Approval Gate", desc: "Verify and activate Bursar, Auditor, and HOD desks" },
              { title: "Clearance Window Timing", desc: "Open, configure, and close clearance sessions" },
              { title: "Immutable Audit Log", desc: "Cryptographically verified action timestamps and actors" },
            ].map((f) => (
              <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                <CheckCircle2 size={16} style={{ marginTop: "2px", flexShrink: 0, color: "#818cf8" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{f.title}</div>
                  <div style={{ fontSize: "0.8125rem", color: "#c7d2fe" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1, marginTop: "auto", paddingTop: "2.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            Restricted access. All administrative actions are permanently logged for audit compliance.
          </p>
        </div>
      </div>

      {/* Right Content / Form Panel */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "var(--surface)",
        }}
        className="auth-form-container"
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.5rem" }}>
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
              <Lock size={16} color="#818cf8" />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.9375rem", display: "block", lineHeight: 1.2 }}>
                EKSU Admin Portal
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                Authorized Personnel Only
              </span>
            </div>
          </div>

          <div style={{ marginBottom: "1.75rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, marginBottom: "0.375rem" }}>
              Administrator Sign In
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", margin: 0 }}>
              Enter your designated administrative email and security credentials
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">
                Administrator Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                className="form-input"
                placeholder="admin@eksu.edu.ng"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="admin-password"
                  type={showPwd ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter administrator password"
                  autoComplete="current-password"
                  style={{ paddingRight: "2.5rem" }}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--foreground-muted)",
                    padding: 0,
                  }}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: "1.25rem", fontSize: "0.8125rem" }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.625rem", fontWeight: 600, background: "#1e1b4b", borderColor: "#1e1b4b" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Authenticating…" : "Sign In to Admin Console"}
            </button>
          </form>

          {/* Links */}
          <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8125rem", textAlign: "center" }}>
            <p style={{ margin: 0, color: "var(--foreground-muted)" }}>
              Need administrative provisioning?{" "}
              <Link href="/admin/register" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                Admin Setup Info
              </Link>
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", color: "var(--foreground-muted)" }}>
              <Link href="/login" style={{ color: "var(--foreground-muted)", textDecoration: "none" }}>
                All Portals
              </Link>
              <span>•</span>
              <Link href="/staff/login" style={{ color: "var(--foreground-muted)", textDecoration: "none" }}>
                Staff Sign In
              </Link>
              <span>•</span>
              <Link href="/student/login" style={{ color: "var(--foreground-muted)", textDecoration: "none" }}>
                Student Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-grid > *:first-child { display: none !important; }
        }
      `}</style>
    </div>
  );
}
