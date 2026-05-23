"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import type { AttendanceRecord } from "@/types/attendance";

function mapAttendanceDoc(
  id: string,
  data: Record<string, unknown>,
): AttendanceRecord {
  return {
    id,
    studentId: String(data.studentId ?? ""),
    studentName: String(data.studentName ?? ""),
    rollNumber: String(data.rollNumber ?? ""),
    grade: String(data.grade ?? ""),
    section: String(data.section ?? ""),
    date: String(data.date ?? ""),
    status:
      data.status === "present"
        ? "present"
        : data.status === "late"
          ? "late"
          : data.status === "excused"
            ? "excused"
            : "absent",
    markedBy: data.markedBy ? String(data.markedBy) : undefined,
  };
}

export function useStudentAttendanceSnapshot(studentId: string | undefined) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setRecords([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const db = requireFirestore();
      const q = query(
        collection(db, COLLECTIONS.attendance),
        where("studentId", "==", studentId),
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setRecords(
            snapshot.docs.map((d) =>
              mapAttendanceDoc(d.id, d.data() as Record<string, unknown>),
            ),
          );
          setIsLoading(false);
        },
        (err) => {
          setError(err.message || "Failed to load attendance.");
          setRecords([]);
          setIsLoading(false);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load attendance.",
      );
      setRecords([]);
      setIsLoading(false);
    }
  }, [studentId]);

  return { records, isLoading, error };
}
