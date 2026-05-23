export type AssignmentPriority = "low" | "medium" | "high";
export type AssignmentStatus = "open" | "closed";

export type Assignment = {
  id: string;
  classId: string;
  title: string;
  subject: string;
  teacherId: string;
  teacherName?: string;
  description: string;
  dueDate: Date;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  createdAt: Date | null;
};

export type AssignmentInput = {
  title: string;
  subject: string;
  classId: string;
  description: string;
  dueDate: Date;
  priority: AssignmentPriority;
};

export type AssignmentSubmission = {
  studentId: string;
  studentName: string;
  submittedAt: Date | null;
  status: "submitted" | "pending";
};

export type AssignmentWithCounts = Assignment & {
  submittedCount: number;
  pendingCount: number;
  className?: string;
  hasSubmitted?: boolean;
};
