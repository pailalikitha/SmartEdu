export type ClassPerformancePoint = {
  label: string;
  value: number;
};

export type TeacherDashboardData = {
  totalClasses: number;
  studentCount: number;
  classAverage: number | null;
  classPerformance: ClassPerformancePoint[];
  hasMarks: boolean;
};
