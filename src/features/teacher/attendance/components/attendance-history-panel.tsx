"use client";

import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button, Card, CardContent, Label, Text } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { listClassesByTeacher } from "@/services/classes.service";
import { getClassAttendanceHistory } from "@/services/class-attendance.service";
import {
  CLASS_ATTENDANCE_SHORT,
  type ClassAttendanceStatus,
} from "@/types/class-attendance";
import type { ClassRoom } from "@/types/class";
import type { Student } from "@/types/student";
import { listStudentsByClassIds } from "@/services/student.service";
import { getStudentFullName } from "@/types/student";
import { toDateString } from "@/lib/utils/date";
import { exportAttendanceToExcel } from "@/lib/utils/export";
import { Download } from "lucide-react";

const PAGE_SIZE = 15;

type GridCell = ClassAttendanceStatus | undefined;

function buildDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  while (cursor <= endDate) {
    dates.push(toDateString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function AttendanceHistoryPanel({ teacherId }: { teacherId: string }) {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [classId, setClassId] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return toDateString(d);
  });
  const [endDate, setEndDate] = useState(() => toDateString(new Date()));
  const [students, setStudents] = useState<Student[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [grid, setGrid] = useState<Record<string, Record<string, GridCell>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);

  const loadClasses = useCallback(async () => {
    try {
      const data = await listClassesByTeacher(teacherId);
      setClasses(data);
      if (data[0] && !classId) setClassId(data[0].id);
    } catch {
      setClasses([]);
    }
  }, [teacherId, classId]);

  useEffect(() => {
    void loadClasses();
  }, [loadClasses]);

  const handleLoadHistory = async () => {
    if (!classId) {
      toast({ variant: "error", title: "Select a class first." });
      return;
    }

    setIsLoading(true);
    setPage(0);
    try {
      const [studentList, records] = await Promise.all([
        listStudentsByClassIds([classId]),
        getClassAttendanceHistory(classId, startDate, endDate),
      ]);

      const dateList = buildDateRange(startDate, endDate);
      const nextGrid: Record<string, Record<string, GridCell>> = {};

      for (const student of studentList) {
        nextGrid[student.id] = {};
        for (const d of dateList) nextGrid[student.id][d] = undefined;
      }

      for (const record of records) {
        if (!nextGrid[record.studentId]) {
          nextGrid[record.studentId] = {};
        }
        nextGrid[record.studentId][record.date] = record.status;
      }

      setStudents(studentList);
      setDates(dateList);
      setGrid(nextGrid);
    } catch (err) {
      toast({
        variant: "error",
        title:
          err instanceof Error ? err.message : "Failed to load history.",
      });
      setStudents([]);
      setDates([]);
      setGrid({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    const selectedClass = classes.find(c => c.id === classId);
    const name = selectedClass ? selectedClass.name : "Class";
    const filename = `Attendance_${name}_${startDate}_to_${endDate}.xlsx`;
    
    try {
      await exportAttendanceToExcel(students, dates, grid, name, filename);
    } catch (err) {
      toast({
        variant: "error",
        title: "Export failed.",
      });
    }
  };

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const pageStudents = students.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 py-5 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="history-class">Class</Label>
            <select
              id="history-class"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="history-start">From</Label>
            <input
              id="history-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="history-end">To</Label>
            <input
              id="history-end"
              type="date"
              value={endDate}
              max={toDateString(new Date())}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-2 justify-end sm:flex-row">
            <Button
              type="button"
              className="h-10 w-full sm:w-auto"
              isLoading={isLoading}
              onClick={() => void handleLoadHistory()}
            >
              Load history
            </Button>
            {students.length > 0 && dates.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full sm:w-auto"
                onClick={() => void handleExportExcel()}
              >
                <Download className="size-4" aria-hidden />
                Export
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div
            className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            role="status"
            aria-label="Loading history"
          />
        </div>
      ) : students.length === 0 || dates.length === 0 ? (
        <EmptyState
          title="No history loaded"
          description="Select a class and date range, then load history."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left font-medium">
                    Student
                  </th>
                  {dates.map((d) => (
                    <th
                      key={d}
                      className="px-2 py-2 text-center text-xs font-medium whitespace-nowrap text-muted-foreground"
                    >
                      {d.slice(5)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border/60">
                    <td className="sticky left-0 z-10 bg-card px-3 py-2 font-medium">
                      <span className="block">{getStudentFullName(student)}</span>
                      <span className="text-xs text-muted-foreground">
                        {student.rollNumber}
                      </span>
                    </td>
                    {dates.map((d) => {
                      const status = grid[student.id]?.[d];
                      return (
                        <td key={d} className="px-2 py-2 text-center">
                          <span
                            className={
                              status
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {status ? CLASS_ATTENDANCE_SHORT[status] : "—"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <Text variant="small" className="text-muted-foreground">
                Page {page + 1} of {totalPages}
              </Text>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
