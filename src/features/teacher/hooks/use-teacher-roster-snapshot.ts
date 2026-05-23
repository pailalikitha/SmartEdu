"use client";

import {
  collection,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import {
  COLLECTIONS,
  FIRESTORE_IN_QUERY_LIMIT,
  STUDENT_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { chunkArray } from "@/lib/firebase/firestore/chunks";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { mapStudentMarkEntry } from "@/services/marks.service";
import { getMarksStudentId } from "@/services/student.service";
import type { Student } from "@/types/student";
import type { StudentMarkEntry } from "@/types/student-marks";
import type { AttendanceRecord } from "@/types/attendance";

function mapStudentDoc(id: string, data: Record<string, unknown>): Student {
  return {
    id,
    firstName: String(data.firstName ?? ""),
    lastName: String(data.lastName ?? ""),
    email: String(data.email ?? ""),
    rollNumber: String(data.rollNumber ?? ""),
    grade: String(data.grade ?? ""),
    section: String(data.section ?? ""),
    classKey: data.classKey ? String(data.classKey) : undefined,
    classId: data.classId ? String(data.classId) : undefined,
    authUserId: data.authUserId ? String(data.authUserId) : undefined,
    status: data.status === "inactive" ? "inactive" : "active",
  };
}

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

export type StudentMarksMap = Record<string, StudentMarkEntry[]>;

export function useTeacherRosterSnapshot(classIds: string[]) {
  const [students, setStudents] = useState<Student[]>([]);
  const [marksByStudent, setMarksByStudent] = useState<StudentMarksMap>({});
  const [attendanceByStudent, setAttendanceByStudent] = useState<
    Record<string, AttendanceRecord[]>
  >({});
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingMarks, setIsLoadingMarks] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const classIdsKey = useMemo(
    () => [...new Set(classIds.filter(Boolean))].sort().join(","),
    [classIds],
  );

  useEffect(() => {
    const ids = classIdsKey ? classIdsKey.split(",") : [];
    if (ids.length === 0) {
      setStudents([]);
      setIsLoadingStudents(false);
      return;
    }

    setIsLoadingStudents(true);
    setError(null);

    try {
      const db = requireFirestore();
      const unsubs: Unsubscribe[] = [];
      const aggregated = new Map<string, Student>();

      for (const chunk of chunkArray(ids, FIRESTORE_IN_QUERY_LIMIT)) {
        const q = query(
          collection(db, COLLECTIONS.students),
          where("classId", "in", chunk),
        );

        unsubs.push(
          onSnapshot(
            q,
            (snapshot) => {
              for (const docSnap of snapshot.docs) {
                aggregated.set(
                  docSnap.id,
                  mapStudentDoc(
                    docSnap.id,
                    docSnap.data() as Record<string, unknown>,
                  ),
                );
              }
              setStudents(Array.from(aggregated.values()));
              setIsLoadingStudents(false);
            },
            (err) => {
              setError(err.message);
              setIsLoadingStudents(false);
            },
          ),
        );
      }

      return () => {
        for (const unsub of unsubs) unsub();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students.");
      setIsLoadingStudents(false);
    }
  }, [classIdsKey]);

  const marksStudentIds = useMemo(
    () =>
      [...new Set(students.map((s) => getMarksStudentId(s)))].sort().join(","),
    [students],
  );

  useEffect(() => {
    const ids = marksStudentIds ? marksStudentIds.split(",") : [];
    if (ids.length === 0) {
      setMarksByStudent({});
      setIsLoadingMarks(false);
      return;
    }

    setIsLoadingMarks(true);
    const unsubs: Unsubscribe[] = [];
    const nextMap: StudentMarksMap = {};

    try {
      const db = requireFirestore();

      for (const studentId of ids) {
        const q = collection(
          db,
          COLLECTIONS.marks,
          studentId,
          STUDENT_SUBCOLLECTIONS.markEntries,
        );

        unsubs.push(
          onSnapshot(
            q,
            (snapshot) => {
              nextMap[studentId] = snapshot.docs
                .map((d) => mapStudentMarkEntry(d.id, d.data()))
                .filter((e): e is StudentMarkEntry => e !== null);
              setMarksByStudent({ ...nextMap });
              setIsLoadingMarks(false);
            },
            (err) => {
              setError(err.message);
              setIsLoadingMarks(false);
            },
          ),
        );
      }

      return () => {
        for (const unsub of unsubs) unsub();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load marks.");
      setIsLoadingMarks(false);
    }
  }, [marksStudentIds]);

  const attendanceStudentIds = marksStudentIds;

  useEffect(() => {
    const ids = attendanceStudentIds
      ? attendanceStudentIds.split(",")
      : [];
    if (ids.length === 0) {
      setAttendanceByStudent({});
      setIsLoadingAttendance(false);
      return;
    }

    setIsLoadingAttendance(true);
    const unsubs: Unsubscribe[] = [];
    const nextMap: Record<string, AttendanceRecord[]> = {};

    try {
      const db = requireFirestore();

      for (const chunk of chunkArray(ids, FIRESTORE_IN_QUERY_LIMIT)) {
        const q = query(
          collection(db, COLLECTIONS.attendance),
          where("studentId", "in", chunk),
        );

        unsubs.push(
          onSnapshot(
            q,
            (snapshot) => {
              for (const id of chunk) {
                nextMap[id] = [];
              }
              for (const docSnap of snapshot.docs) {
                const record = mapAttendanceDoc(
                  docSnap.id,
                  docSnap.data() as Record<string, unknown>,
                );
                const list = nextMap[record.studentId] ?? [];
                list.push(record);
                nextMap[record.studentId] = list;
              }
              setAttendanceByStudent({ ...nextMap });
              setIsLoadingAttendance(false);
            },
            (err) => {
              setError(err.message);
              setIsLoadingAttendance(false);
            },
          ),
        );
      }

      return () => {
        for (const unsub of unsubs) unsub();
      };
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load attendance.",
      );
      setIsLoadingAttendance(false);
    }
  }, [attendanceStudentIds]);

  const isLoading =
    isLoadingStudents || isLoadingMarks || isLoadingAttendance;

  return {
    students,
    marksByStudent,
    attendanceByStudent,
    isLoading,
    error,
  };
}
