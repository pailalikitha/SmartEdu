import type { Assignment } from "@/types/assignment";

export type DueUrgency = "ok" | "soon" | "overdue";

export function getDueUrgency(dueDate: Date, hasSubmitted?: boolean): DueUrgency {
  if (hasSubmitted) return "ok";
  const ms = dueDate.getTime() - Date.now();
  if (ms < 0) return "overdue";
  const twoDays = 2 * 24 * 60 * 60 * 1000;
  if (ms < twoDays) return "soon";
  return "ok";
}

export function formatDueCountdown(dueDate: Date): string {
  const ms = dueDate.getTime() - Date.now();
  if (ms < 0) {
    const days = Math.ceil(Math.abs(ms) / (24 * 60 * 60 * 1000));
    return `${days} day${days === 1 ? "" : "s"} overdue`;
  }
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours < 48) {
    return hours <= 1 ? "Due in less than 1 hour" : `Due in ${hours} hours`;
  }
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  return `Due in ${days} day${days === 1 ? "" : "s"}`;
}

export const URGENCY_STYLES: Record<DueUrgency, string> = {
  ok: "text-success border-success/30 bg-success/5",
  soon: "text-warning border-warning/30 bg-warning/5",
  overdue: "text-destructive border-destructive/30 bg-destructive/5",
};

export const PRIORITY_STYLES: Record<Assignment["priority"], string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-destructive/10 text-destructive",
};
