import { z } from "zod";

export const studentFormSchema = z.object({
  studentName: z
    .string()
    .min(1, "Student name is required")
    .max(100, "Name is too long"),
  studentEmail: z
    .string()
    .min(1, "Student email is required")
    .email("Enter a valid student email"),
  rollNumber: z
    .string()
    .min(1, "Roll number is required")
    .max(20, "Roll number is too long"),
  classId: z.string().min(1, "Class is required"),
  parentName: z.string().max(80).optional().or(z.literal("")),
  parentEmail: z
    .string()
    .email("Enter a valid parent email")
    .optional()
    .or(z.literal("")),
});

export const studentEditFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  rollNumber: z.string().min(1, "Roll number is required").max(20),
  grade: z.string().min(1, "Grade is required").max(10),
  section: z.string().min(1, "Section is required").max(5),
  guardianName: z.string().max(80).optional().or(z.literal("")),
  guardianContact: z.string().max(20).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
export type StudentEditFormValues = z.infer<typeof studentEditFormSchema>;

export const GRADE_OPTIONS = ["9", "10", "11", "12"] as const;
export const SECTION_OPTIONS = ["A", "B", "C", "D"] as const;

export const BULK_STUDENT_CSV_HEADERS = [
  "studentName",
  "studentEmail",
  "rollNumber",
  "classId",
  "parentName",
  "parentEmail",
] as const;
