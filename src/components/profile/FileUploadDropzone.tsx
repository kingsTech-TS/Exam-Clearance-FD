"use client";

import React, { useRef, useState, useEffect } from "react";
import { Upload, X, Check, Image as ImageIcon, AlertCircle } from "lucide-react";

interface FileUploadDropzoneProps {
  label: string;
  description?: string;
  accept?: string;
  currentUrl?: string;
  onUpload: (file: File) => Promise<void>;
  maxSizeMb?: number;
  previewType?: "image" | "file";
}

export function FileUploadDropzone({
  label,
  description,
  accept = "image/*",
  currentUrl,
  onUpload,
  maxSizeMb = 5,
  previewType = "image",
}: FileUploadDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUrl) {
      setPreview(currentUrl);
    }
  }, [currentUrl]);

  const handleFileChange = (file: File) => {
    setError(null);
    setSuccess(false);

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File size must not exceed ${maxSizeMb}MB`);
      return;
    }

    setSelectedFile(file);
    if (previewType === "image" && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    try {
      await onUpload(selectedFile);
      setSuccess(true);
      setSelectedFile(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <div>
          <h4 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{label}</h4>
          {description && <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.125rem" }}>{description}</p>}
        </div>
        {(currentUrl || preview) && (
          <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <Check size={12} /> Ready
          </span>
        )}
      </div>

      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "140px",
          position: "relative",
          cursor: "pointer",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={(e) => e.target.files && e.target.files[0] && handleFileChange(e.target.files[0])}
        />

        {preview ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", padding: "0.5rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={label}
              style={{
                maxHeight: "90px",
                maxWidth: "100%",
                objectFit: "contain",
                borderRadius: "4px",
                border: "1px solid var(--border)",
                background: "#fafafa",
              }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
              Click or drag to replace
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem", textAlign: "center" }}>
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                background: "var(--surface-sunken)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--foreground-muted)",
              }}
            >
              <Upload size={18} />
            </div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 500 }}>
              Drag &amp; drop or <span style={{ color: "var(--primary)" }}>browse file</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
              Max size: {maxSizeMb}MB
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.5rem", color: "var(--status-rejected-text)", fontSize: "0.75rem" }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {selectedFile && (
        <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
            {selectedFile.name}
          </span>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSelectedFile(null);
                setPreview(currentUrl || null);
              }}
            >
              <X size={13} />
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleUploadSubmit}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
