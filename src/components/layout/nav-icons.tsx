"use client";

import {
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  CalendarCheck,
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
  [ROUTES.teacher.dashboard]: LayoutDashboard,
  [ROUTES.teacher.attendance]: CalendarCheck,
  [ROUTES.teacher.uploadData]: Upload,
  [ROUTES.teacher.classes]: Users,
  [ROUTES.teacher.analytics]: BarChart3,
  [ROUTES.teacher.assistant]: Sparkles,
  [ROUTES.admin.dashboard]: LayoutDashboard,
  [ROUTES.admin.students]: Users,
  [ROUTES.admin.attendance]: CalendarCheck,
  [ROUTES.admin.classes]: School,
  [ROUTES.admin.teachers]: GraduationCap,
  [ROUTES.admin.interventions]: BookOpen,
};

export function getNavIcon(href: string): LucideIcon {
  return NAV_ICON_MAP[href] ?? LayoutDashboard;
}
