"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Shield, GraduationCap, Users, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/auth/authStore";
import {
  studentLoginSchema, type StudentLoginForm,
  staffLoginSchema, type StaffLoginForm,
  adminLoginSchema, type AdminLoginForm,
} from "@/lib/validations/auth";

type RoleTab = "student" | "staff" | "admin";

function LeftPanel() {
  return (
    <div
      style={{
        background: "var(--primary)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "3rem 2.5rem",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.07) 0%, transparent 50%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "3rem" }}>
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
            <div style={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.2 }}>EKSU</div>
            <div style={{ fontSize: "0.75rem", opacity: 0.75, marginTop: "1px" }}>
              Digital Clearance System
            </div>
          </div>
        </div>

        <h1
          style={{
            fontSize: "1.625rem",
            fontWeight: 700,
            lineHeight: 1.25,
            marginBottom: "1rem",
            color: "white",
          }}
        >
          Ekiti State University
          <br />
          Student Clearance &amp;
          <br />
          Course Form Portal
        </h1>

        <p style={{ fontSize: "0.9rem", opacity: 0.8, lineHeight: 1.65, marginBottom: "2.5rem", maxWidth: "320px" }}>
          A secure, digital platform for processing student clearance forms and course form approvals — faster, transparent, and paperless.
        </p>

        {/* Feature highlights */}
        {[
          { label: "Students", desc: "Submit clearance & course forms digitally" },
          { label: "Staff", desc: "Review and sign assigned documents" },
          { label: "Admin", desc: "Manage the full clearance workflow" },
        ].map((f) => (
          <div
            key={f.label}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.625rem",
              marginBottom: "0.875rem",
            }}
          >
            <CheckCircle2 size={15} style={{ marginTop: "2px", flexShrink: 0, opacity: 0.9 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{f.label}</div>
              <div style={{ fontSize: "0.8125rem", opacity: 0.7 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: "auto", paddingTop: "2.5rem" }}>
        <p style={{ fontSize: "0.75rem", opacity: 0.5 }}>
          © {new Date().getFullYear()} Ekiti State University. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// --- Student Login Form ---
function StudentLoginFormComp() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StudentLoginForm>({
    resolver: zodResolver(studentLoginSchema),
  });

  const onSubmit = async (data: StudentLoginForm) => {
    setError("");
    try {
      const res = await authApi.studentLogin({ identifier: data.identifier, password: data.password });
      const { access_token, refresh_token } = res.data.data;
      // Minimal user info — full profile fetched on dashboard
      setAuth(
        { id: "", role: "STUDENT", full_name: "", matric_number: data.identifier, profile_complete: false },
        access_token,
        refresh_token
      );
      router.push("/student/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number } };
      if (e?.response?.status === 401) setError("Invalid credentials. Please check your ID and password.");
      else if (e?.response?.status === 403) setError(e?.response?.data?.message ?? "Account suspended or inactive.");
      else setError("Something went wrong. Please try again.");
    }
  };

  return (
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
          >
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && <p className="form-error">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign In"}
      </button>

      <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/student/register" style={{ color: "var(--primary)", fontWeight: 500 }}>
          Register here
        </Link>
      </p>
    </form>
  );
}

// --- Staff Login Form ---
function StaffLoginFormComp() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StaffLoginForm>({
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
      if (e?.response?.status === 401) setError("Invalid Staff ID or password.");
      else if (e?.response?.status === 403) setError(e?.response?.data?.message ?? "Your account is not yet approved or has been suspended.");
      else setError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="staff-id">Staff ID</label>
        <input id="staff-id" type="text" className="form-input" placeholder="Enter your Staff ID" {...register("staff_id")} />
        {errors.staff_id && <p className="form-error">{errors.staff_id.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="staff-password">Password</label>
        <div style={{ position: "relative" }}>
          <input
            id="staff-password"
            type={showPwd ? "text" : "password"}
            className="form-input"
            placeholder="Enter your password"
            style={{ paddingRight: "2.5rem" }}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", padding: 0 }}
          >
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && <p className="form-error">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign In"}
      </button>

      <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
        New staff member?{" "}
        <Link href="/staff/register" style={{ color: "var(--primary)", fontWeight: 500 }}>
          Register here
        </Link>
      </p>
    </form>
  );
}

// --- Admin Login Form ---
function AdminLoginFormComp() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginForm) => {
    setError("");
    try {
      const res = await authApi.adminLogin(data);
      const { access_token, refresh_token } = res.data.data;
      setAuth(
        { id: "", role: "ADMIN", full_name: "", email: data.email },
        access_token,
        refresh_token
      );
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number } };
      if (e?.response?.status === 401) setError("Invalid email or password.");
      else setError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="admin-email">Email Address</label>
        <input id="admin-email" type="email" className="form-input" placeholder="admin@eksu.edu.ng" {...register("email")} />
        {errors.email && <p className="form-error">{errors.email.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="admin-password">Password</label>
        <div style={{ position: "relative" }}>
          <input
            id="admin-password"
            type={showPwd ? "text" : "password"}
            className="form-input"
            placeholder="Enter your password"
            style={{ paddingRight: "2.5rem" }}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", padding: 0 }}
          >
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && <p className="form-error">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

// ---- Main Login Page ----
export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<RoleTab>("student");

  const tabs: { key: RoleTab; label: string; icon: React.ElementType }[] = [
    { key: "student", label: "Student", icon: GraduationCap },
    { key: "staff", label: "Staff", icon: Users },
    { key: "admin", label: "Admin", icon: Lock },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }} className="auth-grid">
      <LeftPanel />

      {/* Right — login form */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "var(--surface)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "0.375rem" }}>Sign in to your account</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
              Select your role below to continue
            </p>
          </div>

          {/* Role tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0.375rem",
              background: "var(--background)",
              padding: "0.25rem",
              borderRadius: "8px",
              marginBottom: "1.75rem",
              border: "1px solid var(--border)",
            }}
          >
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                id={`login-tab-${key}`}
                onClick={() => setActiveTab(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.375rem",
                  padding: "0.5rem",
                  borderRadius: "6px",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: activeTab === key ? "var(--surface)" : "transparent",
                  color: activeTab === key ? "var(--primary)" : "var(--foreground-muted)",
                  boxShadow: activeTab === key ? "var(--shadow-xs)" : "none",
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {activeTab === "student" && <StudentLoginFormComp />}
          {activeTab === "staff" && <StaffLoginFormComp />}
          {activeTab === "admin" && <AdminLoginFormComp />}

          {/* Direct Portal Links */}
          <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "center", gap: "0.875rem", fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
            <Link href="/student/login" style={{ color: "var(--foreground-muted)", textDecoration: "none" }}>
              Student Portal
            </Link>
            <span>•</span>
            <Link href="/staff/login" style={{ color: "var(--foreground-muted)", textDecoration: "none" }}>
              Staff Portal
            </Link>
            <span>•</span>
            <Link href="/admin/login" style={{ color: "var(--foreground-muted)", textDecoration: "none" }}>
              Admin Console
            </Link>
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
