"use client";

import { Calendar, Check, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge, Button, Card, CardContent, Label, Text } from "@/components/ui";
import { AttendanceFiltersBar } from "@/features/attendance/components/attendance-filters";
import {
  filterActiveStudents,
  type AttendanceFilters,
} from "@/features/attendance/utils/attendance-stats";
import {
  toAttendanceQueryFilters,
  toStudentListFilters,
} from "@/features/attendance/utils/query-filters";
import { useAuth } from "@/hooks/use-auth";
import { toDateString } from "@/lib/utils/date";
import {
  bulkUpsertAttendance,
  getAttendanceForDate,
} from "@/services/attendance.service";
import { listStudents } from "@/services/student.service";
import {
  ATTENDANCE_STATUS_LABELS,
  type AttendanceStatus,
} from "@/types/attendance";
import type { Student } from "@/types/student";
import { getStudentClassLabel, getStudentFullName } from "@/types/student";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
  AttendanceStatus,
  { active: string; idle: string }
> = {
  present: {
    active: "bg-success text-white border-success",
    idle: "border-success/30 text-success hover:bg-success/10",
  },
  absent: {
    active: "bg-destructive text-white border-destructive",
    idle: "border-destructive/30 text-destructive hover:bg-destructive/10",
  },
  late: {
    active: "bg-warning text-white border-warning",
    idle: "border-warning/30 text-warning hover:bg-warning/10",
  },
  excused: {
    active: "bg-primary text-primary-foreground border-primary",
    idle: "border-primary/30 text-primary hover:bg-primary/10",
  },
};

const QUICK_STATUSES: AttendanceStatus[] = ["present", "absent", "late"];
const ALL_MARK_STATUSES: AttendanceStatus[] = [
  "present",
  "absent",
  "late",
  "excused",
];

type MarkState = Record<string, AttendanceStatus>;

export function MarkAttendancePanel() {
  const { user } = useAuth();
  const [date, setDate] = useState(() => toDateString(new Date()));
  const [filters, setFilters] = useState<AttendanceFilters>({
    grade: "all",
    section: "all",
    status: "all",
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarkState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredStudents = useMemo(
    () => filterActiveStudents(students, filters.grade, filters.section),
    [students, filters.grade, filters.section],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryFilters = toAttendanceQueryFilters(filters);
      const [studentList, attendance] = await Promise.all([
        listStudents(toStudentListFilters(filters)),
        getAttendanceForDate(date, queryFilters),
      ]);
      setStudents(studentList);

      const initial: MarkState = {};
      for (const record of attendance) {
        initial[record.studentId] = record.status;
      }
      setMarks(initial);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, [date, filters]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
    setSuccess(null);
  };

  const markAll = (status: AttendanceStatus) => {
    const next: MarkState = { ...marks };
    for (const s of filteredStudents) {
      next[s.id] = status;
    }
    setMarks(next);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const inputs = filteredStudents.map((student) => ({
        studentId: student.id,
        studentName: getStudentFullName(student),
        rollNumber: student.rollNumber,
        grade: student.grade,
        section: student.section,
        date,
        status: marks[student.id] ?? "absent",
        markedBy: user?.id,
      }));

      await bulkUpsertAttendance(inputs);
      setSuccess(`Attendance saved for ${inputs.length} students.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save attendance.");
    } finally {
      setIsSaving(false);
    }
  };

  const markedCount = filteredStudents.filter((s) => marks[s.id]).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 py-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2 lg:col-span-1">
              <Label htmlFor="attendance-date">Date</Label>
              <div className="relative">
                <Calendar
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="attendance-date"
                  type="date"
                  value={date}
                  max={toDateString(new Date())}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <AttendanceFiltersBar filters={filters} onChange={setFilters} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
            <Text variant="small" className="mr-2 self-center text-muted-foreground">
              Mark all:
            </Text>
            {QUICK_STATUSES.map((status) => (
              <Button
                key={status}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => markAll(status)}
              >
                {ATTENDANCE_STATUS_LABELS[status]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}
      {success ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success"
        >
          <Check className="size-4 shrink-0" aria-hidden />
          {success}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Text variant="muted">
          {filteredStudents.length} students · {markedCount} marked
        </Text>
        <Button onClick={() => void handleSave()} isLoading={isSaving}>
          <Save className="size-4" aria-hidden />
          Save attendance
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div
            className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            role="status"
            aria-label="Loading"
          />
        </div>
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          title="No students in this class"
          description="Adjust grade/section filters or add students in Student management."
        />
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => {
            const current = marks[student.id];
            return (
              <Card key={student.id} className="overflow-hidden">
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {getStudentFullName(student)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Roll {student.rollNumber} · {getStudentClassLabel(student)}
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                    {ALL_MARK_STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatus(student.id, status)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                          current === status
                            ? STATUS_STYLES[status].active
                            : STATUS_STYLES[status].idle,
                        )}
                      >
                        {ATTENDANCE_STATUS_LABELS[status]}
                      </button>
                    ))}
                    {!current ? (
                      <Badge variant="outline">Unmarked</Badge>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
