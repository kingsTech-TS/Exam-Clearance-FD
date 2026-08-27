"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, CheckCircle2, AlertCircle, Clock, Edit2 } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { Semester, ClearancePeriodStatus, ClearancePeriodCreateOrUpdateRequest } from "@/types/admin";

export function ClearancePeriodCard() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [session, setSession] = useState("2025/2026");
  const [semester, setSemester] = useState<Semester>("FIRST");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ClearancePeriodStatus>("ACTIVE");
  const [error, setError] = useState<string | null>(null);

  const { data: period, isLoading } = useQuery({
    queryKey: ["admin-clearance-period"],
    queryFn: async () => {
      const res = await adminApi.getClearancePeriod();
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ClearancePeriodCreateOrUpdateRequest) =>
      adminApi.updateClearancePeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clearance-period"] });
      setIsEditing(false);
      setError(null);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string; message?: string } } };
      setError(e?.response?.data?.detail || e?.response?.data?.message || "Failed to update clearance period.");
    },
  });

  const handleStartEdit = () => {
    if (period) {
      setSession(period.session || "2025/2026");
      setSemester(period.semester || "FIRST");
      setStartDate(period.start_date ? period.start_date.split("T")[0] : "");
      setEndDate(period.end_date ? period.end_date.split("T")[0] : "");
      setStatus(period.status || (period.is_active ? "ACTIVE" : "INACTIVE"));
    } else {
      const today = new Date().toISOString().split("T")[0];
      const nextMonth = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      setStartDate(today);
      setEndDate(nextMonth);
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!session.trim()) {
      setError("Please specify the academic session (e.g. 2025/2026).");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please specify both start and end dates.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }

    updateMutation.mutate({
      session: session.trim(),
      semester,
      start_date: startDate,
      end_date: endDate,
      status,
    });
  };

  const isPeriodOpen = period?.status === "ACTIVE" || period?.is_active === true;

  return (
    <div className="card">
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Calendar size={18} color="var(--primary)" />
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Clearance Submission Window</h3>
        </div>
        {!isEditing && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleStartEdit}>
            <Edit2 size={13} /> Configure Window
          </button>
        )}
      </div>

      <div className="card-body">
        {isEditing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Session and Semester row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Academic Session</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2025/2026"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Semester</label>
                <select
                  className="form-select"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as Semester)}
                >
                  <option value="FIRST">First Semester</option>
                  <option value="SECOND">Second Semester</option>
                </select>
              </div>
            </div>

            {/* Dates row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Submission Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Submission End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Status toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                id="period-active-toggle"
                checked={status === "ACTIVE"}
                onChange={(e) => setStatus(e.target.checked ? "ACTIVE" : "INACTIVE")}
                style={{ width: "16px", height: "16px" }}
              />
              <label htmlFor="period-active-toggle" style={{ fontSize: "0.8125rem", cursor: "pointer", fontWeight: 500 }}>
                Submission Window Active (Open for student clearance submissions)
              </label>
            </div>

            {error && (
              <div className="alert alert-error" style={{ fontSize: "0.8125rem", padding: "0.5rem 0.75rem" }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Window"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                {period?.session && (
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, background: "var(--primary-light)", color: "var(--primary)", padding: "0.15rem 0.5rem", borderRadius: "4px" }}>
                    {period.session} Session &bull; {period.semester === "FIRST" ? "1st" : "2nd"} Sem.
                  </span>
                )}
                <strong style={{ fontSize: "0.9375rem" }}>
                  {period?.start_date && period?.end_date
                    ? `${new Date(period.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} — ${new Date(period.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                    : "Window Not Configured"}
                </strong>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", margin: "0.25rem 0 0" }}>
                {isPeriodOpen
                  ? "Students can currently submit clearance forms online for Bursar and Auditor review."
                  : "Clearance submissions are currently closed for all students."}
              </p>
            </div>

            <span className={`badge ${isPeriodOpen ? "badge-success" : "badge-error"}`}>
              {isPeriodOpen ? "Submissions Open" : "Submissions Closed"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

