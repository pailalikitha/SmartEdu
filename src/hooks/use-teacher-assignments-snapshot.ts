"use client";

import {
  collection,
  collectionGroup,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import {
  ASSIGNMENT_SUBCOLLECTIONS,
  COLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { mapAssignment } from "@/services/assignments.service";
import { listStudentsByClassIds } from "@/services/student.service";
import type { AssignmentWithCounts } from "@/types/assignment";
import type { ClassRoom } from "@/types/class";

export function useTeacherAssignmentsSnapshot(
  teacherId: string | undefined,
  classes: ClassRoom[],
) {
  const [assignments, setAssignments] = useState<AssignmentWithCounts[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState<
    Record<string, number>
  >({});
  const [classStudentCounts, setClassStudentCounts] = useState<
    Record<string, number>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const classMap = useMemo(() => {
    const map = new Map<string, ClassRoom>();
    for (const c of classes) map.set(c.id, c);
    return map;
  }, [classes]);

  useEffect(() => {
    if (!teacherId) {
      setAssignments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const db = requireFirestore();
      const q = query(
        collectionGroup(db, ASSIGNMENT_SUBCOLLECTIONS.tasks),
        where("teacherId", "==", teacherId),
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const next = snapshot.docs.map((d) => {
            const classId = d.ref.parent.parent?.id ?? "";
            return {
              ...mapAssignment(d.id, classId, d.data()),
              className: classMap.get(classId)?.name,
            };
          });
          setAssignments(
            next
              .map((a) => ({
                ...a,
                submittedCount: 0,
                pendingCount: 0,
              }))
              .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime()),
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
      setError(err instanceof Error ? err.message : "Failed to load assignments");
      setIsLoading(false);
    }
  }, [teacherId, classMap]);

  useEffect(() => {
    const classIds = [...new Set(assignments.map((a) => a.classId))];
    if (classIds.length === 0) {
      setClassStudentCounts({});
      return;
    }

    void listStudentsByClassIds(classIds).then((students) => {
      const counts: Record<string, number> = {};
      for (const id of classIds) counts[id] = 0;
      for (const s of students) {
        if (s.classId) counts[s.classId] = (counts[s.classId] ?? 0) + 1;
      }
      setClassStudentCounts(counts);
    });
  }, [assignments]);

  useEffect(() => {
    if (assignments.length === 0) {
      setSubmissionCounts({});
      return;
    }

    const unsubs: Array<() => void> = [];
    const db = requireFirestore();

    for (const assignment of assignments) {
      const key = `${assignment.classId}::${assignment.id}`;
      const subCol = collection(
        db,
        COLLECTIONS.assignments,
        assignment.classId,
        ASSIGNMENT_SUBCOLLECTIONS.tasks,
        assignment.id,
        ASSIGNMENT_SUBCOLLECTIONS.submissions,
      );

      unsubs.push(
        onSnapshot(subCol, (snap) => {
          setSubmissionCounts((prev) => ({
            ...prev,
            [key]: snap.size,
          }));
        }),
      );
    }

    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [assignments]);

  const withCounts = useMemo((): AssignmentWithCounts[] => {
    return assignments.map((a) => {
      const key = `${a.classId}::${a.id}`;
      const submitted = submissionCounts[key] ?? 0;
      const total = classStudentCounts[a.classId] ?? 0;
      return {
        ...a,
        submittedCount: submitted,
        pendingCount: Math.max(0, total - submitted),
      };
    });
  }, [assignments, submissionCounts, classStudentCounts]);

  return { assignments: withCounts, isLoading, error };
}
