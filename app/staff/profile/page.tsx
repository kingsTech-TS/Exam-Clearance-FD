"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle, Sparkles, Stamp, User } from "lucide-react";
import { staffApi } from "@/lib/api/staff";
import { FileUploadDropzone } from "@/components/profile/FileUploadDropzone";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import type { StaffSubRole } from "@/types/user";

export default function StaffProfilePage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["staff-profile"],
    queryFn: async () => {
      const res = await staffApi.getMe();
      return res.data.data;
    },
  });

  const handlePassportUpload = async (file: File) => {
    await staffApi.uploadPassport(file);
    queryClient.invalidateQueries({ queryKey: ["staff-profile"] });
    queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });
  };

  const handleSignatureUpload = async (file: File) => {
    await staffApi.uploadSignature(file);
    queryClient.invalidateQueries({ queryKey: ["staff-profile"] });
    queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });
  };

  const handleSealUpload = async (file: File) => {
    await staffApi.uploadSeal(file);
    queryClient.invalidateQueries({ queryKey: ["staff-profile"] });
    queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });
  };

  if (isLoading) return <PageSkeleton />;

  const subRole: StaffSubRole = profile?.sub_role || "BURSAR";
  const isHOD = subRole === "HOD";
  const passportUrl = profile?.passport_url || profile?.passport?.url;
  const signatureUrl = profile?.signature_url || profile?.signature?.processed_url || profile?.signature?.url;
  const sealUrl = profile?.seal_url || profile?.seal?.url;

  const hasPassport = Boolean(profile?.passport_uploaded || passportUrl);
  const hasSignature = Boolean(profile?.signature_uploaded || signatureUrl);
  const hasSeal = Boolean(profile?.seal_uploaded || sealUrl);

  const isProfileComplete = Boolean(
    profile?.profile_complete ||
    profile?.profile_completed ||
    (hasSignature && (isHOD || hasSeal))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "900px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Staff Signing Profile &amp; Credentials</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          Manage your verified credentials, transparent signature, and official seal
        </p>
      </div>

      {/* Profile Completion Status */}
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
              {isProfileComplete ? "Signing Credentials Active" : "Incomplete Signing Credentials"}
            </h4>
            <p
              style={{
                fontSize: "0.8125rem",
                color: isProfileComplete ? "var(--status-success-text)" : "var(--status-pending-text)",
                margin: "0.25rem 0 0",
              }}
            >
              {isProfileComplete
                ? "All required signing assets are verified and ready for digital document stamping."
                : `Please upload your digital signature${!isHOD ? " and official seal" : ""} before signing student forms.`}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <span className={`badge ${hasPassport ? "badge-success" : "badge-pending"}`}>
            Passport: {hasPassport ? "Ready" : "Missing"}
          </span>
          <span className={`badge ${hasSignature ? "badge-success" : "badge-pending"}`}>
            Signature: {hasSignature ? "Ready" : "Missing"}
          </span>
          {!isHOD && (
            <span className={`badge ${hasSeal ? "badge-success" : "badge-pending"}`}>
              Official Seal: {hasSeal ? "Ready" : "Missing"}
            </span>
          )}
        </div>
      </div>

      {/* Upload Dropzones Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {/* Passport Dropzone */}
        <FileUploadDropzone
          label="Staff Passport Photo"
          description="Identification portrait with light background."
          accept="image/png,image/jpeg,image/jpg"
          currentUrl={passportUrl}
          onUpload={handlePassportUpload}
          maxSizeMb={3}
        />

        {/* Signature Dropzone */}
        <div>
          <FileUploadDropzone
            label="Digital Signature"
            description="Official signature for digital document stamping."
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

        {/* Seal Dropzone (Bursar and Auditor only) */}
        {!isHOD && (
          <div>
            <FileUploadDropzone
              label="Official Office Seal"
              description="High-resolution stamp or seal image for formal clearance authentication."
              accept="image/png,image/jpeg,image/jpg"
              currentUrl={sealUrl}
              onUpload={handleSealUpload}
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
              <Stamp size={14} color="var(--primary)" />
              <span>The official seal is stamped alongside your signature on completed clearance forms.</span>
            </div>
          </div>
        )}
      </div>

      {/* Staff Details Card */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Staff &amp; Appointment Details</h3>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)", display: "block" }}>Full Name</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--foreground)" }}>{profile?.full_name || "—"}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)", display: "block" }}>Staff ID</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--foreground)" }}>{profile?.staff_id || "—"}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)", display: "block" }}>Sub-Role</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--primary)" }}>{profile?.sub_role || "—"}</span>
            </div>
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)", display: "block" }}>Faculty</span>
              <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--foreground)" }}>{profile?.faculty || "—"}</span>
            </div>
            {profile?.department && (
              <div>
                <span className="form-label" style={{ color: "var(--foreground-muted)", display: "block" }}>Department</span>
                <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--foreground)" }}>{profile?.department}</span>
              </div>
            )}
            <div>
              <span className="form-label" style={{ color: "var(--foreground-muted)", display: "block" }}>Account Status</span>
              <span className={`badge ${profile?.approval_status === "APPROVED" ? "badge-success" : "badge-pending"}`}>
                {profile?.approval_status || "PENDING"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
