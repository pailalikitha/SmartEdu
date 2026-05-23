import type { UserRole } from "@/constants/roles";

export type User = {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  schoolId?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export type PageMeta = {
  title: string;
  description?: string;
};
