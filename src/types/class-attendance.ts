export const CLASS_ATTENDANCE_STATUSES = ["present", "absent", "late"] as const;

export type ClassAttendanceStatus = (typeof CLASS_ATTENDANCE_STATUSES)[number];

export type ClassAttendanceRecord = {
  studentId: string;
  studentName: string;
  classId: string;
  teacherId: string;
  date: string;
  status: ClassAttendanceStatus;
  timestamp: Date;
};

export type ClassAttendanceInput = {
  studentId: string;
  studentName: string;
  classId: string;
  teacherId: string;
  date: string;
  status: ClassAttendanceStatus;
};

export const CLASS_ATTENDANCE_SHORT: Record<ClassAttendanceStatus, string> = {
  present: "P",
  absent: "A",
  late: "L",
};
