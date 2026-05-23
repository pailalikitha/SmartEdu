"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ResponsiveTabs } from "@/components/layout/responsive-tabs";
import { useToast } from "@/components/ui/toast";
import { useStudentAssignmentsSnapshot } from "@/hooks/use-student-assignments-snapshot";
import { useStudentProfileSnapshot } from "@/hooks/use-student-profile-snapshot";
import { useAuth } from "@/hooks/use-auth";
import { submitAssignment } from "@/services/assignments.service";
import type { AssignmentWithCounts } from "@/types/assignment";
import {
  formatDueCountdown,
  getDueUrgency,
  PRIORITY_STYLES,
  URGENCY_STYLES,
} from "@/lib/utils/assignment";
import { cn } from "@/lib/utils";
import { getStudentFullName } from "@/types/student";

const TABS = [
  { id: "pending" as const, label: "Pending" },
  { id: "submitted" as const, label: "Submitted" },
  { id: "overdue" as const, label: "Overdue" },
];

function AssignmentCard({
  task,
  onMarkDone,
  marking,
}: {
  task: AssignmentWithCounts;
  onMarkDone: () => void;
  marking: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const urgency = getDueUrgency(task.dueDate, task.hasSubmitted);

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{task.title}</h3>
            <p className="text-sm text-muted-foreground">
              {task.subject}
              {task.teacherName ? ` · ${task.teacherName}` : ""}
            </p>
          </div>
          <Badge className={PRIORITY_STYLES[task.priority]}>{task.priority}</Badge>
        </div>
        <p className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", URGENCY_STYLES[urgency])}>
          {formatDueCountdown(task.dueDate)}
        </p>
        {task.description ? (
          <div>
            <button type="button" className="flex items-center gap-1 text-sm text-primary" onClick={() => setExpanded((v) => !v)}>
              Description
              <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
            </button>
            {expanded ? (
              <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>
            ) : null}
          </div>
        ) : null}
        {!task.hasSubmitted && urgency !== "overdue" ? (
          <Button size="sm" isLoading={marking} onClick={onMarkDone}>
            <Check className="size-4" />
            Mark as Done
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function StudentAssignmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { student, isLoading: profileLoading } = useStudentProfileSnapshot(user?.id);
  const studentId = user?.id;
  const classId = student?.classId;
  const { pending, submitted, overdue, isLoading, error } =
    useStudentAssignmentsSnapshot(studentId, classId);
  const [tab, setTab] = useState<"pending" | "submitted" | "overdue">("pending");
  const [markingId, setMarkingId] = useState<string | null>(null);

  const list =
    tab === "pending" ? pending : tab === "submitted" ? submitted : overdue;

  const handleMarkDone = async (task: AssignmentWithCounts) => {
    if (!studentId || !classId || !student) return;
    setMarkingId(task.id);
    try {
      await submitAssignment(
        classId,
        task.id,
        studentId,
        getStudentFullName(student),
      );
      toast({ title: "Marked as done" });
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Could not submit",
      });
    } finally {
      setMarkingId(null);
    }
  };

  if (profileLoading || isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading assignments" />
      </div>
    );
  }

  if (!classId) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-medium">Join a class first</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete onboarding to see assignments for your class.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Assignments" description="Track pending work and submissions." />
      {error ? (
        <div role="alert" className="text-sm text-destructive">{error}</div>
      ) : null}
      <ResponsiveTabs
        tabs={TABS}
        active={tab}
        onChange={setTab}
        ariaLabel="Assignment status"
      />
      {list.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No assignments in this tab.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((task) => (
            <AssignmentCard
              key={task.id}
              task={task}
              marking={markingId === task.id}
              onMarkDone={() => void handleMarkDone(task)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
