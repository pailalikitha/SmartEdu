import type { Metadata } from "next";

import { AttendanceTracking } from "@/features/attendance";

export const metadata: Metadata = {
  title: "Attendance",
};

export default function AdminAttendancePage() {
  return <AttendanceTracking />;
}
