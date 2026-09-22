"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Edit2,
  Power,
  Save,
  X,
  AlertCircle,
  Check,
  Loader2,
  Calendar,
  Hash,
  Layers,
  GraduationCap,
} from "lucide-react";
import { staffApi } from "@/lib/api/staff";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import type { SemesterType } from "@/types/course";

const LEVEL_LIST = ["100", "200", "300", "400", "500", "600"];
const SESSIONS = ["2024/2025", "2025/2026", "2026/2027"];

export default function StaffCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const course_id = params?.course_id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Edit form state
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formUnits, setFormUnits] = useState(3);
  const [formLevel, setFormLevel] = useState("100");
  const [formSemester, setFormSemester] = useState<SemesterType>("FIRST");
  const [formSession, setFormSession] = useState("2025/2026");

  const showNotif = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  const {
    data: course,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["hod-course-detail", course_id],
    queryFn: async () => {
      const res = await staffApi.getCourse(course_id);
      return res.data.data;
    },
    enabled: !!course_id,
  });

  // Sync form state when data loads
  useEffect(() => {
    if (course) {
      setFormCode(course.course_code);
      setFormTitle(course.course_title);
      setFormUnits(course.units);
      setFormLevel(course.level);
      setFormSemester(course.semester);
      setFormSession(course.session);
    }
  }, [course]);

  const updateMutation = useMutation({
    mutationFn: () =>
      staffApi.updateCourse(course_id, {
        course_code: formCode.trim(),
        course_title: formTitle.trim(),
        units: Number(formUnits),
        level: formLevel,
        semester: formSemester,
        session: formSession,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hod-courses"] });
      queryClient.invalidateQueries({
        queryKey: ["hod-course-detail", course_id],
      });
      setIsEditing(false);
      showNotif("success", "Course updated successfully.");
      refetch();
    },
    onError: (err: any) => {
      showNotif(
        "error",
        err?.response?.data?.message || "Failed to update course."
      );
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => staffApi.deactivateCourse(course_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hod-courses"] });
      queryClient.invalidateQueries({
        queryKey: ["hod-course-detail", course_id],
      });
      showNotif(
        "success",
        `Course ${course?.status === "ACTIVE" ? "deactivated" : "status updated"}.`
      );
      refetch();
    },
    onError: (err: any) => {
      showNotif(
        "error",
        err?.response?.data?.message || "Failed to update course status."
      );
    },
  });

  const handleCancelEdit = () => {
    if (course) {
      setFormCode(course.course_code);
      setFormTitle(course.course_title);
      setFormUnits(course.units);
      setFormLevel(course.level);
      setFormSemester(course.semester);
      setFormSession(course.session);
    }
    setIsEditing(false);
  };

  if (isLoading) return <PageSkeleton />;

  if (!course) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <BookOpen size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
        <h3 style={{ margin: "0 0 0.5rem" }}>Course not found</h3>
        <p style={{ color: "var(--foreground-muted)", fontSize: "0.875rem" }}>
          This course may have been removed or you don&apos;t have access.
        </p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => router.push("/staff/courses")}
          style={{ marginTop: "1rem" }}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const isActive = course.status === "ACTIVE";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Notification Toast */}
      {notification && (
        <div
          className={`alert alert-${notification.type === "success" ? "success" : "error"}`}
          style={{ fontSize: "0.8125rem" }}
        >
          {notification.type === "success" ? (
            <Check size={14} style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
          )}
          {notification.text}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}
        >
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => router.push("/staff/courses")}
            style={{ padding: "0.375rem", flexShrink: 0, marginTop: "0.125rem" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                flexWrap: "wrap",
              }}
            >
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                {course.course_code}
              </h1>
              <span
                className={`badge ${isActive ? "badge-success" : "badge-error"}`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--foreground-muted)",
                margin: "0.25rem 0 0",
              }}
            >
              {course.course_title}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        {!isEditing && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => deactivateMutation.mutate()}
              disabled={deactivateMutation.isPending}
              style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
            >
              {deactivateMutation.isPending ? (
                <Loader2 size={14} className="spin" />
              ) : (
                <Power size={14} />
              )}
              {isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
              style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
            >
              <Edit2 size={14} /> Edit Course
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: "1.25rem",
          alignItems: "start",
        }}
        className="course-detail-grid"
      >
        {/* Left: Edit form or view */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {isEditing ? (
            <div className="card">
              <div className="card-header">
                <h3
                  style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}
                >
                  Edit Course Details
                </h3>
              </div>
              <div className="card-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateMutation.mutate();
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                    className="course-form-grid"
                  >
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">
                        Course Code{" "}
                        <span style={{ color: "var(--destructive)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. CSC 301"
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">
                        Credit Units{" "}
                        <span style={{ color: "var(--destructive)" }}>*</span>
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        min={1}
                        max={6}
                        value={formUnits}
                        onChange={(e) => setFormUnits(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      Course Title{" "}
                      <span style={{ color: "var(--destructive)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Full course title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "1rem",
                    }}
                    className="course-form-grid"
                  >
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Level</label>
                      <select
                        className="form-select"
                        value={formLevel}
                        onChange={(e) => setFormLevel(e.target.value)}
                      >
                        {LEVEL_LIST.map((l) => (
                          <option key={l} value={l}>
                            {l} Level
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Semester</label>
                      <select
                        className="form-select"
                        value={formSemester}
                        onChange={(e) =>
                          setFormSemester(e.target.value as SemesterType)
                        }
                      >
                        <option value="FIRST">First Semester</option>
                        <option value="SECOND">Second Semester</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Session</label>
                      <select
                        className="form-select"
                        value={formSession}
                        onChange={(e) => setFormSession(e.target.value)}
                      >
                        {SESSIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "0.5rem",
                      paddingTop: "0.5rem",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        updateMutation.isPending ||
                        !formCode.trim() ||
                        !formTitle.trim()
                      }
                    >
                      {updateMutation.isPending ? (
                        <Loader2 size={14} className="spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h3
                  style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}
                >
                  Course Information
                </h3>
              </div>
              <div
                className="card-body"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.25rem",
                }}
              >
                {[
                  {
                    label: "Course Code",
                    value: course.course_code,
                    icon: Hash,
                  },
                  { label: "Credit Units", value: `${course.units} units`, icon: Layers },
                  {
                    label: "Level",
                    value: `${course.level} Level`,
                    icon: GraduationCap,
                  },
                  {
                    label: "Semester",
                    value:
                      course.semester === "FIRST"
                        ? "First Semester"
                        : "Second Semester",
                    icon: Calendar,
                  },
                  {
                    label: "Academic Session",
                    value: course.session,
                    icon: Calendar,
                  },
                  {
                    label: "Status",
                    value: course.status,
                    icon: BookOpen,
                    isStatus: true,
                  },
                ].map(({ label, value, icon: Icon, isStatus }) => (
                  <div key={label}>
                    <span
                      className="form-label"
                      style={{
                        color: "var(--foreground-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <Icon size={12} /> {label}
                    </span>
                    {isStatus ? (
                      <span
                        className={`badge ${value === "ACTIVE" ? "badge-success" : "badge-error"}`}
                      >
                        {value}
                      </span>
                    ) : (
                      <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                        {value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Title Card */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <span
              className="form-label"
              style={{ color: "var(--foreground-muted)", marginBottom: "0.5rem", display: "block" }}
            >
              Full Course Title
            </span>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {course.course_title}
            </p>
          </div>
        </div>

        {/* Right: Meta sidebar */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Quick Stats */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h4
              style={{ fontWeight: 600, fontSize: "0.875rem", margin: "0 0 1rem" }}
            >
              Quick Stats
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>Status</span>
                <span
                  className={`badge ${isActive ? "badge-success" : "badge-error"}`}
                >
                  {course.status}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>
                  Credit Units
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    color: "var(--primary)",
                  }}
                >
                  {course.units}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>Level</span>
                <span style={{ fontWeight: 600 }}>{course.level}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>
                  Semester
                </span>
                <span style={{ fontWeight: 600 }}>
                  {course.semester === "FIRST" ? "1st" : "2nd"}
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          {(course.created_at || course.updated_at) && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <h4
                style={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  margin: "0 0 0.875rem",
                }}
              >
                Record History
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  fontSize: "0.8125rem",
                }}
              >
                {course.created_at && (
                  <div>
                    <span
                      style={{
                        color: "var(--foreground-muted)",
                        display: "block",
                      }}
                    >
                      Created
                    </span>
                    <span style={{ fontWeight: 500 }}>
                      {new Date(course.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {course.updated_at && (
                  <div>
                    <span
                      style={{
                        color: "var(--foreground-muted)",
                        display: "block",
                      }}
                    >
                      Last Updated
                    </span>
                    <span style={{ fontWeight: 500 }}>
                      {new Date(course.updated_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {!isEditing && (
            <div
              className="card"
              style={{
                padding: "1.25rem",
                border: "1px solid var(--status-error-border)",
              }}
            >
              <h4
                style={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "var(--status-error-text)",
                  margin: "0 0 0.625rem",
                }}
              >
                Course Status
              </h4>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--foreground-muted)",
                  margin: "0 0 0.875rem",
                  lineHeight: 1.5,
                }}
              >
                {isActive
                  ? "Deactivating will hide this course from student registration portals."
                  : "Activating will make this course visible to students for registration."}
              </p>
              <button
                type="button"
                className={`btn btn-sm ${isActive ? "btn-danger" : "btn-secondary"}`}
                style={{ width: "100%" }}
                onClick={() => deactivateMutation.mutate()}
                disabled={deactivateMutation.isPending}
              >
                {deactivateMutation.isPending ? (
                  <Loader2 size={13} className="spin" />
                ) : (
                  <Power size={13} />
                )}
                {isActive ? "Deactivate Course" : "Activate Course"}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .course-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .course-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
