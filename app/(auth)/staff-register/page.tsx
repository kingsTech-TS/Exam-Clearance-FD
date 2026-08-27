"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Shield, AlertCircle, CheckCircle2, Eye, EyeOff, Info } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { FACULTY_LIST, getDepartmentsForFaculty } from "@/lib/constants/faculties";
import { staffRegisterSchema, type StaffRegisterForm } from "@/lib/validations/auth";

export default function StaffRegisterPage() {
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StaffRegisterForm>({
    resolver: zodResolver(staffRegisterSchema),
  });

  const subRole = watch("sub_role");
  const departments = getDepartmentsForFaculty(selectedFaculty);
  const showDepartment = subRole === "HOD";

  const onSubmit = async (data: StaffRegisterForm) => {
    setError("");
    try {
      await authApi.staffRegister({
        full_name: data.full_name,
        staff_id: data.staff_id,
        sub_role: data.sub_role,
        faculty: data.faculty,
        department: showDepartment ? data.department : undefined,
        password: data.password,
        confirm_password: data.confirm_password,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Registration failed. Please try again.");
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "var(--background)" }}>
        <div className="card" style={{ maxWidth: "440px", width: "100%", padding: "2.5rem", textAlign: "center" }}>
          <div style={{ width: "3.5rem", height: "3.5rem", background: "var(--status-success-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            <CheckCircle2 size={24} color="var(--status-success-text)" />
          </div>
          <h2 style={{ marginBottom: "0.75rem" }}>Registration Submitted</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--foreground-muted)", marginBottom: "1.75rem", lineHeight: 1.65 }}>
            Your staff account has been submitted for review. You will be able to sign in once an administrator approves your account. You will be notified by email when your account is approved.
          </p>
          <Link href="/login" className="btn btn-secondary" style={{ display: "inline-flex" }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "500px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "2rem" }}>
          <div style={{ width: "2rem", height: "2rem", background: "var(--primary)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={14} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>EKSU Digital Clearance</span>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 style={{ marginBottom: "0.25rem" }}>Staff Registration</h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
              Register as Bursar, Auditor, or Head of Department
            </p>
          </div>

          <div className="card-body">
            {/* Approval notice */}
            <div className="alert alert-info" style={{ marginBottom: "1.25rem" }}>
              <Info size={15} style={{ flexShrink: 0 }} />
              <span>
                Staff accounts require administrator approval before you can sign in. You will receive an email notification once approved.
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" placeholder="e.g. Dr. Emmanuel Adeyemi" {...register("full_name")} />
                {errors.full_name && <p className="form-error">{errors.full_name.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Staff ID</label>
                <input type="text" className="form-input" placeholder="Your official EKSU Staff ID" {...register("staff_id")} />
                {errors.staff_id && <p className="form-error">{errors.staff_id.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Role / Sub-role</label>
                <select className="form-select" {...register("sub_role")}>
                  <option value="">Select your role</option>
                  <option value="BURSAR">Bursar</option>
                  <option value="AUDITOR">Auditor</option>
                  <option value="HOD">Head of Department (HOD)</option>
                </select>
                {errors.sub_role && <p className="form-error">{errors.sub_role.message}</p>}
                {subRole === "HOD" && (
                  <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
                    HODs must select their assigned department
                  </p>
                )}
                {(subRole === "BURSAR" || subRole === "AUDITOR") && (
                  <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
                    Bursars and Auditors are assigned to a faculty, not a specific department
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Faculty</label>
                <select
                  className="form-select"
                  {...register("faculty")}
                  onChange={(e) => {
                    setValue("faculty", e.target.value);
                    setValue("department", "");
                    setSelectedFaculty(e.target.value);
                  }}
                >
                  <option value="">Select faculty</option>
                  {FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                {errors.faculty && <p className="form-error">{errors.faculty.message}</p>}
              </div>

              {showDepartment && (
                <div className="form-group">
                  <label className="form-label">Department <span style={{ color: "var(--destructive)" }}>*</span></label>
                  <select className="form-select" {...register("department")} disabled={!selectedFaculty}>
                    <option value="">Select department</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <p className="form-error">{errors.department.message}</p>}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPwd ? "text" : "password"} className="form-input" placeholder="Minimum 8 characters" style={{ paddingRight: "2.5rem" }} {...register("password")} />
                  <button type="button" onClick={() => setShowPwd((v) => !v)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", padding: 0 }}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showConfirm ? "text" : "password"} className="form-input" placeholder="Re-enter your password" style={{ paddingRight: "2.5rem" }} {...register("confirm_password")} />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", padding: 0 }}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirm_password && <p className="form-error">{errors.confirm_password.message}</p>}
              </div>

              {error && (
                <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isSubmitting}>
                {isSubmitting ? "Submitting registration…" : "Submit Registration"}
              </button>
            </form>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
