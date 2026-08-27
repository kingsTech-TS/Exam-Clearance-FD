"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { studentsApi } from "@/lib/api/students";
import { FileUploadDropzone } from "@/components/profile/FileUploadDropzone";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

export default function StudentProfilePage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => {
      const res = await studentsApi.getMe();
      return res.data.data;
    },
  });

  const handlePassportUpload = async (file: File) => {
    await studentsApi.uploadPassport(file);
    queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
  };

  const handleSignatureUpload = async (file: File) => {
    await studentsApi.uploadSignature(file);
    queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
  };

  if (isLoading) return <PageSkeleton />;

  const passportUrl = profile?.passport_url || profile?.passport?.url;
  const signatureUrl = profile?.signature_url || profile?.signature?.processed_url || profile?.signature?.url;
  const hasPassport = Boolean(profile?.passport_uploaded || passportUrl);
  const hasSignature = Boolean(profile?.signature_uploaded || signatureUrl);
  const isProfileComplete = Boolean(
    profile?.profile_complete ||
    profile?.profile_completed ||
    (hasPassport && hasSignature)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "900px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Student Profile &amp; Credentials</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          Manage your verified credentials and digital signing assets
        </p>
      </div>

      {/* Setup Status Banner */}
      <div
        className="card"
        style={{
          padding: "1.25rem",
          background: isProfileComplete ? "var(--status-success-bg)" : "var(--status-pending-bg)",
          borderColor: isProfileComplete ? "var(--status-success-border)" : "var(--status-pending-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {isProfileComplete ? (
            <CheckCircle2 size={22} color="var(--status-success-text)" />
          ) : (
            <AlertCircle size={22} color="var(--status-pending-text)" />
          )}
          <div>
            <h4
              style={{
                fontWeight: 600,
                color: isProfileComplete ? "var(--status-success-text)" : "var(--status-pending-text)",
                margin: 0,
              }}
            >
              {isProfileComplete ? "Profile Setup Complete" : "Profile Setup Incomplete"}
            </h4>
            <p
              style={{
                fontSize: "0.8125rem",
                color: isProfileComplete ? "var(--status-success-text)" : "var(--status-pending-text)",
                margin: "0.25rem 0 0",
              }}
            >
              {isProfileComplete
                ? "Your passport photograph and digital signature are active. You can submit forms for signing."
                : "Both passport photograph and signature must be uploaded before submitting clearance forms."}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <span
            className={`badge ${hasPassport ? "badge-success" : "badge-pending"}`}
          >
            Passport: {hasPassport ? "Ready" : "Missing"}
          </span>
          <span
            className={`badge ${hasSignature ? "badge-success" : "badge-pending"}`}
          >
            Signature: {hasSignature ? "Ready" : "Missing"}
          </span>
        </div>
      </div>

      {/* Upload Dropzones Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="profile-uploads-grid">
        {/* Passport Dropzone */}
        <FileUploadDropzone
          label="Passport Photograph"
          description="Clear frontal portrait photo with white or light background."
          accept="image/png,image/jpeg,image/jpg"
          currentUrl={passportUrl}
          onUpload={handlePassportUpload}
          maxSizeMb={3}
        />

        {/* Signature Dropzone */}
        <div>
          <FileUploadDropzone
            label="Digital Signature"
            description="Sign on a plain white paper and upload a clear photo or scan."
            accept="image/png,image/jpeg,image/jpg"
            currentUrl={signatureUrl}
            onUpload={handleSignatureUpload}
            maxSizeMb={3}
          />
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: "var(--foreground-muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem",
            }}
          >
            <Sparkles size={14} color="var(--primary)" />
            <span>Signatures are automatically processed with transparent background removal for PDF stamping.</span>
          </div>
        </div>
      </div>

      {/* Academic Details Card */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Academic &amp; Student Information</h3>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)", display: "block" }}>Full Name</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--foreground)" }}>{profile?.full_name || "—"}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)", display: "block" }}>Matric / Registration Number</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--foreground)" }}>
                {profile?.matric_number || profile?.registration_number || "—"}
              </span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)", display: "block" }}>Email Address</span>
              <span style={{ fontWeight: 500, fontSize: "0.9375rem", color: "var(--foreground)" }}>{profile?.email || "—"}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)", display: "block" }}>Faculty</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--foreground)" }}>{profile?.faculty || "—"}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)", display: "block" }}>Department</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--foreground)" }}>{profile?.department || "—"}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)", display: "block" }}>Current Level</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--foreground)" }}>{profile?.level || "100"} Level</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
