"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  School,
  Search,
} from "lucide-react";

import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/constants/routes";
import { useTeacherClassesSnapshot } from "@/features/teacher/hooks/use-teacher-classes-snapshot";
import { useTeacherRosterSnapshot } from "@/features/teacher/hooks/use-teacher-roster-snapshot";
import { averageMarkEntries } from "@/features/teacher/utils/teacher-analytics";
import { useAuth } from "@/hooks/use-auth";
import { calculateAttendancePercent } from "@/services/attendance.service";
import { createClass } from "@/services/classes.service";
import { getMarksStudentId } from "@/services/student.service";
import {
  computeSubjectAverages,
  partitionSubjectsByThreshold,
} from "@/lib/utils/subject-stats";
import { formatPercentage } from "@/lib/utils/format";
import type { ClassRoom } from "@/types/class";
import type { Student } from "@/types/student";
import { getStudentFullName } from "@/types/student";
import { cn } from "@/lib/utils";

function borderColorForAverage(avg: number | null): string {
  if (avg === null) return "border-l-muted-foreground";
  if (avg > 70) return "border-l-success";
  if (avg >= 50) return "border-l-warning";
  return "border-l-destructive";
}

export function TeacherClassesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const teacherId = user?.id;

  const { classes, isLoading, error } = useTeacherClassesSnapshot(teacherId);
  const classIds = useMemo(() => classes.map((c) => c.id), [classes]);
  const roster = useTeacherRosterSnapshot(classIds);

  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    section: "",
    subject: "",
    academicYear: "",
  });
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [search, setSearch] = useState("");
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  const classStats = useMemo(() => {
    const map = new Map<
      string,
      { studentCount: number; avg: number | null; attendance: number | null }
    >();

    for (const cls of classes) {
      const classStudents = roster.students.filter((s) => s.classId === cls.id);
      const scores: number[] = [];
      const attendanceRecords = classStudents.flatMap((s) => {
        const marksId = getMarksStudentId(s);
        const entries = roster.marksByStudent[marksId] ?? [];
        const avg = averageMarkEntries(entries);
        if (avg !== null) scores.push(avg);
        return roster.attendanceByStudent[marksId] ?? [];
      });

      map.set(cls.id, {
        studentCount: classStudents.length,
        avg:
          scores.length > 0
            ? Math.round(
                (scores.reduce((a, b) => a + b, 0) / scores.length) * 10,
              ) / 10
            : null,
        attendance: calculateAttendancePercent(attendanceRecords),
      });
    }

    return map;
  }, [classes, roster.students, roster.marksByStudent, roster.attendanceByStudent]);

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    const q = search.trim().toLowerCase();
    return roster.students
      .filter((s) => s.classId === selectedClass.id)
      .filter((s) => {
        if (!q) return true;
        return getStudentFullName(s).toLowerCase().includes(q);
      });
  }, [roster.students, selectedClass, search]);

  const handleCreate = async () => {
    if (!teacherId) return;
    if (!form.name || !form.section || !form.subject || !form.academicYear) {
      toast({ title: "Fill all class fields.", variant: "error" });
      return;
    }

    setCreating(true);
    try {
      const { classCode } = await createClass({
        ...form,
        teacherId,
      });
      toast({
        title: `Class created! Share code ${classCode} with students`,
      });
      setModalOpen(false);
      setForm({ name: "", section: "", subject: "", academicYear: "" });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Failed to create class.",
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  if (isLoading || roster.isLoading) {
    return <LoadingSpinner label="Loading classes" />;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (selectedClass) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedClass(null);
              setSearch("");
            }}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <div>
            <h1 className="font-heading text-xl font-semibold">
              {selectedClass.name}
              {selectedClass.section ? ` · ${selectedClass.section}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">Class students</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Roll No</th>
                <th className="px-4 py-3 font-medium">Attendance %</th>
                <th className="px-4 py-3 font-medium">Marks Avg</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => {
                const marksId = getMarksStudentId(student);
                const entries = roster.marksByStudent[marksId] ?? [];
                const marksAvg = averageMarkEntries(entries);
                const attendancePct = calculateAttendancePercent(
                  roster.attendanceByStudent[marksId] ?? [],
                );
                const atRisk =
                  (marksAvg !== null && marksAvg < 60) ||
                  (attendancePct !== null && attendancePct < 75);

                return (
                  <tr
                    key={student.id}
                    className="cursor-pointer border-t border-border hover:bg-muted/30"
                    onClick={() => setDetailStudent(student)}
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      {getStudentFullName(student)}
                    </td>
                    <td className="px-4 py-3">{student.rollNumber || "—"}</td>
                    <td className="px-4 py-3">
                      {attendancePct !== null
                        ? formatPercentage(attendancePct)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {marksAvg !== null ? formatPercentage(marksAvg) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={atRisk ? "destructive" : "success"}>
                        {atRisk ? "At Risk" : "Good"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredStudents.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No students in this class yet.
            </p>
          ) : null}
        </div>

        <StudentDetailDialog
          student={detailStudent}
          marksByStudent={roster.marksByStudent}
          attendanceByStudent={roster.attendanceByStudent}
          onClose={() => setDetailStudent(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">My Classes</h1>
          <p className="text-sm text-muted-foreground">
            Manage classes, students, and attendance.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>Create New Class</Button>
      </div>

      {classes.length === 0 ? (
        <EmptyStateCard
          icon={School}
          title="You haven't created any classes yet."
          description="Create a class and share the class code with your students."
          actionLabel="Create Your First Class"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {classes.map((cls) => {
            const stats = classStats.get(cls.id);
            const avg = stats?.avg ?? null;

            return (
              <Card
                key={cls.id}
                className={cn(
                  "border-l-[3px] shadow-sm",
                  borderColorForAverage(avg),
                )}
              >
                <CardContent className="space-y-4 pt-1">
                  <div>
                    <p className="text-xl font-bold">
                      {cls.name}
                      {cls.section ? ` · ${cls.section}` : ""}
                    </p>
                    {cls.subject ? (
                      <p className="text-sm text-muted-foreground">
                        {cls.subject}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-sm text-muted-foreground sm:grid-cols-3">
                    <span>{stats?.studentCount ?? 0} Students</span>
                    <span>
                      Avg:{" "}
                      {avg !== null ? formatPercentage(avg) : "—"}
                    </span>
                    <span>
                      Attendance:{" "}
                      {stats?.attendance !== null && stats?.attendance !== undefined
                        ? formatPercentage(stats.attendance)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClass(cls)}
                    >
                      View Students
                    </Button>
                    <Link href={ROUTES.teacher.attendance}>
                      <Button variant="secondary" size="sm" type="button">
                        Take Attendance
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-4 pb-2">
            <FormField label="Class Name">
              <Input
                placeholder="Grade 10"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Section">
              <Input
                placeholder="A"
                value={form.section}
                onChange={(e) =>
                  setForm((f) => ({ ...f, section: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Subject">
              <Input
                placeholder="Mathematics"
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Academic Year">
              <Input
                placeholder="2025-26"
                value={form.academicYear}
                onChange={(e) =>
                  setForm((f) => ({ ...f, academicYear: e.target.value }))
                }
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} isLoading={creating}>
              Create Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StudentDetailDialog({
  student,
  marksByStudent,
  attendanceByStudent,
  onClose,
}: {
  student: Student | null;
  marksByStudent: Record<string, import("@/types/student-marks").StudentMarkEntry[]>;
  attendanceByStudent: Record<string, import("@/types/attendance").AttendanceRecord[]>;
  onClose: () => void;
}) {
  if (!student) return null;

  const marksId = getMarksStudentId(student);
  const entries = marksByStudent[marksId] ?? [];
  const subjects = computeSubjectAverages(entries);
  const { weak } = partitionSubjectsByThreshold(subjects);
  const attendancePct = calculateAttendancePercent(
    attendanceByStudent[marksId] ?? [],
  );
  const present =
    (attendanceByStudent[marksId] ?? []).filter((r) => r.status === "present")
      .length;
  const total = (attendanceByStudent[marksId] ?? []).length;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{getStudentFullName(student)}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-4 pb-4 text-sm">
          <div>
            <p className="font-medium">Attendance</p>
            <p className="text-muted-foreground">
              {total > 0
                ? `${present} / ${total} present (${attendancePct !== null ? formatPercentage(attendancePct) : "—"})`
                : "No attendance records yet."}
            </p>
          </div>
          <div>
            <p className="mb-2 font-medium">Marks by subject</p>
            {subjects.length === 0 ? (
              <p className="text-muted-foreground">No marks uploaded.</p>
            ) : (
              <ul className="space-y-1">
                {subjects.map((s) => (
                  <li
                    key={s.subject}
                    className="flex justify-between border-b border-border py-1"
                  >
                    <span>{s.subject}</span>
                    <span>{formatPercentage(s.average)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {weak.length > 0 ? (
            <div>
              <p className="mb-1 font-medium text-destructive">Weak topics</p>
              <p className="text-muted-foreground">
                {weak.map((w) => w.subject).join(", ")}
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
