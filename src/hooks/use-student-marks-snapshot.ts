"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import {
  COLLECTIONS,
  STUDENT_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { mapStudentMarkEntry } from "@/services/marks.service";
import type { StudentMarkEntry } from "@/types/student-marks";

export function useStudentMarksSnapshot(studentId: string | undefined) {
  const [entries, setEntries] = useState<StudentMarkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const db = requireFirestore();
      const q = query(
        collection(
          db,
          COLLECTIONS.marks,
          studentId,
          STUDENT_SUBCOLLECTIONS.markEntries,
        ),
        orderBy("date", "desc"),
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const next = snapshot.docs
            .map((d) => mapStudentMarkEntry(d.id, d.data()))
            .filter((e): e is StudentMarkEntry => e !== null);
          setEntries(next);
          setIsLoading(false);
        },
        (err) => {
          setError(err.message || "Failed to load marks.");
          setEntries([]);
          setIsLoading(false);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load marks.",
      );
      setEntries([]);
      setIsLoading(false);
    }
  }, [studentId]);

  return { entries, isLoading, error };
}
