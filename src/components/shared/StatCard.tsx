"use client";
import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label?: string;
  title?: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon | React.ReactNode;
  delta?: string;
  deltaType?: "up" | "down" | "neutral";
  variant?: "default" | "warning" | "danger" | "success" | "info" | string;
  href?: string;
  onClick?: () => void;
}

export function StatCard({
  label,
  title,
  value,
  subtitle,
  icon,
  delta,
  deltaType,
  variant,
  href,
  onClick,
}: StatCardProps) {
  const displayLabel = label || title || "";
  const Wrapper = href ? "a" : "div";

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComp = icon as LucideIcon;
    return <IconComp size={18} color="var(--primary)" />;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          bg: "var(--status-pending-bg)",
          color: "var(--status-pending-text)",
          border: "1px solid var(--status-pending-border)",
        };
      case "danger":
        return {
          bg: "var(--status-error-bg)",
          color: "var(--status-error-text)",
          border: "1px solid var(--status-error-border)",
        };
      case "success":
        return {
          bg: "var(--status-success-bg)",
          color: "var(--status-success-text)",
          border: "1px solid var(--status-success-border)",
        };
      default:
        return {
          bg: "var(--primary-light)",
          color: "var(--primary)",
          border: "none",
        };
    }
  };

  const iconStyle = getVariantStyles();

  return (
    <Wrapper
      href={href}
      onClick={onClick}
      className={`stat-card${href || onClick ? " cursor-pointer hover:border-slate-300 transition-colors" : ""}`}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div className="stat-label">{displayLabel}</div>
          <div className="stat-value" style={{ marginTop: "0.375rem" }}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {subtitle && (
            <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
              {subtitle}
            </div>
          )}
          {delta && (
            <div
              className="stat-delta"
              style={{
                color:
                  deltaType === "up"
                    ? "var(--status-success-text)"
                    : deltaType === "down"
                    ? "var(--status-error-text)"
                    : "var(--foreground-muted)",
              }}
            >
              {delta}
            </div>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: "2.25rem",
              height: "2.25rem",
              background: iconStyle.bg,
              color: iconStyle.color,
              border: iconStyle.border,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {renderIcon()}
          </div>
        )}
      </div>
    </Wrapper>
  );
}

