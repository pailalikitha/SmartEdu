"use client";

import { useCallback, useEffect, useState } from "react";

import { listStudentMarkEntries } from "@/services/marks.service";
import type { StudentMarkEntry } from "@/types/student-marks";

export function useStudentMarks(studentId: string | undefined) {
  const [entries, setEntries] = useState<StudentMarkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!studentId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await listStudentMarkEntries(studentId);
      setEntries(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load marks.",
      );
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { entries, isLoading, error, refresh: load };
}
