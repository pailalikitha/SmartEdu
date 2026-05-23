"use client";

import { Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button, Card, CardContent, Text } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { AttendanceStatusButtons } from "@/features/teacher/attendance/components/attendance-status-buttons";
import {
  getClassAttendanceForDate,
  saveClassAttendanceBatch,
} from "@/services/class-attendance.service";
import { listStudentsByClassIds } from "@/services/student.service";
import type { ClassAttendanceStatus } from "@/types/class-attendance";
import type { Student } from "@/types/student";
import { getStudentFullName } from "@/types/student";

type AttendanceMarkingPanelProps = {
  classId: string;
  className: string;
  date: string;
  teacherId: string;
  loadToken: number;
};

type MarkState = Record<string, ClassAttendanceStatus | undefined>;

export function AttendanceMarkingPanel({
  classId,
  className,
  date,
  teacherId,
  loadToken,
}: AttendanceMarkingPanelProps) {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarkState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadStudents = useCallback(async () => {
    if (!classId) return;

    setIsLoading(true);
    try {
      const [studentList, existing] = await Promise.all([
        listStudentsByClassIds([classId]),
        getClassAttendanceForDate(date, classId),
      ]);

      setStudents(studentList);

      const initial: MarkState = {};
      for (const record of existing) {
        initial[record.studentId] = record.status;
      }
      setMarks(initial);
    } catch (err) {
      toast({
        variant: "error",
        title:
          err instanceof Error ? err.message : "Failed to load students.",
      });
      setStudents([]);
      setMarks({});
    } finally {
      setIsLoading(false);
    }
  }, [classId, date, toast]);

  useEffect(() => {
    if (loadToken > 0) void loadStudents();
  }, [loadToken, loadStudents]);

  const setStatus = (studentId: string, status: ClassAttendanceStatus) => {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    const unmarked = students.filter((s) => !marks[s.id]);
    if (unmarked.length > 0) {
      toast({
        variant: "error",
        title: `Mark attendance for all students (${unmarked.length} unmarked).`,
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveClassAttendanceBatch(
        students.map((student) => ({
          studentId: student.id,
          studentName: getStudentFullName(student),
          classId,
          teacherId,
          date,
          status: marks[student.id]!,
        })),
      );
      toast({ title: "Attendance saved successfully" });
    } catch (err) {
      toast({
        variant: "error",
        title:
          err instanceof Error ? err.message : "Failed to save attendance.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div
          className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Loading students"
        />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <EmptyState
        title="No students in this class"
        description={`Add students with classId "${classId}" or upload a student list.`}
      />
    );
  }

  const markedCount = students.filter((s) => marks[s.id]).length;

  return (
    <div className="space-y-4 pb-24">
      <Text variant="muted">
        {className} · {date} · {markedCount}/{students.length} marked
      </Text>

      <div className="space-y-3">
        {students.map((student) => (
          <Card key={student.id}>
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {getStudentFullName(student)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Roll {student.rollNumber}
                </p>
              </div>
              <AttendanceStatusButtons
                value={marks[student.id]}
                onChange={(status) => setStatus(student.id, status)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="safe-pb fixed right-0 bottom-0 left-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-md lg:left-60">
        <div className="mx-auto flex max-w-3xl justify-end">
          <Button
            type="button"
            size="lg"
            isLoading={isSaving}
            onClick={() => void handleSave()}
            className="w-full sm:w-auto"
          >
            <Save className="size-4" aria-hidden />
            Save Attendance
          </Button>
        </div>
      </div>
    </div>
  );
}
