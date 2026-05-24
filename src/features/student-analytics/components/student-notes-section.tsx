"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import {
  addStudentNote,
  deleteStudentNote,
  subscribeStudentNotes,
  type StudentNote,
} from "@/services/student-notes.service";
import { formatRelativeTime } from "@/lib/utils/format";

type StudentNotesSectionProps = {
  ownerId: string;
  studentId: string;
  title?: string;
};

export function StudentNotesSection({
  ownerId,
  studentId,
  title = "Private notes",
}: StudentNotesSectionProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ownerId || !studentId) return;
    setLoading(true);
    const unsub = subscribeStudentNotes(
      ownerId,
      studentId,
      (data) => {
        setNotes(data);
        setLoading(false);
      },
      (err) => {
        toast({ title: err, variant: "error" });
        setLoading(false);
      },
    );
    return () => unsub();
  }, [ownerId, studentId, toast]);

  const handleAdd = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await addStudentNote(ownerId, studentId, draft);
      setDraft("");
      toast({ title: "Note saved.", variant: "success" });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Failed to save note.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteStudentNote(ownerId, studentId, noteId);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Failed to delete note.",
        variant: "error",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <FormField
            label="Add note"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Private note visible only to you…"
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => void handleAdd()}
            isLoading={saving}
            disabled={!draft.trim()}
          >
            Save note
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading notes" />
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border bg-muted/20 p-3 text-sm"
              >
                <div>
                  <p>{note.note}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {note.createdAt
                      ? formatRelativeTime(note.createdAt)
                      : "Just now"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void handleDelete(note.id)}
                  aria-label="Delete note"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
