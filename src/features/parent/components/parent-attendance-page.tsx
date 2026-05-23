"use client";

import { useMemo } from "react";

import { ChildSelector } from "@/components/parent/child-selector";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useStudentAttendanceSnapshot } from "@/hooks/use-student-attendance-snapshot";
import { getSelectedStudentAuthId, useParentStore } from "@/store/parent-store";
import { cn } from "@/lib/utils";

export function ParentAttendancePage() {
  const studentId = getSelectedStudentAuthId(useParentStore()) ?? undefined;
  const { records, isLoading, error } = useStudentAttendanceSnapshot(studentId);

  const summary = useMemo(() => {
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    return { present, absent, late };
  }, [records]);

  const byDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of records) map.set(r.date, r.status);
    return map;
  }, [records]);

  const monthDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const days: { date: string; status?: string }[] = [];
    for (let d = 1; d <= last.getDate(); d++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ date, status: byDate.get(date) });
    }
    return days;
  }, [byDate]);

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Monthly attendance for your child." />
      <ChildSelector />
      {isLoading ? (
        <LoadingSpinner label="Loading attendance" />
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Present", value: summary.present, color: "bg-success" },
              { label: "Absent", value: summary.absent, color: "bg-destructive" },
              { label: "Late", value: summary.late, color: "bg-warning" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="py-3 text-center">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-semibold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {monthDays.map((day) => (
                  <div
                    key={day.date}
                    className={cn(
                      "rounded-md py-2",
                      day.status === "present" && "bg-success/20 text-success",
                      day.status === "absent" && "bg-destructive/20 text-destructive",
                      day.status === "late" && "bg-warning/20 text-warning",
                      !day.status && "bg-muted/40 text-muted-foreground",
                    )}
                    title={day.date}
                  >
                    {day.date.slice(-2)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
