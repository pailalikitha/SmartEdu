import { ROUTES } from "@/constants/routes";
import type { UserRole } from "@/constants/roles";
import { USER_ROLES } from "@/constants/roles";

export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.student.dashboard },
  { label: "Marks", href: ROUTES.student.marks },
  { label: "Assignments", href: ROUTES.student.assignments },
  { label: "Attendance", href: ROUTES.student.attendance },
  { label: "Weak Topics", href: ROUTES.student.weakTopics },
  { label: "Readiness", href: ROUTES.student.readiness },
  { label: "Study Planner", href: ROUTES.student.studyPlanner },
];

export const TEACHER_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.teacher.dashboard },
  { label: "Assignments", href: ROUTES.teacher.assignments },
  { label: "Attendance", href: ROUTES.teacher.attendance },
  { label: "Upload Data", href: ROUTES.teacher.uploadData },
  { label: "Classes", href: ROUTES.teacher.classes },
  { label: "Students", href: ROUTES.teacher.students },
  { label: "Analytics", href: ROUTES.teacher.analytics },
  { label: "AI Assistant", href: ROUTES.teacher.assistant },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.admin.dashboard },
  { label: "Teachers", href: ROUTES.admin.teachers },
  { label: "Students", href: ROUTES.admin.students },
  { label: "Classes", href: ROUTES.admin.classes },
  { label: "Reports", href: ROUTES.admin.reports },
  { label: "Settings", href: ROUTES.admin.settings },
];

export const PARENT_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.parent.dashboard },
  { label: "Marks", href: ROUTES.parent.marks },
  { label: "Attendance", href: ROUTES.parent.attendance },
  { label: "Weak Topics", href: ROUTES.parent.weakTopics },
  { label: "Alert Settings", href: ROUTES.parent.alerts },
];

export const PROFILE_HREF_BY_ROLE: Record<UserRole, string | null> = {
  student: ROUTES.student.profile,
  teacher: ROUTES.teacher.profile,
  parent: ROUTES.parent.profile,
  admin: null,
  principal: null,
};

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  student: STUDENT_NAV,
  teacher: TEACHER_NAV,
  admin: ADMIN_NAV,
  principal: ADMIN_NAV,
  parent: PARENT_NAV,
};
