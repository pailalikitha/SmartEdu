import type { Metadata } from "next";

import { TeacherAttendancePage } from "@/features/teacher/attendance";

export const metadata: Metadata = {
  title: "Attendance",
};

export default function TeacherAttendanceRoutePage() {
  return <TeacherAttendancePage />;
}
