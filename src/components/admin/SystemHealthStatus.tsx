"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle, RefreshCw, Server, Database, Cloud, Image as ImageIcon } from "lucide-react";
import { adminApi } from "@/lib/api/admin";

export function SystemHealthStatus() {
  const { data: health, isLoading, refetch } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const res = await adminApi.getHealth();
      return res.data.data;
    },
    refetchInterval: 60000,
  });

  const services = [
    {
      name: "FastAPI Backend",
      icon: Server,
      status: health?.api?.status || "healthy",
      latency: health?.api?.latency_ms,
    },
    {
      name: "MongoDB Database",
      icon: Database,
      status: health?.mongodb?.status || "healthy",
      latency: health?.mongodb?.latency_ms,
    },
    {
      name: "Amazon S3 Storage",
      icon: Cloud,
      status: health?.s3?.status || "healthy",
      latency: health?.s3?.latency_ms,
    },
    {
      name: "Cloudinary CDN",
      icon: ImageIcon,
      status: health?.cloudinary?.status || "healthy",
      latency: health?.cloudinary?.latency_ms,
    },
  ];

  return (
    <div className="card">
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>System Services Health</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", margin: "0.125rem 0 0" }}>
            Real-time infrastructure connectivity monitors
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => refetch()}
          title="Refresh Status"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="card-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {services.map((svc) => {
            const isHealthy = svc.status === "healthy";
            const Icon = svc.icon;

            return (
              <div
                key={svc.name}
                style={{
                  padding: "0.875rem 1rem",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: isHealthy ? "var(--status-success-bg)" : "var(--status-error-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <Icon size={16} color={isHealthy ? "var(--status-success-text)" : "var(--status-error-text)"} />
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)" }}>{svc.name}</div>
                    {svc.latency && (
                      <div style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)" }}>{svc.latency}ms latency</div>
                    )}
                  </div>
                </div>

                <span
                  className={`badge ${isHealthy ? "badge-success" : "badge-error"}`}
                  style={{ textTransform: "capitalize", fontSize: "0.6875rem" }}
                >
                  {svc.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
