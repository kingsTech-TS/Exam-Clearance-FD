"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Shield, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { FACULTY_LIST, getDepartmentsForFaculty, LEVEL_LIST } from "@/lib/constants/faculties";
import {
  studentStep1Schema, studentStep2Schema, studentStep3Schema,
  type StudentStep1, type StudentStep2, type StudentStep3,
} from "@/lib/validations/auth";

type IdentifierType = "matric" | "registration";

const STEPS = ["Personal Information", "Academic Details", "Account Security"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="stepper" style={{ marginBottom: "2rem", gap: "0" }}>
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
          <div className="step-item">
            <div
              className={`step-circle ${i < current ? "completed" : i === current ? "active" : "pending"}`}
            >
              {i < current ? <CheckCircle2 size={13} /> : i + 1}
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: i === current ? 600 : 400,
                color: i === current ? "var(--primary)" : i < current ? "var(--foreground)" : "var(--foreground-muted)",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`step-connector ${i < current ? "completed" : ""}`} style={{ flex: 1, margin: "0 0.5rem" }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function StudentRegisterPage() {
  const [step, setStep] = useState(0);
  const [step1Data, setStep1Data] = useState<StudentStep1 | null>(null);
  const [step2Data, setStep2Data] = useState<StudentStep2 | null>(null);
  const [identifierType, setIdentifierType] = useState<IdentifierType>("matric");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const form1 = useForm<StudentStep1>({ resolver: zodResolver(studentStep1Schema), defaultValues: { identifier_type: "matric" } });
  const form2 = useForm<StudentStep2>({ resolver: zodResolver(studentStep2Schema) });
  const form3 = useForm<StudentStep3>({ resolver: zodResolver(studentStep3Schema) });

  const departments = getDepartmentsForFaculty(selectedFaculty);

  const handleStep1 = form1.handleSubmit((data) => {
    setStep1Data(data);
    setStep(1);
  });

  const handleStep2 = form2.handleSubmit((data) => {
    setStep2Data(data);
    setStep(2);
  });

  const handleStep3 = form3.handleSubmit(async (data) => {
    if (!step1Data || !step2Data) return;
    setError("");
    try {
      await authApi.studentRegister({
        full_name: step1Data.full_name,
        email: step1Data.email,
        matric_number: step1Data.identifier_type === "matric" ? step1Data.matric_number : undefined,
        registration_number: step1Data.identifier_type === "registration" ? step1Data.registration_number : undefined,
        faculty: step2Data.faculty,
        department: step2Data.department,
        level: step2Data.level,
        password: data.password,
        confirm_password: data.confirm_password,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Registration failed. Please verify your information.");
    }
  });

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", background: "var(--background)" }}>
        <div className="card" style={{ maxWidth: "440px", width: "100%", padding: "2.5rem", textAlign: "center" }}>
          <div style={{ width: "3.5rem", height: "3.5rem", background: "var(--status-success-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            <CheckCircle2 size={24} color="var(--status-success-text)" />
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>Registration Successful</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--foreground-muted)", marginBottom: "1.75rem", lineHeight: 1.65 }}>
            Your student portal account has been created. You can now sign in with your matric or registration number.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link href="/student/login" className="btn btn-primary" style={{ textDecoration: "none" }}>
              Proceed to Student Sign In
            </Link>
            <Link href="/login" className="btn btn-ghost" style={{ textDecoration: "none" }}>
              Back to Main Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: "560px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ width: "2.25rem", height: "2.25rem", background: "var(--primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={16} color="white" />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.9375rem", display: "block", lineHeight: 1.2 }}>
                EKSU Clearance Portal
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                Student Self-Registration
              </span>
            </div>
          </div>
          <Link href="/student/login" className="btn btn-ghost btn-sm" style={{ textDecoration: "none", fontSize: "0.8125rem" }}>
            <ArrowLeft size={13} /> Sign In
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, marginBottom: "0.25rem" }}>
              Create Student Account
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", margin: 0 }}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>
          <div className="card-body">
            <StepIndicator current={step} />

            {/* Step 1 */}
            {step === 0 && (
              <form onSubmit={handleStep1} noValidate>
                <div className="form-group">
                  <label className="form-label">Full Name (Surname First)</label>
                  <input type="text" className="form-input" placeholder="e.g. ADEBAYO Solomon Oluwaseun" {...form1.register("full_name")} />
                  {form1.formState.errors.full_name && <p className="form-error">{form1.formState.errors.full_name.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Identifier Type</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    {(["matric", "registration"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setIdentifierType(type);
                          form1.setValue("identifier_type", type);
                        }}
                        style={{
                          padding: "0.625rem",
                          borderRadius: "6px",
                          border: identifierType === type ? "2px solid var(--primary)" : "1px solid var(--border)",
                          background: identifierType === type ? "var(--primary-light)" : "var(--surface)",
                          color: identifierType === type ? "var(--primary)" : "var(--foreground-muted)",
                          fontWeight: 500,
                          fontSize: "0.8125rem",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {type === "matric" ? "Matric Number" : "Registration Number"}
                      </button>
                    ))}
                  </div>

                  {identifierType === "matric" ? (
                    <>
                      <input type="text" className="form-input" placeholder="9-digit matric number (e.g. 200601001)" {...form1.register("matric_number")} />
                      {form1.formState.errors.matric_number && <p className="form-error">{form1.formState.errors.matric_number.message}</p>}
                      <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>Must be exactly 9 digits</p>
                    </>
                  ) : (
                    <>
                      <input type="text" className="form-input" placeholder="14-character reg. number (e.g. 200601001EK23)" {...form1.register("registration_number")} />
                      {form1.formState.errors.registration_number && <p className="form-error">{form1.formState.errors.registration_number.message}</p>}
                      <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>12 digits + 2 letters</p>
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="student@example.com" {...form1.register("email")} />
                  {form1.formState.errors.email && <p className="form-error">{form1.formState.errors.email.message}</p>}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                  <button type="submit" className="btn btn-primary">
                    Continue <ChevronRight size={15} />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2 */}
            {step === 1 && (
              <form onSubmit={handleStep2} noValidate>
                <div className="form-group">
                  <label className="form-label">Faculty</label>
                  <select
                    className="form-select"
                    {...form2.register("faculty")}
                    onChange={(e) => {
                      form2.setValue("faculty", e.target.value);
                      form2.setValue("department", "");
                      setSelectedFaculty(e.target.value);
                    }}
                  >
                    <option value="">Select faculty</option>
                    {FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  {form2.formState.errors.faculty && <p className="form-error">{form2.formState.errors.faculty.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-select" {...form2.register("department")} disabled={!selectedFaculty}>
                    <option value="">{selectedFaculty ? "Select department" : "Select a faculty first"}</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {form2.formState.errors.department && <p className="form-error">{form2.formState.errors.department.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Level</label>
                  <select className="form-select" {...form2.register("level")}>
                    <option value="">Select level</option>
                    {LEVEL_LIST.map((l) => <option key={l} value={l}>{l} Level</option>)}
                  </select>
                  {form2.formState.errors.level && <p className="form-error">{form2.formState.errors.level.message}</p>}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>
                    <ChevronLeft size={15} /> Back
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Continue <ChevronRight size={15} />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3 */}
            {step === 2 && (
              <form onSubmit={handleStep3} noValidate>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPwd ? "text" : "password"}
                      className="form-input"
                      placeholder="Create a strong password"
                      style={{ paddingRight: "2.5rem" }}
                      {...form3.register("password")}
                    />
                    <button type="button" onClick={() => setShowPwd((v) => !v)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", padding: 0 }}>
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {form3.formState.errors.password && <p className="form-error">{form3.formState.errors.password.message}</p>}
                  <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
                    Minimum 8 characters
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      className="form-input"
                      placeholder="Re-enter your password"
                      style={{ paddingRight: "2.5rem" }}
                      {...form3.register("confirm_password")}
                    />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", padding: 0 }}>
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {form3.formState.errors.confirm_password && <p className="form-error">{form3.formState.errors.confirm_password.message}</p>}
                </div>

                {error && (
                  <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                    <ChevronLeft size={15} /> Back
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={form3.formState.isSubmitting}>
                    {form3.formState.isSubmitting ? "Creating account…" : "Create Account"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
          Already have a student account?{" "}
          <Link href="/student/login" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            Sign in to Student Portal
          </Link>
        </p>
      </div>
    </div>
  );
}
