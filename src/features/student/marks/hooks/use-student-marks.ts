"use client";

import { useStudentMarksSnapshot } from "@/hooks/use-student-marks-snapshot";

export function useStudentMarks(studentId: string | undefined) {
  return useStudentMarksSnapshot(studentId);
}
