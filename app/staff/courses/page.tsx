"use client";
import Link from "next/link";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Plus,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Eye,
  Power,
  Download,
  FileSpreadsheet,
  X,
  Building2,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/authStore";
import { staffApi } from "@/lib/api/staff";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { LEVEL_LIST } from "@/lib/constants/faculties";
import type { Course, CourseCreateRequest, CourseUpdateRequest, CourseBulkResponse, SemesterType } from "@/types/course";

const SESSIONS = ["2025/2026", "2026/2027", "2024/2025"];

export default function StaffCoursesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Filters
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSession, setSelectedSession] = useState("2025/2026");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for Add / Edit
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formUnits, setFormUnits] = useState(3);
  const [formLevel, setFormLevel] = useState("100");
  const [formSemester, setFormSemester] = useState<SemesterType>("FIRST");
  const [formSession, setFormSession] = useState("2025/2026");

  // Bulk Upload states
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkResult, setBulkResult] = useState<CourseBulkResponse | null>(null);

  // Fetch courses
  const { data: courses, isLoading } = useQuery({
    queryKey: ["hod-courses", selectedSession, selectedSemester, selectedLevel, selectedStatus],
    queryFn: async () => {
      const res = await staffApi.getCourses({
        session: selectedSession || undefined,
        semester: selectedSemester || undefined,
        level: selectedLevel || undefined,
        status: selectedStatus || undefined,
      });
      return res.data.data;
    },
    enabled: user?.sub_role === "HOD",
  });

  // Client-side search filter
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!search.trim()) return courses;
    const q = search.toLowerCase().trim();
    return courses.filter(
      (c) =>
        c.course_code.toLowerCase().includes(q) ||
        c.course_title.toLowerCase().includes(q)
    );
  }, [courses, search]);

  // Mutations
  const createCourseMutation = useMutation({
    mutationFn: (data: CourseCreateRequest) => staffApi.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hod-courses"] });
      setIsAddOpen(false);
      resetForm();
      setNotification({ type: "success", text: "Course created successfully." });
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to create course.";
      setNotification({ type: "error", text: msg });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourseUpdateRequest }) =>
      staffApi.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hod-courses"] });
      setEditingCourse(null);
      resetForm();
      setNotification({ type: "success", text: "Course updated successfully." });
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update course.";
      setNotification({ type: "error", text: msg });
    },
  });

  const deactivateCourseMutation = useMutation({
    mutationFn: (id: string) => staffApi.deactivateCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hod-courses"] });
      setNotification({ type: "success", text: "Course status updated." });
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to change course status.";
      setNotification({ type: "error", text: msg });
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (file: File) => staffApi.bulkUploadCourses(file),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["hod-courses"] });
      setBulkResult(res.data.data);
      setNotification({
        type: "success",
        text: `Bulk upload completed: ${res.data.data.success_count} course(s) imported.`,
      });
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Bulk upload failed. Verify your CSV format.";
      setNotification({ type: "error", text: msg });
    },
  });

  const resetForm = () => {
    setFormCode("");
    setFormTitle("");
    setFormUnits(3);
    setFormLevel("100");
    setFormSemester("FIRST");
    setFormSession(selectedSession || "2025/2026");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormCode(course.course_code);
    setFormTitle(course.course_title);
    setFormUnits(course.units);
    setFormLevel(course.level);
    setFormSemester(course.semester);
    setFormSession(course.session);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      updateCourseMutation.mutate({
        id: editingCourse.id,
        data: {
          course_code: formCode,
          course_title: formTitle,
          units: Number(formUnits),
          level: formLevel,
          semester: formSemester,
          session: formSession,
        },
      });
    } else {
      createCourseMutation.mutate({
        course_code: formCode,
        course_title: formTitle,
        units: Number(formUnits),
        level: formLevel,
        semester: formSemester,
        session: formSession,
      });
    }
  };

  const handleDownloadSampleCSV = () => {
    const csvContent =
      "course_code,course_title,units,level,semester,session\n" +
      "CSC 101,Introduction to Computer Science,3,100,FIRST,2025/2026\n" +
      "CSC 102,Introduction to Problem Solving,2,100,SECOND,2025/2026\n" +
      "CSC 201,Data Structures and Algorithms,3,200,FIRST,2025/2026\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "courses_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If user is not HOD
  if (user && user.sub_role !== "HOD") {
    return (
      <EmptyState
        icon={BookOpen}
        title="Departmental Access Restricted"
        description="Course management is restricted to Heads of Department (HOD). As a Bursary or Auditor officer, please manage student clearance documents from your Clearance Review desk."
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>
              Departmental Course Management
            </h1>
            <span className="badge badge-info" style={{ fontSize: "0.6875rem" }}>
              HOD Portal
            </span>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
            Department: <strong>{user?.department || "Department"}</strong> &bull; Configure and manage curriculum courses available for student registration.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              setBulkFile(null);
              setBulkResult(null);
              setIsBulkOpen(true);
            }}
            className="btn btn-outline"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            <FileSpreadsheet size={15} /> Bulk CSV Import
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div
          className={`card ${notification.type === "success" ? "badge-success" : "badge-error"}`}
          style={{
            padding: "0.875rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.875rem",
            borderRadius: "8px",
          }}
        >
          {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--foreground-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search by course code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-sm"
            style={{ paddingLeft: "2.25rem", width: "100%" }}
          />
        </div>

        {/* Level filter */}
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="input input-sm"
          style={{ width: "120px" }}
        >
          <option value="">All Levels</option>
          {LEVEL_LIST.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl} Level</option>
          ))}
        </select>

        {/* Semester filter */}
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="input input-sm"
          style={{ width: "140px" }}
        >
          <option value="">All Semesters</option>
          <option value="FIRST">1st Semester</option>
          <option value="SECOND">2nd Semester</option>
        </select>

        {/* Session filter */}
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="input input-sm"
          style={{ width: "130px" }}
        >
          {SESSIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="input input-sm"
          style={{ width: "120px" }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Course List / Table */}
      {isLoading ? (
        <PageSkeleton />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Courses Found"
          description="No courses match the selected filters. Use 'Add Course' or 'Bulk CSV Import' to register department courses."
        />
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-sunken)" }}>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Code</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Course Title</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Units</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Level</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Semester</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Session</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "0.875rem 1rem", fontWeight: 700, color: "var(--foreground)" }}>
                      {c.course_code}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--foreground)" }}>
                      {c.course_title}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>
                      {c.units}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span className="badge badge-info">{c.level}L</span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span className="badge badge-pending">
                        {c.semester === "FIRST" ? "1st Sem" : "2nd Sem"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--foreground-muted)", fontSize: "0.8125rem" }}>
                      {c.session}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span
                        className={`badge ${c.status === "ACTIVE" ? "badge-success" : "badge-error"}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.375rem" }}>
                        <Link
                          href={`/staff/courses/${c.id}`}
                          className="btn btn-ghost btn-xs"
                          title="View Course Details"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="btn btn-ghost btn-xs"
                          title="Edit Course"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deactivateCourseMutation.mutate(c.id)}
                          className="btn btn-ghost btn-xs"
                          title={c.status === "ACTIVE" ? "Deactivate Course" : "Activate Course"}
                          style={{
                            color: c.status === "ACTIVE" ? "var(--destructive, #ef4444)" : "var(--success, #10b981)",
                          }}
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {(isAddOpen || editingCourse) && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "520px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                {editingCourse ? `Edit Course: ${editingCourse.course_code}` : "Add New Course"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingCourse(null);
                }}
                className="btn btn-ghost btn-xs"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSC 301"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                    Credit Units (1-6) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    required
                    value={formUnits}
                    onChange={(e) => setFormUnits(parseInt(e.target.value) || 1)}
                    className="input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems Architecture"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                    Level
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value)}
                    className="input"
                    style={{ width: "100%" }}
                  >
                    {LEVEL_LIST.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}L</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                    Semester
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value as SemesterType)}
                    className="input"
                    style={{ width: "100%" }}
                  >
                    <option value="FIRST">1st Semester</option>
                    <option value="SECOND">2nd Semester</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                    Session
                  </label>
                  <select
                    value={formSession}
                    onChange={(e) => setFormSession(e.target.value)}
                    className="input"
                    style={{ width: "100%" }}
                  >
                    {SESSIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingCourse(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
                  className="btn btn-primary"
                >
                  {editingCourse
                    ? updateCourseMutation.isPending
                      ? "Saving..."
                      : "Save Changes"
                    : createCourseMutation.isPending
                    ? "Creating..."
                    : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Upload Modal */}
      {isBulkOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "560px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                Bulk CSV Course Import
              </h3>
              <button
                type="button"
                onClick={() => setIsBulkOpen(false)}
                className="btn btn-ghost btn-xs"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Template Download & Format Guide */}
              <div
                style={{
                  background: "var(--surface-sunken)",
                  padding: "1rem",
                  borderRadius: "8px",
                  fontSize: "0.8125rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 600 }}>CSV Format Requirements</span>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCSV}
                    className="btn btn-ghost btn-xs"
                    style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                  >
                    <Download size={13} /> Download Sample CSV
                  </button>
                </div>
                <p style={{ color: "var(--foreground-muted)", margin: "0 0 0.5rem", lineHeight: 1.5 }}>
                  File must contain headers: <code>course_code,course_title,units,level,semester,session</code>.
                </p>
                <code
                  style={{
                    display: "block",
                    padding: "0.5rem",
                    background: "var(--card-bg)",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                  }}
                >
                  CSC 101,Introduction to Computer Science,3,100,FIRST,2025/2026
                </code>
              </div>

              {/* Upload Dropzone */}
              <div
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: "8px",
                  padding: "2rem 1rem",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: bulkFile ? "rgba(99, 102, 241, 0.05)" : "transparent",
                }}
                onClick={() => document.getElementById("bulk-file-input")?.click()}
              >
                <input
                  id="bulk-file-input"
                  type="file"
                  accept=".csv"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setBulkFile(file);
                  }}
                />
                <Upload size={32} color="var(--primary)" style={{ margin: "0 auto 0.75rem" }} />
                <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {bulkFile ? bulkFile.name : "Click to select CSV file"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
                  {bulkFile ? `${(bulkFile.size / 1024).toFixed(1)} KB` : "Supports UTF-8 encoded .csv files"}
                </div>
              </div>

              {/* Bulk Result Details */}
              {bulkResult && (
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "8px",
                    background: bulkResult.failed_rows > 0 ? "rgba(239, 68, 68, 0.05)" : "rgba(16, 185, 129, 0.05)",
                    border: `1px solid ${bulkResult.failed_rows > 0 ? "var(--destructive)" : "var(--success)"}`,
                    fontSize: "0.8125rem",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                    Import Report: {bulkResult.success_count} added, {bulkResult.failed_rows} failed.
                  </div>
                  {bulkResult.errors && bulkResult.errors.length > 0 && (
                    <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.25rem", color: "#ef4444" }}>
                      {bulkResult.errors.map((err, i) => (
                        <li key={i}>
                          Row {err.row}: {err.field ? `[${err.field}] ` : ""}{err.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="btn btn-outline"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!bulkFile || bulkUploadMutation.isPending}
                  onClick={() => bulkFile && bulkUploadMutation.mutate(bulkFile)}
                  className="btn btn-primary"
                >
                  {bulkUploadMutation.isPending ? "Importing Courses..." : "Upload and Import"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
