"use client";

import {
  collection,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import {
  ASSIGNMENT_SUBCOLLECTIONS,
  COLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import {
  mapAssignment,
  notifyOverdueAssignment,
} from "@/services/assignments.service";
import type { AssignmentWithCounts } from "@/types/assignment";

const overdueNotified = new Set<string>();

export function useStudentAssignmentsSnapshot(
  studentId: string | undefined,
  classId: string | undefined,
) {
  const [assignments, setAssignments] = useState<AssignmentWithCounts[]>([]);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId || !classId) {
      setAssignments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const db = requireFirestore();
      const tasksCol = collection(
        db,
        COLLECTIONS.assignments,
        classId,
        ASSIGNMENT_SUBCOLLECTIONS.tasks,
      );

      const unsubscribe = onSnapshot(
        tasksCol,
        (snapshot) => {
          const next = snapshot.docs.map((d) =>
            mapAssignment(d.id, classId, d.data()),
          );
          setAssignments(
            next
              .map((a) => ({
                ...a,
                submittedCount: 0,
                pendingCount: 0,
              }))
              .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
          );
          setIsLoading(false);
        },
        (err) => {
          console.error(err);
          setError(err.message);
          setIsLoading(false);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load assignments",
      );
      setIsLoading(false);
    }
  }, [studentId, classId]);

  useEffect(() => {
    if (!studentId || !classId || assignments.length === 0) {
      setSubmittedIds(new Set());
      return;
    }

    const unsubs: Array<() => void> = [];
    const db = requireFirestore();
    const submitted = new Set<string>();

    for (const assignment of assignments) {
      const subRef = doc(
        db,
        COLLECTIONS.assignments,
        classId,
        ASSIGNMENT_SUBCOLLECTIONS.tasks,
        assignment.id,
        ASSIGNMENT_SUBCOLLECTIONS.submissions,
        studentId,
      );

      unsubs.push(
        onSnapshot(subRef, (snap) => {
          if (snap.exists()) submitted.add(assignment.id);
          else submitted.delete(assignment.id);
          setSubmittedIds(new Set(submitted));
        }),
      );
    }

    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [assignments, studentId, classId]);

  useEffect(() => {
    if (!studentId) return;
    const now = Date.now();

    for (const assignment of assignments) {
      const key = `${assignment.id}-${studentId}`;
      const isOverdue = assignment.dueDate.getTime() < now;
      const hasSubmitted = submittedIds.has(assignment.id);

      if (isOverdue && !hasSubmitted && !overdueNotified.has(key)) {
        overdueNotified.add(key);
        void notifyOverdueAssignment(studentId, assignment.title, assignment.dueDate);
      }
    }
  }, [assignments, submittedIds, studentId]);

  const enriched = useMemo((): AssignmentWithCounts[] => {
    return assignments.map((a) => ({
      ...a,
      hasSubmitted: submittedIds.has(a.id),
    }));
  }, [assignments, submittedIds]);

  const now = Date.now();
  const pending = enriched.filter(
    (a) => !a.hasSubmitted && a.dueDate.getTime() >= now,
  );
  const submitted = enriched.filter((a) => a.hasSubmitted);
  const overdue = enriched.filter(
    (a) => !a.hasSubmitted && a.dueDate.getTime() < now,
  );

  const upcoming = [...pending]
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 3);

  return {
    assignments: enriched,
    pending,
    submitted,
    overdue,
    upcoming,
    isLoading,
    error,
  };
}
