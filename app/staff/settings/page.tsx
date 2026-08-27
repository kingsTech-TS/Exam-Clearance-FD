"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Check, AlertCircle } from "lucide-react";
import { staffApi } from "@/lib/api/staff";

export default function StaffSettingsPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ full_name: string }>();

  const onSubmit = async (data: { full_name: string }) => {
    setError(null);
    setSuccess(false);
    try {
      await staffApi.updateMe(data);
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Failed to update staff settings.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "600px" }}>
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Staff Settings</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          Update your staff profile details
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Profile Details</h3>
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

            {error && (
              <div className="alert alert-error" style={{ fontSize: "0.8125rem" }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" style={{ fontSize: "0.8125rem" }}>
                <Check size={14} style={{ flexShrink: 0 }} />
                Staff details updated successfully.
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
