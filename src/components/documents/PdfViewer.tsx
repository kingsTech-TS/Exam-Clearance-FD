"use client";

import React, { useEffect, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download, FileText } from "lucide-react";

interface PdfViewerProps {
  url?: string;
  title?: string;
  onDownload?: () => void;
  canDownload?: boolean;
  // Viewer height when not fullscreen; pass "100%" when the parent has a fixed height (e.g. a modal)
  height?: string;
}

// Max page width at 100% zoom, so the PDF doesn't stretch edge-to-edge on wide screens
const BASE_PAGE_WIDTH = 900;
const DEFAULT_HEIGHT = "calc(100vh - 11rem)";

export function PdfViewer({ url, title = "Document Preview", onDownload, canDownload = false, height = DEFAULT_HEIGHT }: PdfViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  // Allow Esc to leave fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  if (!url) {
    return (
      <div
        className="card"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height,
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

  const toolbarButton: React.CSSProperties = {
    color: "#f8fafc",
    padding: "0.25rem 0.5rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#475569",
        ...(isFullscreen
          ? { position: "fixed", inset: 0, zIndex: 1000, height: "100vh", width: "100vw", borderRadius: 0, border: "none" }
          : { height, minHeight: "520px", width: "100%" }),
      }}
    >
      {/* Top Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          padding: "0.5rem 0.75rem",
          background: "#1e293b",
          color: "#f8fafc",
          borderBottom: "1px solid #0f172a",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0, flex: 1 }}>
          <FileText size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
          <span
            title={title}
            style={{ fontSize: "0.8125rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {title}
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexShrink: 0 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleZoomOut} disabled={zoom <= 50} style={toolbarButton} title="Zoom Out">
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleResetZoom}
            style={{ ...toolbarButton, fontSize: "0.75rem", minWidth: "3.25rem", fontVariantNumeric: "tabular-nums" }}
            title="Reset Zoom"
          >
            {zoom}%
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleZoomIn} disabled={zoom >= 200} style={toolbarButton} title="Zoom In">
            <ZoomIn size={15} />
          </button>

          <div style={{ width: "1px", height: "16px", background: "#475569", margin: "0 0.25rem" }} />

          {canDownload && onDownload && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onDownload}
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.625rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
            >
              <Download size={13} /> Download
            </button>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={toolbarButton}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* PDF Frame Container — block layout with auto margins so a zoomed page scrolls on both sides */}
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "0.75rem" }}>
        <div
          style={{
            // 100% = fit to the viewer (capped at BASE_PAGE_WIDTH); zoom scales from there
            width: `calc(min(100%, ${BASE_PAGE_WIDTH}px) * ${zoom / 100})`,
            height: "100%",
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: "4px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            overflow: "hidden",
            transition: "width 0.15s ease-out",
          }}
        >
          <iframe
            src={`${url}#toolbar=0&navpanes=0&view=FitH`}
            style={{ display: "block", width: "100%", height: "100%", border: "none" }}
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
