import { ROUTES } from "@/constants/routes";
import type { UserRole } from "@/constants/roles";

export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.student.dashboard },
  { label: "Marks", href: ROUTES.student.marks },
  { label: "Weak Topics", href: ROUTES.student.weakTopics },
  { label: "Readiness", href: ROUTES.student.readiness },
  { label: "Study Planner", href: ROUTES.student.studyPlanner },
];

export const TEACHER_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.teacher.dashboard },
  { label: "Attendance", href: ROUTES.teacher.attendance },
  { label: "Classes", href: ROUTES.teacher.classes },
  { label: "Analytics", href: ROUTES.teacher.analytics },
  { label: "AI Assistant", href: ROUTES.teacher.assistant },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.admin.dashboard },
  { label: "Students", href: ROUTES.admin.students },
  { label: "Attendance", href: ROUTES.admin.attendance },
  { label: "Classes", href: ROUTES.admin.classes },
  { label: "Teachers", href: ROUTES.admin.teachers },
  { label: "Interventions", href: ROUTES.admin.interventions },
];

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  student: STUDENT_NAV,
  teacher: TEACHER_NAV,
  principal: ADMIN_NAV,
};
