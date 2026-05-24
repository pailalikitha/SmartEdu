"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMemo, useRef } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AdminAccountSection } from "@/features/student-analytics/components/admin-account-section";
import { ClassHistorySection } from "@/features/student-analytics/components/class-history-section";
import { AttendanceBreakdownSection } from "@/features/student-analytics/components/attendance-breakdown-section";
import { MarksHistorySection } from "@/features/student-analytics/components/marks-history-section";
import { PerformanceTrendSection } from "@/features/student-analytics/components/performance-trend-section";
import { QuickActionsSection } from "@/features/student-analytics/components/quick-actions-section";
import { StrengthWeaknessSection } from "@/features/student-analytics/components/strength-weakness-section";
import { StudentNotesSection } from "@/features/student-analytics/components/student-notes-section";
import { SubjectPerformanceChart } from "@/features/student-analytics/components/subject-performance-chart";
import { computeClassRank } from "@/features/student-analytics/utils/performance";
import { useStudentAnalytics } from "@/hooks/use-student-analytics";
import { useStudentProfileSnapshot } from "@/hooks/use-student-profile-snapshot";
import { useAuth } from "@/hooks/use-auth";
import { formatPercentage } from "@/lib/utils/format";
import { getMarksStudentId } from "@/services/student.service";
import { getStudentFullName, getStudentClassLabel } from "@/types/student";
type StudentDrillDownPageProps = {
  mode: "teacher" | "admin";
  studentId: string;
  backHref: string;
  peerAverages?: Array<{ id: string; average: number | null }>;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function StudentDrillDownPage({
  mode,
  studentId,
  backHref,
  peerAverages = [],
}: StudentDrillDownPageProps) {
  const { user } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);
  const { student, isLoading: profileLoading, error: profileError } =
    useStudentProfileSnapshot(studentId);

  const marksStudentId = student ? getMarksStudentId(student) : undefined;
  const analytics = useStudentAnalytics(marksStudentId);

  const classRank = useMemo(() => {
    if (!marksStudentId || peerAverages.length === 0) return null;
    const withCurrent = peerAverages.map((p) =>
      p.id === marksStudentId
        ? { ...p, average: analytics.overallAverage }
        : p,
    );
    return computeClassRank(marksStudentId, withCurrent);
  }, [marksStudentId, peerAverages, analytics.overallAverage]);

  if (profileLoading || analytics.loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner label="Loading student dashboard" />
      </div>
    );
  }

  if (!student) {
    return (
      <EmptyState
        title="Student not found"
        description={profileError ?? "This student record could not be loaded."}
      />
    );
  }

  const fullName = getStudentFullName(student);
  const ownerId = user?.id ?? "";

  return (
    <div className="space-y-6" ref={reportRef}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href={backHref}
            className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {getInitials(fullName)}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {fullName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Roll {student.rollNumber} · {getStudentClassLabel(student)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>{analytics.performanceBadge}</Badge>
              {student.atRisk ? (
                <Badge variant="destructive">At risk</Badge>
              ) : null}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {[
            {
              label: "Overall",
              value:
                analytics.overallAverage !== null
                  ? formatPercentage(analytics.overallAverage)
                  : "—",
            },
            {
              label: "Attendance",
              value:
                analytics.attendanceRate !== null
                  ? formatPercentage(analytics.attendanceRate)
                  : "—",
            },
            {
              label: "Class rank",
              value: classRank !== null ? `#${classRank}` : "—",
            },
            {
              label: "Weak subjects",
              value: String(analytics.weakSubjectCount),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card px-3 py-2 text-center"
            >
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {analytics.error ? (
        <p className="text-sm text-destructive" role="alert">
          {analytics.error}
        </p>
      ) : null}

      <StrengthWeaknessSection
        strongSubjects={analytics.strongSubjects}
        weakSubjects={analytics.weakSubjects}
      />

      <SubjectPerformanceChart subjectAverages={analytics.subjectAverages} />

      <MarksHistorySection entries={analytics.examHistory} />

      <AttendanceBreakdownSection
        presentCount={analytics.presentCount}
        absentCount={analytics.absentCount}
        lateCount={analytics.lateCount}
        excusedCount={analytics.excusedCount}
        attendanceRate={analytics.attendanceRate}
        attendanceByDate={analytics.attendanceByDate}
      />

      <PerformanceTrendSection entries={analytics.marksEntries} />

      {mode === "admin" ? (
        <>
          <AdminAccountSection student={student} />
          <ClassHistorySection student={student} />
        </>
      ) : null}

      {ownerId ? (
        <StudentNotesSection
          ownerId={ownerId}
          studentId={student.id}
          title={mode === "admin" ? "Admin notes" : "Teacher notes (private)"}
        />
      ) : null}

      {mode === "teacher" && user ? (
        <QuickActionsSection
          student={student}
          marksStudentId={marksStudentId ?? student.id}
          teacherId={user.id}
          teacherName={user.displayName ?? "Teacher"}
          reportRef={reportRef}
        />
      ) : null}

      {mode === "admin" && user ? (
        <QuickActionsSection
          student={student}
          marksStudentId={marksStudentId ?? student.id}
          teacherId={user.id}
          teacherName={user.displayName ?? "Admin"}
          reportRef={reportRef}
        />
      ) : null}
    </div>
  );
}
