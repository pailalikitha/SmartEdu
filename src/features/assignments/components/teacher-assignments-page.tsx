"use client";

import { Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { useTeacherAssignmentsSnapshot } from "@/hooks/use-teacher-assignments-snapshot";
import { useTeacherClassesSnapshot } from "@/features/teacher/hooks/use-teacher-classes-snapshot";
import { useAuth } from "@/hooks/use-auth";
import {
  createAssignment,
  deleteAssignment,
  listSubmissions,
} from "@/services/assignments.service";
import type { AssignmentPriority, AssignmentWithCounts } from "@/types/assignment";
import { PRIORITY_STYLES } from "@/lib/utils/assignment";

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Computer Science",
];

export function TeacherAssignmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { classes, isLoading: classesLoading } = useTeacherClassesSnapshot(user?.id);
  const { assignments, isLoading, error } = useTeacherAssignmentsSnapshot(
    user?.id,
    classes,
  );

  const [formOpen, setFormOpen] = useState(false);
  const [viewTask, setViewTask] = useState<AssignmentWithCounts | null>(null);
  const [submissions, setSubmissions] = useState<
    Awaited<ReturnType<typeof listSubmissions>>
  >([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [classId, setClassId] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("23:59");
  const [priority, setPriority] = useState<AssignmentPriority>("medium");

  const openSubmissions = async (task: AssignmentWithCounts) => {
    setViewTask(task);
    setLoadingSubs(true);
    try {
      const subs = await listSubmissions(task.classId, task.id);
      setSubmissions(subs);
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Failed to load submissions",
      });
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleCreate = async () => {
    if (!user?.id || !title.trim() || !classId || !dueDate) {
      toast({ variant: "error", title: "Fill all required fields." });
      return;
    }

    const due = new Date(`${dueDate}T${dueTime}`);
    setSaving(true);
    try {
      await createAssignment(user.id, user.displayName ?? "Teacher", {
        title,
        subject,
        classId,
        description,
        dueDate: due,
        priority,
      });
      toast({ title: "Assignment posted" });
      setFormOpen(false);
      setTitle("");
      setDescription("");
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task: AssignmentWithCounts) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await deleteAssignment(task.classId, task.id);
      toast({ title: "Assignment deleted" });
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Delete failed",
      });
    }
  };

  if (isLoading || classesLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading assignments" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Create and track class assignments in real time."
        action={
          <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
            <Plus className="size-4" />
            New assignment
          </Button>
        }
      />

      {error ? (
        <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Create your first assignment for a class."
          actionLabel="Create assignment"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[48rem] text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Title", "Subject", "Class", "Due Date", "Submitted", "Pending", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.map((task) => (
                <tr key={`${task.classId}-${task.id}`} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{task.title}</td>
                  <td className="px-3 py-2">{task.subject}</td>
                  <td className="px-3 py-2">{task.className ?? task.classId}</td>
                  <td className="px-3 py-2">
                    {task.dueDate.toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-3 py-2">{task.submittedCount}</td>
                  <td className="px-3 py-2">{task.pendingCount}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => void openSubmissions(task)}>
                        <Users className="size-3.5" />
                        View
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void handleDelete(task)}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <FormField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="space-y-2">
              <Label>Subject</Label>
              <select className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <select className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm" value={classId} onChange={(e) => setClassId(e.target.value)}>
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.section ? ` · ${c.section}` : ""}</option>
                ))}
              </select>
            </div>
            <FormField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <FormField label="Due time" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <select className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm" value={priority} onChange={(e) => setPriority(e.target.value as AssignmentPriority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button isLoading={saving} onClick={() => void handleCreate()}>Save assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewTask)} onOpenChange={() => setViewTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submissions — {viewTask?.title}</DialogTitle>
          </DialogHeader>
          {loadingSubs ? (
            <LoadingSpinner label="Loading submissions" />
          ) : submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {submissions.map((s) => (
                <li key={s.studentId} className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span>{s.studentName}</span>
                  <span className="text-muted-foreground">
                    {s.submittedAt?.toLocaleString() ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
