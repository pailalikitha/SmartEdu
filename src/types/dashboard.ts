import type { LucideIcon } from "lucide-react";

import type { Activity } from "@/components/dashboard/recent-activity";

export type StatCardData = {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  accent?: "blue" | "yellow";
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type { Activity };
