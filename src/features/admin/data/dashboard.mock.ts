import {
  AlertTriangle,
  GraduationCap,
  School,
  Users,
} from "lucide-react";

import type { Activity, ChartPoint, StatCardData } from "@/types/dashboard";

export const ADMIN_OVERVIEW_STATS: StatCardData[] = [
  {
    id: "students",
    title: "Total Students",
    value: "842",
    change: "+12 this term",
    trend: "up",
    icon: GraduationCap,
    accent: "blue",
  },
  {
    id: "avg",
    title: "School Average",
    value: "71.8%",
    change: "+1.4% YoY",
    trend: "up",
    icon: School,
    accent: "blue",
  },
  {
    id: "at-risk",
    title: "At-Risk",
    value: "47",
    change: "Across 8 classes",
    trend: "down",
    icon: AlertTriangle,
    accent: "yellow",
  },
  {
    id: "teachers",
    title: "Teachers",
    value: "38",
    change: "All departments staffed",
    trend: "neutral",
    icon: Users,
    accent: "yellow",
  },
];

export const ADMIN_SCHOOL_PERFORMANCE: ChartPoint[] = [
  { label: "2020", value: 65 },
  { label: "2021", value: 67 },
  { label: "2022", value: 69 },
  { label: "2023", value: 70 },
  { label: "2024", value: 71 },
  { label: "2025", value: 72 },
];

export const ADMIN_GRADE_BREAKDOWN: ChartPoint[] = [
  { label: "G9", value: 68 },
  { label: "G10", value: 72 },
  { label: "G11", value: 74 },
  { label: "G12", value: 76 },
];

export const ADMIN_RECENT_ACTIVITY: Activity[] = [
  {
    id: "a1",
    title: "Intervention recommended",
    description: "Class 10-C — 6 students flagged for support",
    time: "30m ago",
    type: "alert",
  },
  {
    id: "a2",
    title: "Term report generated",
    description: "School-wide analytics ready for review",
    time: "3h ago",
    type: "exam",
  },
  {
    id: "a3",
    title: "Teacher review due",
    description: "Quarterly effectiveness reports — 5 pending",
    time: "Yesterday",
    type: "plan",
  },
  {
    id: "a4",
    title: "Best performing class",
    description: "12-A leads with 81.2% school average",
    time: "2d ago",
    type: "achievement",
  },
];
