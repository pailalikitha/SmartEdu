import {
  Award,
  BookOpen,
  Calendar,
  TrendingUp,
} from "lucide-react";

import type {
  Activity,
  ChartPoint,
  StatCardData,
} from "@/types/dashboard";

export type { Activity, ChartPoint, StatCardData };

export const OVERVIEW_STATS: StatCardData[] = [
  {
    id: "overall",
    title: "Overall Score",
    value: "78.4%",
    change: "+4.2% vs last term",
    trend: "up",
    icon: TrendingUp,
    accent: "blue",
  },
  {
    id: "attendance",
    title: "Attendance",
    value: "94%",
    change: "Above class average",
    trend: "up",
    icon: Calendar,
    accent: "blue",
  },
  {
    id: "weak",
    title: "Weak Topics",
    value: "3",
    change: "2 need attention",
    trend: "down",
    icon: BookOpen,
    accent: "yellow",
  },
  {
    id: "readiness",
    title: "JEE Readiness",
    value: "72%",
    change: "+6% this month",
    trend: "up",
    icon: Award,
    accent: "yellow",
  },
];

export const PERFORMANCE_CHART: ChartPoint[] = [
  { label: "Aug", value: 62 },
  { label: "Sep", value: 68 },
  { label: "Oct", value: 71 },
  { label: "Nov", value: 74 },
  { label: "Dec", value: 72 },
  { label: "Jan", value: 78 },
];

export const SUBJECT_BREAKDOWN: ChartPoint[] = [
  { label: "Math", value: 82 },
  { label: "Physics", value: 76 },
  { label: "Chem", value: 74 },
  { label: "Bio", value: 85 },
  { label: "Eng", value: 88 },
];

export const RECENT_ACTIVITY: Activity[] = [
  {
    id: "1",
    title: "Mid-term marks published",
    description: "Physics scored 76% — improved from 68%",
    time: "2h ago",
    type: "exam",
  },
  {
    id: "2",
    title: "Weak topic detected",
    description: "Organic Chemistry Ch. 5 flagged for review",
    time: "5h ago",
    type: "alert",
  },
  {
    id: "3",
    title: "Study plan updated",
    description: "AI revised your weekly schedule for NEET prep",
    time: "Yesterday",
    type: "plan",
  },
  {
    id: "4",
    title: "7-day study streak",
    description: "All planned sessions completed this week",
    time: "2d ago",
    type: "achievement",
  },
  {
    id: "5",
    title: "Unit test scheduled",
    description: "Mathematics — 28 Jan, 10:00 AM",
    time: "3d ago",
    type: "exam",
  },
];
