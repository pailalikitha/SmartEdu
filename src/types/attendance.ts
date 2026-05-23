export const ATTENDANCE_STATUSES = [
  "present",
  "absent",
  "late",
  "excused",
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export type AttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  grade: string;
  section: string;
  date: string;
  status: AttendanceStatus;
  markedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type AttendanceInput = {
  studentId: string;
  studentName: string;
  rollNumber: string;
  grade: string;
  section: string;
  date: string;
  status: AttendanceStatus;
  markedBy?: string;
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
};
