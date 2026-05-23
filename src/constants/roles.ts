export const USER_ROLES = {
  student: "student",
  teacher: "teacher",
  principal: "principal",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  teacher: "Teacher",
  principal: "Principal",
};
