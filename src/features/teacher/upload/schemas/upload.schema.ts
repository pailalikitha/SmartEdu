import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const marksCsvRowSchema = z.object({
  studentId: z.string().min(1, "studentId is required"),
  studentName: z.string().min(1, "studentName is required"),
  subject: z.string().min(1, "subject is required"),
  marksObtained: z.coerce.number().min(0),
  totalMarks: z.coerce.number().positive("totalMarks must be > 0"),
  examType: z.string().min(1, "examType is required"),
  date: isoDate,
});

export const studentCsvRowSchema = z.object({
  studentId: z.string().optional(),
  studentName: z.string().min(1, "studentName is required"),
  studentEmail: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "studentEmail must be valid",
    )
    .optional(),
  rollNumber: z.string().min(1, "rollNumber is required"),
  classId: z.string().min(1, "classId is required"),
  parentName: z.string().optional(),
  parentEmail: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "parentEmail must be valid",
    ),
  phone: z.string().optional(),
});

export type MarksCsvRowInput = z.infer<typeof marksCsvRowSchema>;
export type StudentCsvRowInput = z.infer<typeof studentCsvRowSchema>;
