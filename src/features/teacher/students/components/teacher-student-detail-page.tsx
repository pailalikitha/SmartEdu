"use client";

import { useMemo } from "react";

import { ROUTES } from "@/constants/routes";
import { StudentDrillDownPage } from "@/features/student-analytics/components/student-drill-down-page";
import { useTeacherClassesSnapshot } from "@/features/teacher/hooks/use-teacher-classes-snapshot";
import { useTeacherRosterSnapshot } from "@/features/teacher/hooks/use-teacher-roster-snapshot";
import { averageMarkEntries } from "@/features/teacher/utils/teacher-analytics";
import { useAuth } from "@/hooks/use-auth";
import { getMarksStudentId } from "@/services/student.service";

type TeacherStudentDetailPageProps = {
  studentId: string;
};

export function TeacherStudentDetailPage({
  studentId,
}: TeacherStudentDetailPageProps) {
  const { user } = useAuth();
  const { classes } = useTeacherClassesSnapshot(user?.id);
  const classIds = useMemo(() => classes.map((c) => c.id), [classes]);
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
      mode="teacher"
      studentId={studentId}
      backHref={ROUTES.teacher.students}
      peerAverages={peerAverages}
    />
  );
}
