"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, UserX, UserCheck, Filter, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin";
import { FACULTY_LIST, getDepartmentsForFaculty, LEVEL_LIST } from "@/lib/constants/faculties";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import type { AdminStudentRow } from "@/types/admin";

export default function AdminStudentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const departments = getDepartmentsForFaculty(faculty);

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["admin-students-list", search, faculty, department, level, page],
    queryFn: async () => {
      const res = await adminApi.getStudents({
        search: search || undefined,
        faculty: faculty || undefined,
        department: department || undefined,
        level: level || undefined,
        page,
        size: pageSize,
      });
      return res.data.data;
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, suspend }: { id: string; suspend: boolean }) =>
      adminApi.suspendStudent(id, suspend),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students-list"] });
    },
  });

  const students = studentsData?.items || [];
  const total = studentsData?.total || 0;
  const totalPages = studentsData?.pages || Math.ceil(total / pageSize) || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Student Directory</h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
          Browse, filter, inspect profiles, and manage student account statuses
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 120px", gap: "0.75rem" }} className="filter-grid">
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--foreground-muted)" }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by student name, matric, or reg number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: "2.25rem", height: "36px" }}
            />
          </div>

          {/* Faculty */}
          <select
            className="form-select"
            value={faculty}
            onChange={(e) => {
              setFaculty(e.target.value);
              setDepartment("");
              setPage(1);
            }}
            style={{ height: "36px" }}
          >
            <option value="">All Faculties</option>
            {FACULTY_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>

          {/* Department */}
          <select
            className="form-select"
            value={department}
            disabled={!faculty}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            style={{ height: "36px" }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Level */}
          <select
            className="form-select"
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPage(1);
            }}
            style={{ height: "36px" }}
          >
            <option value="">All Levels</option>
            {LEVEL_LIST.map((l) => <option key={l} value={l}>{l}L</option>)}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="card">
        {isLoading ? (
          <LoadingSkeleton rows={6} cols={6} />
        ) : students.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No students found"
            description="No registered student accounts match your filter criteria."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Matric / Reg No</th>
                  <th>Faculty &amp; Dept</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id}>
                    <td data-label="Student Name" style={{ fontWeight: 600 }}>
                      {st.full_name}
                    </td>
                    <td data-label="Matric / Reg No" style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                      {st.matric_number || st.registration_number || "—"}
                    </td>
                    <td data-label="Faculty & Dept" style={{ fontSize: "0.8125rem" }}>
                      {st.faculty} &bull; {st.department}
                    </td>
                    <td data-label="Level" style={{ fontSize: "0.8125rem" }}>
                      {st.level}L
                    </td>
                    <td data-label="Status">
                      <span className={`badge ${st.is_suspended ? "badge-error" : "badge-success"}`}>
                        {st.is_suspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td data-label="Actions" style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.375rem" }}>
                        <Link href={`/admin/students/${st.id}`} className="btn btn-secondary btn-sm">
                          <Eye size={13} /> View Profile
                        </Link>
                        <button
                          type="button"
                          className={`btn btn-sm ${st.is_suspended ? "btn-secondary" : "btn-danger"}`}
                          onClick={() => suspendMutation.mutate({ id: st.id, suspend: !st.is_suspended })}
                          disabled={suspendMutation.isPending}
                          title={st.is_suspended ? "Unsuspend account" : "Suspend account"}
                        >
                          {st.is_suspended ? <UserCheck size={13} /> : <UserX size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div
            style={{
              padding: "0.875rem 1.25rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.8125rem",
              color: "var(--foreground-muted)",
            }}
          >
            <span>Showing page {page} of {totalPages} ({total} total students)</span>
            <div style={{ display: "flex", gap: "0.375rem" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .filter-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
