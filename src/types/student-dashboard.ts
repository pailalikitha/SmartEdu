export type MarkEntry = {
  id: string;
  subject: string;
  score: number;
};

export type ActivityLogEntry = {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type?: string;
};

export type StudentDashboardData = {
  overallPerformance: number | null;
  weakTopicsCount: number | null;
  attendancePercent: number | null;
  subjectAverages: { label: string; value: number }[];
  activities: ActivityLogEntry[];
};
