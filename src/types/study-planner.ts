export const TASK_STATUSES = ["pending", "in_progress", "completed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_SOURCES = ["manual", "ai"] as const;
export type TaskSource = (typeof TASK_SOURCES)[number];

export type StudyTask = {
  id: string;
  studentId: string;
  title: string;
  subject: string;
  topic: string;
  scheduledDate: string;
  startTime?: string;
  durationMinutes: number;
  status: TaskStatus;
  priority: TaskPriority;
  source: TaskSource;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type StudyTaskInput = Omit<StudyTask, "id" | "createdAt" | "updatedAt">;

export const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
] as const;

export const EXAM_GOALS = ["Board", "JEE", "NEET", "General"] as const;
export type ExamGoal = (typeof EXAM_GOALS)[number];
