"use client";

import Link from "next/link";
import { GraduationCap, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ROUTES } from "@/constants/routes";
import { useTeacherClassesSnapshot } from "@/features/teacher/hooks/use-teacher-classes-snapshot";
import { useTeacherRosterSnapshot } from "@/features/teacher/hooks/use-teacher-roster-snapshot";
import {
  averageMarkEntries,
} from "@/features/teacher/utils/teacher-analytics";
import {
  getPerformanceBorderClass,
} from "@/features/student-analytics/utils/performance";
import { useAuth } from "@/hooks/use-auth";
import { calculateAttendancePercent } from "@/services/attendance.service";
import { getMarksStudentId } from "@/services/student.service";
import {
  computeSubjectAverages,
  partitionSubjectsByThreshold,
} from "@/lib/utils/subject-stats";
import { formatPercentage } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import {
  getStudentClassLabel,
  getStudentFullName,
} from "@/types/student";
import type { Student } from "@/types/student";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type StudentCardStats = {
  student: Student;
  classLabel: string;
  avg: number | null;
  attendance: number | null;
  weakCount: number;
};

export function TeacherStudentsPage() {
  const { user } = useAuth();
  const [classFilter, setClassFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { classes, isLoading: loadingClasses } = useTeacherClassesSnapshot(
    user?.id,
  );
  const classIds = useMemo(() => classes.map((c) => c.id), [classes]);
  const roster = useTeacherRosterSnapshot(classIds);

  const classNameById = useMemo(
    () => new Map(classes.map((c) => [c.id, c.name])),
    [classes],
  );

  const cards = useMemo((): StudentCardStats[] => {
    return roster.students.map((student) => {
      const marksId = getMarksStudentId(student);
      const entries = roster.marksByStudent[marksId] ?? [];
      const attendance = roster.attendanceByStudent[marksId] ?? [];
      const subjects = computeSubjectAverages(entries);
      const { weak } = partitionSubjectsByThreshold(subjects, 70);

      return {
        student,
        classLabel: student.classId
          ? (classNameById.get(student.classId) ?? getStudentClassLabel(student))
          : getStudentClassLabel(student),
        avg: averageMarkEntries(entries),
        attendance: calculateAttendancePercent(attendance),
        weakCount: weak.length,
      };
    });
  }, [roster.students, roster.marksByStudent, roster.attendanceByStudent, classNameById]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((card) => {
      if (classFilter !== "all" && card.student.classId !== classFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        getStudentFullName(card.student),
        card.student.rollNumber,
        card.classLabel,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [cards, classFilter, search]);

  const isLoading = loadingClasses || roster.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="View performance summaries and open individual student dashboards."
      />

      <Card>
        <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="class-filter">Class</Label>
            <select
              id="class-filter"
              className="flex h-10 w-full max-w-xs rounded-lg border border-input bg-card px-3 text-sm"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="all">All classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search by name or roll number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9"
              aria-label="Search students"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner label="Loading students" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No students found"
          description={
            search || classFilter !== "all"
              ? "Try adjusting your search or class filter."
              : "Students appear here once assigned to your classes."
          }
          icon={<GraduationCap className="size-10" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((card) => (
            <article
              key={card.student.id}
              className={cn(
                "rounded-xl border-2 bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
                getPerformanceBorderClass(card.avg),
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {getInitials(getStudentFullName(card.student))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{getStudentFullName(card.student)}</p>
                  <p className="text-sm text-muted-foreground">
                    Roll {card.student.rollNumber} · {card.classLabel}
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <dt className="text-muted-foreground">Avg</dt>
                  <dd className="font-semibold">
                    {card.avg !== null ? formatPercentage(card.avg) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Attendance</dt>
                  <dd className="font-semibold">
                    {card.attendance !== null
                      ? formatPercentage(card.attendance)
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Weak</dt>
                  <dd className="font-semibold">{card.weakCount}</dd>
                </div>
              </dl>
              <Link
                href={ROUTES.teacher.studentDetail(card.student.id)}
                className="mt-4 inline-flex h-8 w-full items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                View dashboard
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
