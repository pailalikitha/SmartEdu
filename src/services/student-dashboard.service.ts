import {
  averageMarkScore,
  averageMarksBySubject,
  listMarkEntries,
} from "@/services/marks.service";
import { listRecentActivityLogs } from "@/services/activity-log.service";
import {
  calculateAttendancePercent,
  listAttendanceForStudent,
} from "@/services/attendance.service";
import { getWeakTopicsStats } from "@/services/weak-topics.service";
import type { StudentDashboardData } from "@/types/student-dashboard";

export async function fetchStudentDashboardData(
  studentId: string,
): Promise<StudentDashboardData> {
  const [markEntries, weakTopics, attendanceRecords, activityLogs] =
    await Promise.all([
      listMarkEntries(studentId),
      getWeakTopicsStats(studentId),
      listAttendanceForStudent(studentId),
      listRecentActivityLogs(studentId),
    ]);

  return {
    overallPerformance: averageMarkScore(markEntries),
    weakTopicsCount:
      weakTopics === null ? null : weakTopics.weakCount,
    attendancePercent: calculateAttendancePercent(attendanceRecords),
    subjectAverages: averageMarksBySubject(markEntries),
    activities: activityLogs,
  };
}
