"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useStudentAttendanceSnapshot } from "@/hooks/use-student-attendance-snapshot";
import { useAuth } from "@/hooks/use-auth";
import { calculateAttendancePercent } from "@/services/attendance.service";
import { formatPercentage } from "@/lib/utils/format";

export function StudentAttendancePage() {
  const { user } = useAuth();
  const { records, isLoading, error } = useStudentAttendanceSnapshot(user?.id);
  const percent = calculateAttendancePercent(records);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading attendance" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Your attendance record across all marked days."
      />

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <Card>
        <CardContent className="py-5">
          <p className="text-sm text-muted-foreground">Overall attendance</p>
          <p className="mt-1 text-3xl font-semibold">
            {percent !== null ? formatPercentage(percent) : "—"}
          </p>
        </CardContent>
      </Card>

      {records.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
          No attendance records yet. Your teacher will mark attendance soon.
        </div>
      ) : (
        <ul className="space-y-2">
          {[...records]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((record) => (
              <li
                key={record.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <span className="text-sm font-medium">{record.date}</span>
                <Badge
                  variant={record.status === "present" ? "default" : "destructive"}
                >
                  {record.status}
                </Badge>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
