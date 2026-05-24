"use client";

import { useMemo } from "react";

import { ROUTES } from "@/constants/routes";
import { StudentDrillDownPage } from "@/features/student-analytics/components/student-drill-down-page";
import { useTeacherRosterSnapshot } from "@/features/teacher/hooks/use-teacher-roster-snapshot";
import { averageMarkEntries } from "@/features/teacher/utils/teacher-analytics";
import { useStudentProfileSnapshot } from "@/hooks/use-student-profile-snapshot";
import { getMarksStudentId } from "@/services/student.service";

type AdminStudentDetailPageProps = {
  studentId: string;
};

export function AdminStudentDetailPage({
  studentId,
}: AdminStudentDetailPageProps) {
  const { student } = useStudentProfileSnapshot(studentId);
  const classIds = useMemo(
    () => (student?.classId ? [student.classId] : []),
    [student?.classId],
  );
  const roster = useTeacherRosterSnapshot(classIds);

  const peerAverages = useMemo(
    () =>
      roster.students.map((s) => ({
        id: getMarksStudentId(s),
        average: averageMarkEntries(
          roster.marksByStudent[getMarksStudentId(s)] ?? [],
        ),
      })),
    [roster.students, roster.marksByStudent],
  );

  return (
    <StudentDrillDownPage
      mode="admin"
      studentId={studentId}
      backHref={ROUTES.admin.students}
      peerAverages={peerAverages}
    />
  );
}
