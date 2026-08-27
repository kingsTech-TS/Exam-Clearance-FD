"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Shield, Users, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/auth/authStore";
import { staffLoginSchema, type StaffLoginForm } from "@/lib/validations/auth";

export default function StaffLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffLoginForm>({
    resolver: zodResolver(staffLoginSchema),
  });

  const onSubmit = async (data: StaffLoginForm) => {
    setError("");
    try {
      const res = await authApi.staffLogin(data);
      const { access_token, refresh_token } = res.data.data;
      setAuth(
        { id: "", role: "STAFF", full_name: "", staff_id: data.staff_id },
        access_token,
        refresh_token
      );
      router.push("/staff/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number } };
      if (e?.response?.status === 401) {
        setError("Invalid Staff ID or password. Please verify your credentials.");
      } else if (e?.response?.status === 403) {
        setError(
          e?.response?.data?.message ??
            "Your staff account is pending administrator approval or has been suspended."
        );
      } else {
        setError("Unable to connect to authentication server. Please try again.");
      }
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }} className="auth-grid">
      {/* Left Brand Panel (Desktop only - Hidden on Tablet & Mobile) */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
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
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 40%), " +
              "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)",
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
              <Shield size={22} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.125rem", lineHeight: 1.2 }}>EKSU Portal</div>
              <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Staff Document Processing</div>
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
            Faculty Bursars,
            <br />
            Auditors &amp; HODs
          </h1>

          <p style={{ fontSize: "0.9375rem", opacity: 0.85, lineHeight: 1.65, marginBottom: "2rem", maxWidth: "340px" }}>
            Review, sign, stamp, and process clearance forms and course registrations quickly and securely with verified cryptographic seals.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {[
              { title: "Bursary Verification", desc: "Stamp & approve faculty clearance forms" },
              { title: "Internal Audit Desk", desc: "Final verification and university seal application" },
              { title: "Head of Department", desc: "Course registration form validation & signing" },
            ].map((f) => (
              <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                <CheckCircle2 size={16} style={{ marginTop: "2px", flexShrink: 0, color: "#93c5fd" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{f.title}</div>
                  <div style={{ fontSize: "0.8125rem", opacity: 0.75 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1, marginTop: "auto", paddingTop: "2.5rem" }}>
          <p style={{ fontSize: "0.75rem", opacity: 0.6 }}>
            © {new Date().getFullYear()} Ekiti State University. All rights reserved.
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
          {/* Mobile Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.5rem" }}>
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                background: "var(--primary)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={16} color="white" />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.9375rem", display: "block", lineHeight: 1.2 }}>
                EKSU Staff Portal
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                Official Clearance &amp; Signing
              </span>
            </div>
          </div>

          <div style={{ marginBottom: "1.75rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, marginBottom: "0.375rem" }}>
              Sign in as Staff
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", margin: 0 }}>
              Enter your official Staff ID and password to access your queue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="staff-id">
                Staff ID Number
              </label>
              <input
                id="staff-id"
                type="text"
                className="form-input"
                placeholder="e.g. STF/2024/001"
                autoComplete="username"
                {...register("staff_id")}
              />
              {errors.staff_id && <p className="form-error">{errors.staff_id.message}</p>}
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
                <label className="form-label" htmlFor="staff-password" style={{ margin: 0 }}>
                  Password
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="staff-password"
                  type={showPwd ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your password"
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
              style={{ width: "100%", padding: "0.625rem", fontWeight: 600 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in…" : "Sign In to Staff Desk"}
            </button>
          </form>

          {/* Links */}
          <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8125rem", textAlign: "center" }}>
            <p style={{ margin: 0, color: "var(--foreground-muted)" }}>
              New staff member?{" "}
              <Link href="/staff/register" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                Register Staff Account
              </Link>
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", color: "var(--foreground-muted)" }}>
              <Link href="/login" style={{ color: "var(--foreground-muted)", textDecoration: "none" }}>
                All Portals
              </Link>
              <span>•</span>
              <Link href="/admin/login" style={{ color: "var(--foreground-muted)", textDecoration: "none" }}>
                Admin Sign In
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
