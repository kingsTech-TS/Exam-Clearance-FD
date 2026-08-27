"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, TrendingUp, Clock, CheckCircle2, XCircle, Users, GraduationCap } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { StatCard } from "@/components/shared/StatCard";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await adminApi.getAnalytics();
      return res.data.data;
    },
  });

  if (isLoading) return <PageSkeleton />;

  const processing = analytics?.document_processing;
  const facultyDist = analytics?.student_by_faculty || [];
  const levelDist = analytics?.student_by_level || [];
  const staffActivity = analytics?.staff_activity || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Institutional Analytics</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          Operational metrics, signing velocities, and faculty completion rates
        </p>
      </div>

      {/* Top Processing Performance Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <StatCard
          label="Clearance Completion Rate"
          value={`${processing?.completion_rate ?? 0}%`}
          icon={CheckCircle2}
          delta="Overall throughput"
          deltaType="up"
        />
        <StatCard
          label="Avg. Time to Bursar Signing"
          value={`${processing?.avg_bursar_hours ?? 0} hrs`}
          icon={Clock}
          delta="Submission to Bursar sign"
          deltaType="neutral"
        />
        <StatCard
          label="Avg. Bursar to Auditor Time"
          value={`${processing?.avg_auditor_hours ?? 0} hrs`}
          icon={Clock}
          delta="Bursar sign to Auditor completion"
          deltaType="neutral"
        />
        <StatCard
          label="Avg. HOD Course Form Time"
          value={`${processing?.avg_hod_hours ?? 0} hrs`}
          icon={Clock}
          delta="Submission to HOD approval"
          deltaType="neutral"
        />
      </div>

      {/* Distribution Grids */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="analytics-grid">
        {/* Student by Faculty */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Students by Faculty</h3>
          </div>
          <div className="card-body" style={{ padding: "1rem 1.25rem" }}>
            {facultyDist.length === 0 ? (
              <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>No faculty distribution data.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {facultyDist.map((item) => (
                  <div key={item.faculty}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 500 }}>{item.faculty}</span>
                      <span style={{ color: "var(--foreground-muted)" }}>{item.count} students</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "var(--background)", borderRadius: "3px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min((item.count / Math.max(...facultyDist.map((f) => f.count), 1)) * 100, 100)}%`,
                          background: "var(--primary)",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Students by Level */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Students by Academic Level</h3>
          </div>
          <div className="card-body" style={{ padding: "1rem 1.25rem" }}>
            {levelDist.length === 0 ? (
              <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>No level distribution data.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {levelDist.map((item) => (
                  <div key={item.level}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 500 }}>{item.level} Level</span>
                      <span style={{ color: "var(--foreground-muted)" }}>{item.count} students</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "var(--background)", borderRadius: "3px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min((item.count / Math.max(...levelDist.map((l) => l.count), 1)) * 100, 100)}%`,
                          background: "#0284c7",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Staff Reviewer Activity */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Reviewer Processing Activity</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff Reviewer</th>
                  <th>Documents Signed</th>
                  <th>Documents Rejected</th>
                  <th>Total Processed</th>
                </tr>
              </thead>
              <tbody>
                {staffActivity.length > 0 ? (
                  staffActivity.map((staff, idx) => (
                    <tr key={idx}>
                      <td data-label="Staff Reviewer" style={{ fontWeight: 600 }}>
                        {staff.staff_name}
                      </td>
                      <td data-label="Documents Signed">
                        <span className="badge badge-success">{staff.signed} signed</span>
                      </td>
                      <td data-label="Documents Rejected">
                        <span className="badge badge-error">{staff.rejected} rejected</span>
                      </td>
                      <td data-label="Total Processed" style={{ fontWeight: 600 }}>
                        {staff.signed + staff.rejected}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "var(--foreground-muted)", padding: "1.5rem" }}>
                      No staff activity metrics recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .analytics-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
