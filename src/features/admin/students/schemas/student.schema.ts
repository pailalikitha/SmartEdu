import { z } from "zod";

export const studentFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  rollNumber: z
    .string()
    .min(1, "Roll number is required")
    .max(20, "Roll number is too long"),
  grade: z.string().min(1, "Grade is required").max(10),
  section: z.string().min(1, "Section is required").max(5),
  guardianName: z.string().max(80).optional().or(z.literal("")),
  guardianContact: z.string().max(20).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;

export const GRADE_OPTIONS = ["9", "10", "11", "12"] as const;
export const SECTION_OPTIONS = ["A", "B", "C", "D"] as const;
