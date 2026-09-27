"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, FileCheck2, GraduationCap, PenTool, Search } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import type { CourseRegistration } from "@/types/course";

type QueueFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export const isAwaitingHod = (r: CourseRegistration) => r.status === "PENDING_HOD" || r.status === "SUBMITTED";
const isApproved = (r: CourseRegistration) =>
  r.status === "COMPLETED" || r.status === "APPROVED" || r.status === "PROCESSING";

interface Props {
  // All of the HOD's registrations except drafts (which the student has not submitted yet)
  registrations: CourseRegistration[];
}

export function HodRegistrationQueue({ registrations }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<QueueFilter>("PENDING");

  const counts = useMemo(
    () => ({
      ALL: registrations.length,
      PENDING: registrations.filter(isAwaitingHod).length,
      APPROVED: registrations.filter(isApproved).length,
      REJECTED: registrations.filter((r) => r.status === "REJECTED").length,
    }),
    [registrations]
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return registrations.filter((r) => {
      if (filter === "PENDING" && !isAwaitingHod(r)) return false;
      if (filter === "APPROVED" && !isApproved(r)) return false;
      if (filter === "REJECTED" && r.status !== "REJECTED") return false;
      if (!term) return true;
      return (
        r.student_name?.toLowerCase().includes(term) ||
        r.student_matric_or_reg?.toLowerCase().includes(term) ||
        r.level?.toLowerCase().includes(term)
      );
    });
  }, [registrations, filter, search]);

  const visible = filtered.slice(0, 10);

  return (
    <div className="card">
      {/* Card Header */}
      <div
        className="card-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}
      >
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileCheck2 size={18} color="var(--primary)" /> Action Items &amp; Registration Queue
          </h3>
          <span style={{ fontSize: "0.78125rem", color: "var(--foreground-muted)", marginTop: "2px", display: "block" }}>
            Showing {visible.length} of {filtered.length} {filtered.length === 1 ? "registration" : "registrations"}
          </span>
        </div>

        <Link
          href="/staff/course-registrations"
          className="btn btn-secondary btn-sm"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
        >
          View All ({registrations.length}) <ArrowRight size={13} />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          padding: "0.875rem 1.25rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--background)",
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "220px", maxWidth: "420px" }}>
          <Search
            size={15}
            style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--foreground-muted)" }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Filter by student, matric, or level..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.25rem", height: "34px", fontSize: "0.8125rem" }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
          {(
            [
              { key: "PENDING", label: `Awaiting You (${counts.PENDING})` },
              { key: "ALL", label: `All (${counts.ALL})` },
              { key: "APPROVED", label: `Approved (${counts.APPROVED})` },
              { key: "REJECTED", label: `Rejected (${counts.REJECTED})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`btn btn-sm ${filter === tab.key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilter(tab.key)}
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.625rem" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      {visible.length === 0 ? (
        <EmptyState
          icon={registrations.length === 0 || filter === "PENDING" ? CheckCircle2 : Search}
          title={
            registrations.length === 0
              ? "No Submissions Yet"
              : filter === "PENDING" && !search
                ? "All Caught Up!"
                : "No matching registrations found"
          }
          description={
            registrations.length === 0
              ? "No student in your department has submitted a course registration yet."
              : filter === "PENDING" && !search
                ? "Every submitted course registration has been reviewed."
                : "No registrations match the selected filter or search term."
          }
          action={
            search ? (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSearch("")}>
                Clear Search
              </button>
            ) : undefined
          }
        />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Matric / Reg No</th>
                <th>Level</th>
                <th>Session &amp; Semester</th>
                <th>Courses &amp; Units</th>
                <th>Status</th>
                <th>Submitted</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((reg) => (
                <tr key={reg.id}>
                  <td data-label="Student Name" style={{ fontWeight: 600, color: "var(--foreground)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div
                        style={{
                          width: "1.875rem",
                          height: "1.875rem",
                          borderRadius: "6px",
                          background: "var(--status-processing-bg)",
                          color: "var(--status-processing-text)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <GraduationCap size={15} />
                      </div>
                      {reg.student_name || "—"}
                    </div>
                  </td>
                  <td data-label="Matric / Reg No">
                    <code
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {reg.student_matric_or_reg || "—"}
                    </code>
                  </td>
                  <td data-label="Level">
                    <span className="badge badge-info">{reg.level}L</span>
                  </td>
                  <td data-label="Session & Semester" style={{ fontSize: "0.8125rem" }}>
                    <div>{reg.session}</div>
                    <div style={{ fontSize: "0.71875rem", color: "var(--foreground-muted)" }}>
                      {reg.semester === "FIRST" ? "1st Semester" : "2nd Semester"}
                    </div>
                  </td>
                  <td data-label="Courses & Units" style={{ fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                    <strong>{reg.courses?.length || 0}</strong> courses &bull;{" "}
                    <strong style={{ color: "var(--primary)" }}>{reg.total_units}</strong> units
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={reg.status} type="registration" />
                  </td>
                  <td data-label="Submitted" style={{ color: "var(--foreground-muted)", fontSize: "0.78125rem", whiteSpace: "nowrap" }}>
                    {reg.submitted_at
                      ? new Date(reg.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td data-label="Action" style={{ textAlign: "right" }}>
                    {isAwaitingHod(reg) ? (
                      <Link
                        href={`/staff/course-registrations/${reg.id}`}
                        className="btn btn-primary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "none", fontWeight: 600 }}
                      >
                        <PenTool size={13} /> Review &amp; Sign
                      </Link>
                    ) : reg.course_form_document_id ? (
                      <Link
                        href={`/staff/documents/${reg.course_form_document_id}`}
                        className="btn btn-outline btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "none" }}
                      >
                        <Eye size={13} /> View Form PDF
                      </Link>
                    ) : (
                      <Link
                        href={`/staff/course-registrations/${reg.id}`}
                        className="btn btn-outline btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "none" }}
                      >
                        <Eye size={13} /> View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
