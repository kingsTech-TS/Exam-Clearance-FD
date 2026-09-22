"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  Save,
  Send,
  RotateCcw,
  Check,
  Download,
  Eye,
  Info,
} from "lucide-react";
import Link from "next/link";
import { studentsApi } from "@/lib/api/students";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import type { Course, CourseRegistration, SemesterType } from "@/types/course";

const SESSIONS = ["2025/2026", "2026/2027", "2024/2025"];
const SEMESTERS: { label: string; value: SemesterType }[] = [
  { label: "1st Semester", value: "FIRST" },
  { label: "2nd Semester", value: "SECOND" },
];

export default function StudentCoursesPage() {
  const queryClient = useQueryClient();

  const [selectedSession, setSelectedSession] = useState("2025/2026");
  const [selectedSemester, setSelectedSemester] = useState<SemesterType>("FIRST");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Fetch Student Profile (to know level, faculty, department)
  const { data: profile } = useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => {
      const res = await studentsApi.getMe();
      return res.data.data;
    },
  });

  // 2. Fetch Registration for chosen Session/Semester
  const {
    data: registration,
    isLoading: regLoading,
    refetch: refetchRegistration,
  } = useQuery({
    queryKey: ["student-course-registration", selectedSession, selectedSemester],
    queryFn: async () => {
      try {
        const res = await studentsApi.getCourseRegistration({
          session: selectedSession,
          semester: selectedSemester,
        });
        return res.data.data;
      } catch {
        return null;
      }
    },
  });

  // 3. Fetch Eligible Departmental Courses
  const { data: eligibleCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ["eligible-courses", selectedSession, selectedSemester],
    queryFn: async () => {
      const res = await studentsApi.getEligibleCourses({
        session: selectedSession,
        semester: selectedSemester,
      });
      return res.data.data;
    },
  });

  // Initialize selected course IDs from registration
  useEffect(() => {
    if (registration && registration.courses) {
      setSelectedCourseIds(registration.courses.map((c) => c.course_id));
    } else {
      setSelectedCourseIds([]);
    }
  }, [registration]);

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (registration) {
        return await studentsApi.updateCourseRegistration({
          course_ids: selectedCourseIds,
        });
      } else {
        return await studentsApi.createCourseRegistration({
          course_ids: selectedCourseIds,
          session: selectedSession,
          semester: selectedSemester,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-course-registration"] });
      setFeedbackMsg({ type: "success", text: "Course registration draft saved successfully." });
      setTimeout(() => setFeedbackMsg(null), 4000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to save course registration draft.";
      setFeedbackMsg({ type: "error", text: msg });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      // If we made changes to selection, save first or submit directly
      if (!registration || registration.courses.length !== selectedCourseIds.length) {
        if (registration) {
          await studentsApi.updateCourseRegistration({ course_ids: selectedCourseIds });
        } else {
          await studentsApi.createCourseRegistration({
            course_ids: selectedCourseIds,
            session: selectedSession,
            semester: selectedSemester,
          });
        }
      }
      return await studentsApi.submitCourseRegistration({
        session: selectedSession,
        semester: selectedSemester,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-course-registration"] });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      setFeedbackMsg({
        type: "success",
        text: "Course registration submitted successfully! Awaiting HOD digital signature.",
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to submit course registration.";
      setFeedbackMsg({ type: "error", text: msg });
    },
  });

  const toggleCourse = (courseId: string) => {
    if (isLocked) return;
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const selectAll = () => {
    if (isLocked || !eligibleCourses) return;
    setSelectedCourseIds(eligibleCourses.map((c) => c.id));
  };

  const deselectAll = () => {
    if (isLocked) return;
    setSelectedCourseIds([]);
  };

  const handleDownload = async (filename: string) => {
    try {
      const res = await studentsApi.downloadCourseForm({
        session: selectedSession,
        semester: selectedSemester,
      });
      const url = res.data.data?.download_url;
      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Download link unavailable. The form may not be ready yet.");
      }
    } catch {
      alert("Unable to generate download link. Please try again.");
    }
  };

  const isLoading = regLoading || coursesLoading;
  // Locked when awaiting HOD review (PENDING_HOD) or fully completed (COMPLETED)
  const isLocked = registration?.status === "PENDING_HOD" || registration?.status === "COMPLETED";

  // Calculate total units currently selected
  const currentTotalUnits = (eligibleCourses || [])
    .filter((c) => selectedCourseIds.includes(c.id))
    .reduce((sum, c) => sum + (c.units || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Course Registration</h1>
            {registration && (
              <StatusBadge status={registration.status} type="registration" />
            )}
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
            Select your semester courses, calculate credit load, and submit for official Head of Department (HOD) endorsement.
          </p>
        </div>

        {/* Academic Session & Semester Selectors */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground-muted)" }}>Session:</span>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="input input-sm"
              style={{ paddingRight: "1.75rem", minWidth: "120px" }}
            >
              {SESSIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground-muted)" }}>Semester:</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value as SemesterType)}
              className="input input-sm"
              style={{ paddingRight: "1.75rem", minWidth: "130px" }}
            >
              {SEMESTERS.map((sem) => (
                <option key={sem.value} value={sem.value}>{sem.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alert Notifications */}
      {feedbackMsg && (
        <div
          className={`card ${feedbackMsg.type === "success" ? "badge-success" : "badge-error"}`}
          style={{
            padding: "0.875rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.875rem",
            borderRadius: "8px",
          }}
        >
          {feedbackMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Registration Lifecycle Status Card */}
      {registration && (
        <div
          className="card"
          style={{
            padding: "1.25rem",
            borderLeft: `4px solid ${
              registration.status === "COMPLETED"
                ? "var(--success, #10b981)"
                : registration.status === "REJECTED"
                ? "var(--destructive, #ef4444)"
                : registration.status === "PENDING_HOD"
                ? "var(--warning, #f59e0b)"
                : "var(--primary, #6366f1)"
            }`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                  Registration Status:
                </span>
                <StatusBadge status={registration.status} type="registration" />
              </div>

              {registration.status === "PENDING_HOD" && (
                <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", margin: "0.375rem 0 0" }}>
                  Awaiting review and digital signature from Head of Department ({registration.department}).
                  Course modifications are temporarily locked.
                </p>
              )}

              {registration.status === "COMPLETED" && (
                <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", margin: "0.375rem 0 0" }}>
                  Endorsed and digitally signed by {registration.hod_name || "HOD"}. Official Course Form PDF generated.
                </p>
              )}

              {registration.status === "REJECTED" && (
                <div style={{ marginTop: "0.5rem" }}>
                  <p style={{ fontSize: "0.8125rem", color: "#ef4444", fontWeight: 600, margin: "0 0 0.25rem" }}>
                    Revision Required by HOD:
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", margin: 0, fontStyle: "italic" }}>
                    &ldquo;{registration.rejection?.reason || "Please adjust your course selection."}&rdquo;
                  </p>
                </div>
              )}

              {registration.status === "DRAFT" && (
                <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", margin: "0.375rem 0 0" }}>
                  Saved as draft. Review your course load below and click &ldquo;Submit for HOD Approval&rdquo; when ready.
                </p>
              )}
            </div>

            {/* If completed, show direct view / download link */}
            {registration.status === "COMPLETED" && registration.course_form_document_id && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link
                  href={`/student/documents/${registration.course_form_document_id}`}
                  className="btn btn-outline btn-sm"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                >
                  <Eye size={14} /> View Form
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      `Course_Form_${selectedSession.replace("/", "-")}_${selectedSemester}.pdf`
                    )
                  }
                  className="btn btn-primary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Layout: Course Selection + Summary Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        {/* Left Column: Eligible Courses List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            className="card"
            style={{
              padding: "1rem 1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                Departmental Course Catalog
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                {profile?.department || "Department"} &bull; {profile?.level ? `${profile.level} Level` : "All Levels"}
              </div>
            </div>

            {!isLocked && (eligibleCourses?.length ?? 0) > 0 && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={selectAll}
                  className="btn btn-ghost btn-xs"
                  style={{ fontSize: "0.75rem" }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="btn btn-ghost btn-xs"
                  style={{ fontSize: "0.75rem" }}
                >
                  Deselect All
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <PageSkeleton />
          ) : !eligibleCourses || eligibleCourses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No Courses Listed Yet"
              description={`No courses found for ${selectedSession} ${selectedSemester === "FIRST" ? "1st" : "2nd"} Semester in your department. Contact your HOD if courses should be available.`}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {eligibleCourses.map((course) => {
                const isSelected = selectedCourseIds.includes(course.id);
                return (
                  <div
                    key={course.id}
                    onClick={() => toggleCourse(course.id)}
                    className="card"
                    style={{
                      padding: "1rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      cursor: isLocked ? "default" : "pointer",
                      transition: "all 0.2s ease",
                      border: isSelected
                        ? "1px solid var(--primary)"
                        : "1px solid var(--border)",
                      backgroundColor: isSelected
                        ? "rgba(99, 102, 241, 0.05)"
                        : "var(--card-bg)",
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      style={{
                        width: "1.25rem",
                        height: "1.25rem",
                        borderRadius: "4px",
                        border: isSelected
                          ? "2px solid var(--primary)"
                          : "2px solid var(--border)",
                        backgroundColor: isSelected ? "var(--primary)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isSelected && <Check size={13} color="white" strokeWidth={3} />}
                    </div>

                    {/* Course Code & Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--foreground)" }}>
                          {course.course_code}
                        </span>
                        <span className="badge badge-info" style={{ fontSize: "0.6875rem" }}>
                          {course.level} Level
                        </span>
                        <span className="badge badge-pending" style={{ fontSize: "0.6875rem" }}>
                          {course.semester === "FIRST" ? "1st Sem" : "2nd Sem"}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--foreground-muted)",
                          marginTop: "0.25rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {course.course_title}
                      </div>
                    </div>

                    {/* Credit Units Pill */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.125rem",
                          fontWeight: 700,
                          color: isSelected ? "var(--primary)" : "var(--foreground)",
                        }}
                      >
                        {course.units}
                      </span>
                      <span style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)" }}>
                        {course.units === 1 ? "Unit" : "Units"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Registration Summary & Action Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "1rem" }}>
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, margin: "0 0 1rem" }}>
              Registration Summary
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--foreground-muted)" }}>Session:</span>
                <span style={{ fontWeight: 600 }}>{selectedSession}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--foreground-muted)" }}>Semester:</span>
                <span style={{ fontWeight: 600 }}>{selectedSemester === "FIRST" ? "1st Semester" : "2nd Semester"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--foreground-muted)" }}>Selected Courses:</span>
                <span style={{ fontWeight: 600 }}>{selectedCourseIds.length}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9375rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span style={{ fontWeight: 700 }}>Total Credit Units:</span>
                <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1.125rem" }}>
                  {currentTotalUnits}
                </span>
              </div>
            </div>

            {/* Actions */}
            {isLocked ? (
              <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "0.75rem",
                    color: "var(--foreground-muted)",
                  }}
                >
                  <Info size={14} /> Editing locked while {registration?.status.toLowerCase()}
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <button
                  type="button"
                  disabled={selectedCourseIds.length === 0 || saveDraftMutation.isPending}
                  onClick={() => saveDraftMutation.mutate()}
                  className="btn btn-outline"
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                >
                  <Save size={15} />
                  {saveDraftMutation.isPending ? "Saving Draft..." : "Save as Draft"}
                </button>

                <button
                  type="button"
                  disabled={selectedCourseIds.length === 0 || submitMutation.isPending}
                  onClick={() => submitMutation.mutate()}
                  className="btn btn-primary"
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                >
                  <Send size={15} />
                  {submitMutation.isPending ? "Submitting..." : "Submit for HOD Approval"}
                </button>
              </div>
            )}
          </div>

          {/* Academic Policy Guidelines */}
          <div className="card" style={{ padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Info size={15} color="var(--primary)" />
              <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>Registration Guidelines</span>
            </div>
            <ul style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", paddingLeft: "1.125rem", margin: 0, lineHeight: 1.6 }}>
              <li>Ensure all mandatory core departmental courses are selected.</li>
              <li>Maximum standard semester load is typically 24 credit units.</li>
              <li>Once submitted, your HOD will review and digitally sign your Course Form.</li>
              <li>Your signed Course Form PDF is immediately archived in My Documents upon approval.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
