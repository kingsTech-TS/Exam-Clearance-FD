"use client";

import React, { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Download, RefreshCw, FileText } from "lucide-react";

interface PdfViewerProps {
  url?: string;
  title?: string;
  onDownload?: () => void;
  canDownload?: boolean;
}

export function PdfViewer({ url, title = "Document Preview", onDownload, canDownload = false }: PdfViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  if (!url) {
    return (
      <div
        className="card"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: "450px",
          padding: "2rem",
          background: "var(--background)",
          color: "var(--foreground-muted)",
        }}
      >
        <FileText size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
        <h4 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "0.25rem" }}>No document selected</h4>
        <p style={{ fontSize: "0.875rem", textAlign: "center" }}>Preview will appear once a valid document is loaded.</p>
      </div>
    );
  }

  return (
    <div
      className={`card ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        height: isFullscreen ? "100vh" : "100%",
        minHeight: "520px",
        overflow: "hidden",
        background: "#334155",
      }}
    >
      {/* Top Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.625rem 1rem",
          background: "#1e293b",
          color: "#f8fafc",
          borderBottom: "1px solid #0f172a",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FileText size={16} color="#94a3b8" />
          <span style={{ fontSize: "0.8125rem", fontWeight: 500, maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleZoomOut}
            style={{ color: "#f8fafc", padding: "0.25rem 0.5rem" }}
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleResetZoom}
            style={{ color: "#f8fafc", padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
            title="Reset Zoom"
          >
            {zoom}%
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleZoomIn}
            style={{ color: "#f8fafc", padding: "0.25rem 0.5rem" }}
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>

          <div style={{ width: "1px", height: "16px", background: "#475569", margin: "0 0.25rem" }} />

          {canDownload && onDownload && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onDownload}
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.625rem" }}
            >
              <Download size={13} /> Download
            </button>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{ color: "#f8fafc", padding: "0.25rem 0.5rem" }}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* PDF Frame Container */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "1rem",
          background: "#475569",
        }}
      >
        <div
          style={{
            width: `${zoom}%`,
            maxWidth: isFullscreen ? "100%" : "1000px",
            height: "100%",
            minHeight: "600px",
            transition: "width 0.15s ease-out",
            background: "#ffffff",
            borderRadius: "4px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          }}
        >
          <iframe
            src={`${url}#toolbar=0&navpanes=0`}
            style={{ width: "100%", height: "100%", minHeight: "600px", border: "none", borderRadius: "4px" }}
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
