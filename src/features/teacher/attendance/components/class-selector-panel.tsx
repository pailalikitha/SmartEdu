"use client";

import { Calendar, Loader2 } from "lucide-react";

import { Button, Card, CardContent, Label } from "@/components/ui";
import type { ClassRoom } from "@/types/class";
import { toDateString } from "@/lib/utils/date";

type ClassSelectorPanelProps = {
  classes: ClassRoom[];
  isLoadingClasses: boolean;
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  date: string;
  onDateChange: (date: string) => void;
  onLoadStudents: () => void;
  isLoadingStudents: boolean;
};

export function ClassSelectorPanel({
  classes,
  isLoadingClasses,
  selectedClassId,
  onClassChange,
  date,
  onDateChange,
  onLoadStudents,
  isLoadingStudents,
}: ClassSelectorPanelProps) {
  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="teacher-class-select">Class</Label>
            <select
              id="teacher-class-select"
              value={selectedClassId}
              onChange={(e) => onClassChange(e.target.value)}
              disabled={isLoadingClasses || classes.length === 0}
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">
                {isLoadingClasses
                  ? "Loading classes..."
                  : classes.length === 0
                    ? "No classes assigned"
                    : "Select a class"}
              </option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher-attendance-date">Date</Label>
            <div className="relative">
              <Calendar
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                id="teacher-attendance-date"
                type="date"
                value={date}
                max={toDateString(new Date())}
                onChange={(e) => onDateChange(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              className="h-10 w-full"
              disabled={!selectedClassId || isLoadingStudents}
              onClick={onLoadStudents}
            >
              {isLoadingStudents ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Loading...
                </>
              ) : (
                "Load Students"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
