"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "@/types/attendance";

type AttendanceBreakdownSectionProps = {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number | null;
  attendanceByDate: Record<string, AttendanceRecord["status"]>;
};

const STATUS_COLORS: Record<string, string> = {
  present: "#16a34a",
  absent: "#dc2626",
  late: "#d97706",
  excused: "#6b7280",
};

export function AttendanceBreakdownSection({
  presentCount,
  absentCount,
  lateCount,
  excusedCount,
  attendanceRate,
  attendanceByDate,
}: AttendanceBreakdownSectionProps) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const donutData = useMemo(
    () =>
      [
        { name: "Present", value: presentCount, color: STATUS_COLORS.present },
        { name: "Absent", value: absentCount, color: STATUS_COLORS.absent },
        { name: "Late", value: lateCount, color: STATUS_COLORS.late },
        { name: "Excused", value: excusedCount, color: STATUS_COLORS.excused },
      ].filter((d) => d.value > 0),
    [presentCount, absentCount, lateCount, excusedCount],
  );

  const calendarDays = useMemo(() => {
    const first = new Date(month.year, month.month, 1);
    const last = new Date(month.year, month.month + 1, 0);
    const startPad = first.getDay();
    const days: Array<{ date: string | null; status?: AttendanceRecord["status"] }> =
      [];

    for (let i = 0; i < startPad; i++) days.push({ date: null });
    for (let d = 1; d <= last.getDate(); d++) {
      const date = `${month.year}-${String(month.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ date, status: attendanceByDate[date] });
    }
    return days;
  }, [month, attendanceByDate]);

  const monthLabel = new Date(month.year, month.month, 1).toLocaleString(
    "default",
    { month: "long", year: "numeric" },
  );

  const shiftMonth = (delta: number) => {
    setMonth((m) => {
      const d = new Date(m.year, m.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col items-center">
            {donutData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendance records.</p>
            ) : (
              <div className="h-52 w-full max-w-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                    >
                      {donutData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Rate: {attendanceRate !== null ? `${attendanceRate}%` : "—"}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
              <span>Present: {presentCount}</span>
              <span>Absent: {absentCount}</span>
              <span>Late: {lateCount}</span>
              <span>Excused: {excusedCount}</span>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm font-medium">{monthLabel}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) =>
                day.date ? (
                  <div
                    key={day.date}
                    title={day.status ?? "No record"}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded text-[10px]",
                      day.status === "present" && "bg-success/20 text-success",
                      day.status === "absent" && "bg-destructive/20 text-destructive",
                      day.status === "late" && "bg-warning/20 text-warning",
                      day.status === "excused" && "bg-muted text-muted-foreground",
                      !day.status && "bg-muted/40 text-muted-foreground",
                    )}
                  >
                    {Number(day.date.split("-")[2])}
                  </div>
                ) : (
                  <div key={`pad-${i}`} />
                ),
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
