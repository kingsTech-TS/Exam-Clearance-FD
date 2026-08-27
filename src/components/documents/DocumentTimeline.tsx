"use client";

import React from "react";
import type { DocumentEvent } from "@/types/document";
import { Clock } from "lucide-react";

interface DocumentTimelineProps {
  events: DocumentEvent[];
}

export function DocumentTimeline({ events }: DocumentTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="card" style={{ padding: "1.25rem" }}>
        <h4 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.5rem" }}>Audit History</h4>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>No event history recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <h4 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "1rem", color: "var(--foreground)" }}>
        Audit History
      </h4>

      <div className="timeline">
        {events.map((evt, idx) => {
          const dateObj = new Date(evt.timestamp);
          const formattedDate = dateObj.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const formattedTime = dateObj.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={evt.id || idx} className="timeline-item">
              <div className="timeline-dot completed" />
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground)" }}>
                    {evt.action}
                  </span>
                  <span style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)" }}>
                    {formattedDate}, {formattedTime}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.125rem" }}>
                  {evt.actor_name} ({evt.actor_role})
                </div>
                {evt.description && (
                  <p style={{ fontSize: "0.75rem", color: "var(--foreground)", marginTop: "0.25rem", background: "var(--background)", padding: "0.375rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}>
                    {evt.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
