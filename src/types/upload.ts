export type MarksCsvRow = {
  studentId: string;
  studentName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  examType: string;
  date: string;
};

export type StudentCsvRow = {
  studentId?: string;
  studentName: string;
  studentEmail?: string;
  rollNumber: string;
  classId: string;
  parentName?: string;
  parentEmail: string;
  phone?: string;
};

export type UploadResultSummary = {
  successCount: number;
  failureCount: number;
  errors: string[];
};

export type UploadHistoryLog = {
  id: string;
  filename: string;
  uploadType: "marks" | "students";
  uploadedAt: Date;
  uploadedBy: string;
  recordsUploaded: number;
  successCount: number;
  failureCount: number;
};
