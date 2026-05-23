import { listClassesByTeacher } from "@/services/classes.service";
import { listMarkEntries } from "@/services/marks.service";
import {
  getMarksStudentId,
  listStudentsByClassIds,
} from "@/services/student.service";
import type { ClassRoom } from "@/types/class";
import type {
  ClassPerformancePoint,
  TeacherDashboardData,
} from "@/types/teacher-dashboard";
import type { Student } from "@/types/student";

function buildClassPerformance(
  classes: ClassRoom[],
  students: Student[],
  marksByStudentId: Map<string, number[]>,
): ClassPerformancePoint[] {
  return classes
    .map((classRoom) => {
      const classStudents = students.filter((s) => s.classId === classRoom.id);
      const scores: number[] = [];

      for (const student of classStudents) {
        const studentScores = marksByStudentId.get(getMarksStudentId(student));
        if (studentScores) scores.push(...studentScores);
      }

      if (scores.length === 0) return null;

      const average =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;

      return {
        label: classRoom.name,
        value: Math.round(average * 10) / 10,
      };
    })
    .filter((point): point is ClassPerformancePoint => point !== null)
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function fetchTeacherDashboardData(
  teacherId: string,
): Promise<TeacherDashboardData> {
  const classes = await listClassesByTeacher(teacherId);
  const classIds = classes.map((c) => c.id);
  const students = await listStudentsByClassIds(classIds);

  const marksByStudentId = new Map<string, number[]>();
  const entryResults = await Promise.all(
    students.map(async (student) => {
      const key = getMarksStudentId(student);
      const entries = await listMarkEntries(key);
      return { key, scores: entries.map((e) => e.score) };
    }),
  );

  const allScores: number[] = [];
  for (const { key, scores } of entryResults) {
    if (scores.length > 0) {
      marksByStudentId.set(key, scores);
      allScores.push(...scores);
    }
  }

  const hasMarks = allScores.length > 0;
  const classAverage = hasMarks
    ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
    : null;

  return {
    totalClasses: classes.length,
    studentCount: students.length,
    classAverage,
    classPerformance: buildClassPerformance(classes, students, marksByStudentId),
    hasMarks,
  };
}
