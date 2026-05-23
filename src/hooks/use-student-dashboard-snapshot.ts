"use client";

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import {
  COLLECTIONS,
  DASHBOARD_ACTIVITY_LIMIT,
  STUDENT_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import {
  averageMarkScore,
  averageMarksBySubject,
  mapStudentMarkEntry,
} from "@/services/marks.service";
import { calculateAttendancePercent } from "@/services/attendance.service";
import type { StudentDashboardData } from "@/types/student-dashboard";
import type { AttendanceRecord } from "@/types/attendance";

const EMPTY: StudentDashboardData = {
  overallPerformance: null,
  weakTopicsCount: null,
  attendancePercent: null,
  subjectAverages: [],
  activities: [],
};

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
    status: data.status === "present" ? "present" : "absent",
  };
}

export function useStudentDashboardSnapshot(studentId: string | undefined) {
  const [markEntries, setMarkEntries] = useState<
    NonNullable<ReturnType<typeof mapStudentMarkEntry>>[]
  >([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    [],
  );
  const [activities, setActivities] = useState<StudentDashboardData["activities"]>(
    [],
  );
  const [pending, setPending] = useState(3);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setPending(0);
      return;
    }

    setPending(3);
    setError(null);
    const unsubs: Array<() => void> = [];

    try {
      const db = requireFirestore();

      unsubs.push(
        onSnapshot(
          query(
            collection(
              db,
              COLLECTIONS.marks,
              studentId,
              STUDENT_SUBCOLLECTIONS.markEntries,
            ),
            orderBy("date", "desc"),
          ),
          (snapshot) => {
            setMarkEntries(
              snapshot.docs
                .map((d) => mapStudentMarkEntry(d.id, d.data()))
                .filter((e): e is NonNullable<typeof e> => e !== null),
            );
            setPending((p) => Math.max(0, p - 1));
          },
          (err) => {
            console.error(err);
            setError(err.message);
            setPending((p) => Math.max(0, p - 1));
          },
        ),
      );

      unsubs.push(
        onSnapshot(
          query(
            collection(db, COLLECTIONS.attendance),
            where("studentId", "==", studentId),
          ),
          (snapshot) => {
            setAttendanceRecords(
              snapshot.docs.map((d) =>
                mapAttendanceDoc(d.id, d.data() as Record<string, unknown>),
              ),
            );
            setPending((p) => Math.max(0, p - 1));
          },
          (err) => {
            console.error(err);
            setError(err.message);
            setPending((p) => Math.max(0, p - 1));
          },
        ),
      );

      unsubs.push(
        onSnapshot(
          query(
            collection(
              db,
              COLLECTIONS.activityLog,
              studentId,
              STUDENT_SUBCOLLECTIONS.activityLogs,
            ),
            orderBy("timestamp", "desc"),
            limit(DASHBOARD_ACTIVITY_LIMIT),
          ),
          (snapshot) => {
            setActivities(
              snapshot.docs.map((d) => {
                const data = d.data() as Record<string, unknown>;
                const ts = data.timestamp;
                return {
                  id: d.id,
                  title: String(data.title ?? "Activity"),
                  description: String(data.description ?? ""),
                  type: data.type ? String(data.type) : undefined,
                  timestamp:
                    ts && typeof ts === "object" && "toDate" in ts
                      ? (ts as { toDate: () => Date }).toDate()
                      : new Date(),
                };
              }),
            );
            setPending((p) => Math.max(0, p - 1));
          },
          (err) => {
            console.error(err);
            setError(err.message);
            setPending((p) => Math.max(0, p - 1));
          },
        ),
      );

      return () => {
        for (const unsub of unsubs) unsub();
      };
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
      setPending(0);
    }
  }, [studentId]);

  const data = useMemo((): StudentDashboardData => {
    const marksForAvg = markEntries.map((e) => ({
      id: e.id,
      subject: e.subject,
      score: e.percentage,
    }));

    const weakTopicsCount =
      markEntries.length === 0
        ? null
        : markEntries.filter((e) => e.percentage < 60).length;

    return {
      overallPerformance: averageMarkScore(marksForAvg),
      weakTopicsCount,
      attendancePercent: calculateAttendancePercent(attendanceRecords),
      subjectAverages: averageMarksBySubject(marksForAvg),
      activities,
    };
  }, [markEntries, attendanceRecords, activities]);

  return {
    data: studentId ? data : EMPTY,
    isLoading: pending > 0,
    error,
  };
}
