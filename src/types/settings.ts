export type SchoolSettings = {
  schoolName: string;
  logoURL?: string | null;
  attendanceThreshold: number;
  passingMarksThreshold: number;
  academicYear: string;
  updatedAt?: Date | null;
};

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: "SmartEdu School",
  logoURL: null,
  attendanceThreshold: 75,
  passingMarksThreshold: 40,
  academicYear: `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`,
};
