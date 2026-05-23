"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ChildSelector } from "@/components/parent/child-selector";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useParentChildrenSnapshot } from "@/hooks/use-parent-children-snapshot";
import { useStudentAssignmentsSnapshot } from "@/hooks/use-student-assignments-snapshot";
import { useStudentAttendanceSnapshot } from "@/hooks/use-student-attendance-snapshot";
import { useStudentMarksSnapshot } from "@/hooks/use-student-marks-snapshot";
import { useAuth } from "@/hooks/use-auth";
import {
  getSelectedChild,
  getSelectedStudentAuthId,
  useParentStore,
} from "@/store/parent-store";
import { calculateAttendancePercent } from "@/services/attendance.service";
import { computeMarksSummary } from "@/features/student/marks/utils/marks-stats";
import { computeSubjectAverages } from "@/lib/utils/subject-stats";
import { formatPercentage } from "@/lib/utils/format";

export function ParentDashboardPage() {
  const { user } = useAuth();
  const { isLoading: childrenLoading, error } = useParentChildrenSnapshot(
    user?.email,
  );
  const store = useParentStore();
  const child = getSelectedChild(store);
  const studentId = getSelectedStudentAuthId(store) ?? undefined;

  const marks = useStudentMarksSnapshot(studentId);
  const attendance = useStudentAttendanceSnapshot(studentId);
  const assignments = useStudentAssignmentsSnapshot(
    studentId,
    child?.classId,
  );

  const marksSummary = computeMarksSummary(marks.entries);
  const subjects = computeSubjectAverages(marks.entries);
  const weakCount = subjects.filter((s) => s.average < 60).length;
  const attendancePct = calculateAttendancePercent(attendance.records);
  const pendingCount = assignments.pending.length;

  if (childrenLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading children" />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-medium">No linked students</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No student records match your email as parent contact.
        </p>
      </div>
    );
  }

  const avg = marksSummary?.overallAverage ?? null;
  const good =
    avg !== null &&
    avg > 70 &&
    attendancePct !== null &&
    attendancePct > 75;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parent dashboard"
        description="Read-only view of your child's progress."
      />
      <ChildSelector />
      {error ? (
        <div role="alert" className="text-sm text-destructive">{error}</div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Attendance",
            value:
              attendancePct !== null ? formatPercentage(attendancePct) : "—",
          },
          {
            label: "Marks average",
            value: avg !== null ? formatPercentage(avg) : "—",
          },
          { label: "Weak subjects", value: String(weakCount) },
          { label: "Pending assignments", value: String(pendingCount) },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className={good ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}>
        <CardContent className="py-4 text-sm">
          {good
            ? `${child.firstName} is performing well with strong attendance and marks.`
            : `${child.firstName} may need attention — review marks, attendance, or pending assignments.`}
        </CardContent>
      </Card>
    </div>
  );
}
