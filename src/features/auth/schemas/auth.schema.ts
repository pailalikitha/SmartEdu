import { z } from "zod";

import { USER_ROLES } from "@/constants/roles";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  roleTab: z.enum(["student", "teacher", "admin", "parent"]),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
  role: z.enum([
    USER_ROLES.student,
    USER_ROLES.teacher,
    USER_ROLES.admin,
    USER_ROLES.principal,
    USER_ROLES.parent,
  ]),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
