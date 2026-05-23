"use client";

import { useMemo } from "react";

import type { TeacherDashboardData } from "@/types/teacher-dashboard";
import { useTeacherClassesSnapshot } from "@/features/teacher/hooks/use-teacher-classes-snapshot";
import { useTeacherRosterSnapshot } from "@/features/teacher/hooks/use-teacher-roster-snapshot";
import { getMarksStudentId } from "@/services/student.service";

const EMPTY: TeacherDashboardData = {
  totalClasses: 0,
  studentCount: 0,
  classAverage: null,
  classPerformance: [],
  hasMarks: false,
};

export function useTeacherDashboardSnapshot(teacherId: string | undefined) {
  const classesState = useTeacherClassesSnapshot(teacherId);
  const classIds = useMemo(
    () => classesState.classes.map((c) => c.id),
    [classesState.classes],
  );
  const roster = useTeacherRosterSnapshot(classIds);

  const data = useMemo((): TeacherDashboardData => {
    if (!teacherId || classesState.classes.length === 0) {
      return {
        ...EMPTY,
        totalClasses: classesState.classes.length,
      };
    }

    const allScores: number[] = [];
    const classPerformance = classesState.classes
      .map((classRoom) => {
        const classStudents = roster.students.filter(
          (s) => s.classId === classRoom.id,
        );
        const scores: number[] = [];

        for (const student of classStudents) {
          const key = getMarksStudentId(student);
          const entries = roster.marksByStudent[key] ?? [];
          scores.push(...entries.map((e) => e.percentage));
        }

        if (scores.length === 0) return null;

        const average =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;
        allScores.push(...scores);

        return {
          label: classRoom.name,
          value: Math.round(average * 10) / 10,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => a.label.localeCompare(b.label));

    const hasMarks = allScores.length > 0;

    return {
      totalClasses: classesState.classes.length,
      studentCount: roster.students.length,
      classAverage: hasMarks
        ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
        : null,
      classPerformance,
      hasMarks,
    };
  }, [teacherId, classesState.classes, roster.students, roster.marksByStudent]);

  return {
    data,
    isLoading:
      classesState.isLoading || roster.isLoading,
    error: classesState.error ?? roster.error,
  };
}
