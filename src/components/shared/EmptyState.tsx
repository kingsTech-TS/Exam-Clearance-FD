"use client";
import React from "react";
import type { LucideIcon } from "lucide-react";
import { FileX } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return <FileX size={22} color="var(--foreground-subtle)" />;
    if (React.isValidElement(icon)) return icon;
    const IconComp = icon as LucideIcon;
    return <IconComp size={22} color="var(--foreground-subtle)" />;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        textAlign: "center",
        color: "var(--foreground-muted)",
      }}
    >
      <div
        style={{
          width: "3rem",
          height: "3rem",
          background: "var(--background)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        {renderIcon()}
      </div>
      <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.375rem" }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: "0.8125rem", maxWidth: "28rem" }}>{description}</p>
      )}
      {action && <div style={{ marginTop: "1.25rem" }}>{action}</div>}
    </div>
  );
}

