"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Lock, Check, AlertCircle } from "lucide-react";
import { studentsApi } from "@/lib/api/students";

export default function StudentSettingsPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<{ full_name: string; email: string }>();

  const onSubmit = async (data: { full_name: string; email: string }) => {
    setError(null);
    setSuccess(false);
    try {
      await studentsApi.updateMe(data);
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Failed to update profile settings.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "600px" }}>
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Account Settings</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          Update your contact information and preferences
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Personal Information</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter full name"
                {...register("full_name")}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter email address"
                {...register("email")}
              />
            </div>

            {error && (
              <div className="alert alert-error" style={{ fontSize: "0.8125rem" }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" style={{ fontSize: "0.8125rem" }}>
                <Check size={14} style={{ flexShrink: 0 }} />
                Account information updated successfully.
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
