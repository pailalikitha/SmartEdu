export type StudentMarkEntry = {
  id: string;
  subject: string;
  examType: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  date: string;
};

export type MarksSummary = {
  overallAverage: number;
  bestSubject: { name: string; average: number } | null;
  weakestSubject: { name: string; average: number } | null;
  totalExams: number;
};

export type MarksSortKey =
  | "subject"
  | "examType"
  | "marksObtained"
  | "totalMarks"
  | "percentage"
  | "grade"
  | "date";

export type MarksSortDirection = "asc" | "desc";

export type MarksFilters = {
  subject: string;
  examType: string;
  startDate: string;
  endDate: string;
};
