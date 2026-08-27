"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Shield, GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/auth/authStore";
import { studentLoginSchema, type StudentLoginForm } from "@/lib/validations/auth";

export default function StudentLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentLoginForm>({
    resolver: zodResolver(studentLoginSchema),
  });

  const onSubmit = async (data: StudentLoginForm) => {
    setError("");
    try {
      const res = await authApi.studentLogin({ identifier: data.identifier, password: data.password });
      const { access_token, refresh_token } = res.data.data;
      setAuth(
        { id: "", role: "STUDENT", full_name: "", matric_number: data.identifier, profile_complete: false },
        access_token,
        refresh_token
      );
      router.push("/student/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number } };
      if (e?.response?.status === 401) {
        setError("Invalid identifier or password. Please verify your matric/registration number.");
      } else if (e?.response?.status === 403) {
        setError(e?.response?.data?.message ?? "Your student account is currently suspended.");
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
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0369a1 100%)",
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
              "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%), " +
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
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
              <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>Student Digital Services</div>
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
            Digital Clearance &amp;
            <br />
            Course Form
            <br />
            Approvals
          </h1>

          <p style={{ fontSize: "0.9375rem", opacity: 0.85, lineHeight: 1.65, marginBottom: "2rem", maxWidth: "340px" }}>
            Upload clearance documents and course registration forms to receive digital signatures, bursary stamps, and official auditor seals online.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {[
              { title: "Fast Clearance Processing", desc: "Track progress from Bursar to Auditor in real-time" },
              { title: "Departmental Course Forms", desc: "Direct review & digital sign-off by your HOD" },
              { title: "Download Verified PDF", desc: "Get finalized documents with cryptographic validation" },
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
              <GraduationCap size={16} color="white" />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.9375rem", display: "block", lineHeight: 1.2 }}>
                EKSU Student Portal
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                Digital Clearance &amp; Signing
              </span>
            </div>
          </div>

          <div style={{ marginBottom: "1.75rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, marginBottom: "0.375rem" }}>
              Sign in as Student
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", margin: 0 }}>
              Use your Matric Number or Registration Number to log in
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="student-identifier">
                Matric Number / Registration Number
              </label>
              <input
                id="student-identifier"
                type="text"
                className="form-input"
                placeholder="e.g. 200601001 or 200601001EK23"
                autoComplete="username"
                {...register("identifier")}
              />
              {errors.identifier && <p className="form-error">{errors.identifier.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="student-password">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="student-password"
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
              {isSubmitting ? "Signing in…" : "Sign In to Student Portal"}
            </button>
          </form>

          {/* Links */}
          <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8125rem", textAlign: "center" }}>
            <p style={{ margin: 0, color: "var(--foreground-muted)" }}>
              Don&apos;t have an account?{" "}
              <Link href="/student/register" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                Create Student Account
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
              <Link href="/admin/login" style={{ color: "var(--foreground-muted)", textDecoration: "none" }}>
                Admin Sign In
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
