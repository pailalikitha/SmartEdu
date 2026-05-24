"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  School,
  Sparkles,
  Target,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";

const NAV_ICON_MAP: Record<string, LucideIcon> = {
  [ROUTES.student.dashboard]: LayoutDashboard,
  [ROUTES.student.marks]: BarChart3,
  [ROUTES.student.weakTopics]: Target,
  [ROUTES.student.readiness]: Brain,
  [ROUTES.student.studyPlanner]: Calendar,
  [ROUTES.student.attendance]: CalendarCheck,
  [ROUTES.student.profile]: Users,
  [ROUTES.teacher.profile]: Users,
  [ROUTES.parent.dashboard]: LayoutDashboard,
  [ROUTES.parent.profile]: Users,
  [ROUTES.teacher.dashboard]: LayoutDashboard,
  [ROUTES.teacher.attendance]: CalendarCheck,
  [ROUTES.teacher.uploadData]: Upload,
  [ROUTES.teacher.classes]: Users,
  [ROUTES.teacher.students]: GraduationCap,
  [ROUTES.teacher.analytics]: BarChart3,
  [ROUTES.teacher.assistant]: Sparkles,
  [ROUTES.teacher.assignments]: ClipboardList,
  [ROUTES.student.assignments]: ClipboardList,
  [ROUTES.admin.teachers]: GraduationCap,
  [ROUTES.admin.reports]: BarChart3,
  [ROUTES.admin.settings]: School,
  [ROUTES.parent.marks]: BarChart3,
  [ROUTES.parent.attendance]: CalendarCheck,
  [ROUTES.parent.weakTopics]: Target,
  [ROUTES.parent.alerts]: Bell,
  [ROUTES.admin.dashboard]: LayoutDashboard,
  [ROUTES.admin.students]: Users,
  [ROUTES.admin.attendance]: CalendarCheck,
  [ROUTES.admin.classes]: School,
};

export function getNavIcon(href: string): LucideIcon {
  return NAV_ICON_MAP[href] ?? LayoutDashboard;
}
