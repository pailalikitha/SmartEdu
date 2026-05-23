import { z } from "zod";

import { EXAM_GOALS, SUBJECT_OPTIONS } from "@/types/study-planner";

export const generatePlanSchema = z.object({
  weakTopics: z.string().optional(),
  hoursPerDay: z.number().min(1, "At least 1 hour").max(8, "Maximum 8 hours"),
  examGoal: z.enum(EXAM_GOALS),
});

export type GeneratePlanFormValues = z.infer<typeof generatePlanSchema>;

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required").max(120),
  scheduledDate: z.string().min(1, "Date is required"),
  startTime: z.string().optional(),
  durationMinutes: z.number().min(15).max(240),
  priority: z.enum(["low", "medium", "high"]),
  notes: z.string().max(300).optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const DEFAULT_SUBJECTS = [...SUBJECT_OPTIONS];
