"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Upload, X, AlertCircle, Info } from "lucide-react";
import { studentsApi } from "@/lib/api/students";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isClearancePeriodActive?: boolean;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onSuccess,
  isClearancePeriodActive = true,
}: DocumentUploadModalProps) {

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The backend stamps the student's signature onto the Clearance Form and rejects uploads without one
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => {
      const res = await studentsApi.getMe();
      return res.data.data;
    },
    enabled: isOpen,
  });
  const hasSignature = Boolean(
    profile?.signature_uploaded || profile?.signature_url || profile?.signature?.processed_url || profile?.signature?.url
  );

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are supported. Please select a valid PDF.");
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError("File size must not exceed 10MB.");
        return;
      }
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file to upload.");
      return;
    }
    if (!isClearancePeriodActive) {
      setError("Clearance submission is currently closed by the university administration.");
      return;
    }
    if (!hasSignature) {
      setError("Please upload your signature in your profile before submitting your Clearance Form.");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      await studentsApi.uploadDocument(file);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Failed to upload document. Please verify your file and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Upload Clearance Form</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.125rem" }}>
              Submit your official university clearance form for administrative approval
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="dialog-body">
          {/* Pre-upload Checklist Notice */}
          <div className="alert alert-info" style={{ marginBottom: "1rem", fontSize: "0.8125rem", padding: "0.75rem" }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Pre-submission Checklist:</span>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.4 }}>
                <li>Ensure this is your official, current session clearance form.</li>
                <li>Verify your Matric/Reg number and student details are accurate.</li>
                <li>The PDF must be clear, complete, and unencrypted.</li>
                <li>Your profile signature and today&apos;s date will be stamped on the form automatically.</li>
              </ul>
            </div>
          </div>

          {/* Clearance Period check notice */}
          {!isClearancePeriodActive && (
            <div className="alert alert-warning" style={{ marginBottom: "1rem", fontSize: "0.8125rem" }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>Clearance submission is currently closed. Contact admin for assistance.</span>
            </div>
          )}

          {/* Missing signature notice */}
          {!profileLoading && !hasSignature && (
            <div className="alert alert-warning" style={{ marginBottom: "1rem", fontSize: "0.8125rem" }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>
                You need to upload your signature before submitting.{" "}
                <Link href="/student/profile" onClick={onClose} style={{ fontWeight: 600, color: "inherit" }}>
                  Go to profile
                </Link>
              </span>
            </div>
          )}

          {/* File Upload Box */}
          <div className="form-group">
            <label className="form-label">Upload PDF Document</label>
            <div
              className="dropzone"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem 1rem",
              }}
              onClick={() => document.getElementById("pdf-file-input")?.click()}
            >
              <input
                id="pdf-file-input"
                type="file"
                accept="application/pdf,.pdf"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
              <Upload size={24} color="var(--primary)" style={{ marginBottom: "0.5rem" }} />
              {file ? (
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--foreground)" }}>{file.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", display: "block" }}>
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--primary)" }}>Select PDF file</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", display: "block", marginTop: "0.25rem" }}>
                    Maximum file size: 10MB
                  </span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ fontSize: "0.8125rem", padding: "0.5rem 0.75rem" }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={isUploading || !file || !isClearancePeriodActive || profileLoading || !hasSignature}
          >
            {isUploading ? "Uploading & Processing..." : "Submit for Signing"}
          </button>
        </div>
      </div>
    </div>
  );
}
