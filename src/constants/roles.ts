export const USER_ROLES = {
  student: "student",
  teacher: "teacher",
  admin: "admin",
  principal: "principal",
  parent: "parent",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const LOGIN_ROLE_TABS = {
  student: "student",
  teacher: "teacher",
  admin: "admin",
  parent: "parent",
} as const;

export type LoginRoleTab = keyof typeof LOGIN_ROLE_TABS;

export function loginTabToUserRole(tab: LoginRoleTab): UserRole {
  return LOGIN_ROLE_TABS[tab];
}

export const ADMIN_ROLES: UserRole[] = [
  USER_ROLES.admin,
  USER_ROLES.principal,
];

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
  principal: "Admin",
  parent: "Parent",
};
