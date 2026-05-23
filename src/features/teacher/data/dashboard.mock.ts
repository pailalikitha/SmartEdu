import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Users,
} from "lucide-react";

import type { Activity, ChartPoint, StatCardData } from "@/types/dashboard";

export const TEACHER_OVERVIEW_STATS: StatCardData[] = [
  {
    id: "classes",
    title: "Classes",
    value: "4",
    change: "32 students total",
    trend: "neutral",
    icon: BookOpen,
    accent: "blue",
  },
  {
    id: "avg",
    title: "Class Average",
    value: "74.2%",
    change: "+2.1% this term",
    trend: "up",
    icon: BarChart3,
    accent: "blue",
  },
  {
    id: "at-risk",
    title: "At-Risk Students",
    value: "5",
    change: "Needs intervention",
    trend: "down",
    icon: AlertTriangle,
    accent: "yellow",
  },
  {
    id: "attendance",
    title: "Avg Attendance",
    value: "91%",
    change: "Stable vs last month",
    trend: "up",
    icon: Users,
    accent: "yellow",
  },
];

export const TEACHER_CLASS_PERFORMANCE: ChartPoint[] = [
  { label: "10-A", value: 78 },
  { label: "10-B", value: 72 },
  { label: "11-A", value: 81 },
  { label: "11-B", value: 69 },
  { label: "12-A", value: 76 },
  { label: "12-B", value: 74 },
];

export const TEACHER_SUBJECT_SCORES: ChartPoint[] = [
  { label: "Unit 1", value: 70 },
  { label: "Unit 2", value: 74 },
  { label: "Mid", value: 72 },
  { label: "Quiz", value: 78 },
  { label: "Lab", value: 85 },
];

export const TEACHER_RECENT_ACTIVITY: Activity[] = [
  {
    id: "t1",
    title: "Class 11-A alert",
    description: "3 students below 40% in Physics unit test",
    time: "1h ago",
    type: "alert",
  },
  {
    id: "t2",
    title: "Marks imported",
    description: "Mid-term scores synced for Class 10-B",
    time: "4h ago",
    type: "exam",
  },
  {
    id: "t3",
    title: "Lesson plan saved",
    description: "AI-generated plan for Electromagnetism",
    time: "Yesterday",
    type: "plan",
  },
  {
    id: "t4",
    title: "Top improver",
    description: "Riya Sharma +12% over last 3 exams",
    time: "2d ago",
    type: "achievement",
  },
];
