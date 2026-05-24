"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentClassLabel } from "@/types/student";
import type { Student } from "@/types/student";

type ClassHistorySectionProps = {
  student: Student;
};

export function ClassHistorySection({ student }: ClassHistorySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class history</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <p>
          <span className="text-muted-foreground">Current class: </span>
          {getStudentClassLabel(student)}
          {student.classId ? ` (${student.classId})` : ""}
        </p>
        <p className="mt-2 text-muted-foreground">
          Previous class records will appear here when class transfers are logged.
        </p>
      </CardContent>
    </Card>
  );
}
