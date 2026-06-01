import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import {
  buildClassKey,
  buildYearMonth,
  runBatchedSet,
  toDate,
} from "@/lib/firebase/firestore/helpers";
import { requireFirestore, where } from "@/lib/firebase/firestore/query";
import type {
  AttendanceInput,
  AttendanceRecord,
  AttendanceStatus,
} from "@/types/attendance";

export type AttendanceQueryFilters = {
  grade?: string;
  section?: string;
  classKey?: string;
};

export function getAttendanceDocId(studentId: string, date: string): string {
  return `${studentId}_${date}`;
}

function mapAttendanceDoc(id: string, data: DocumentData): AttendanceRecord {
  return {
    id,
    studentId: String(data.studentId ?? ""),
    studentName: String(data.studentName ?? ""),
    rollNumber: String(data.rollNumber ?? ""),
    grade: String(data.grade ?? ""),
    section: String(data.section ?? ""),
    date: String(data.date ?? ""),
    status: (data.status as AttendanceStatus) ?? "absent",
    markedBy: data.markedBy ? String(data.markedBy) : undefined,
    createdAt: toDate(data.createdAt as Timestamp | undefined),
    updatedAt: toDate(data.updatedAt as Timestamp | undefined),
  };
}

function toFirestoreAttendance(input: AttendanceInput): DocumentData {
  return {
    studentId: input.studentId,
    studentName: input.studentName,
    rollNumber: input.rollNumber,
    grade: input.grade,
    section: input.section,
    classKey: buildClassKey(input.grade, input.section),
    date: input.date,
    yearMonth: buildYearMonth(input.date),
    status: input.status,
    markedBy: input.markedBy ?? null,
  };
}

export async function listAttendanceForStudent(
  studentId: string,
): Promise<AttendanceRecord[]> {
  const db = requireFirestore();
  try {
    const q = query(
      collection(db, COLLECTIONS.attendance),
      where("studentId", "==", studentId),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapAttendanceDoc(d.id, d.data()));
  } catch (error) {
    console.error('Attendance query failed (listAttendanceForStudent):', error);
    throw error;
  }
}

/** Returns `null` when the student has no attendance records. */
export function calculateAttendancePercent(
  records: AttendanceRecord[],
): number | null {
  if (records.length === 0) return null;
  const presentCount = records.filter((r) => r.status === "present").length;
  return Math.round((presentCount / records.length) * 1000) / 10;
}

export async function getAttendanceForDate(
  date: string,
  filters: AttendanceQueryFilters = {},
): Promise<AttendanceRecord[]> {
  const db = requireFirestore();
  const constraints = [where("date", "==", date)];

  if (filters.classKey) {
    constraints.push(where("classKey", "==", filters.classKey));
  } else if (filters.grade && filters.section) {
    constraints.push(
      where("classKey", "==", buildClassKey(filters.grade, filters.section)),
    );
  } else if (filters.grade) {
    constraints.push(where("grade", "==", filters.grade));
  }

  try {
    const q = query(collection(db, COLLECTIONS.attendance), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapAttendanceDoc(d.id, d.data()));
  } catch (error) {
    console.error('Attendance query failed (getAttendanceForDate):', error);
    throw error;
  }
}

/** Indexed monthly partition — preferred over full collection scans */
export async function getAttendanceForMonth(
  yearMonth: string,
  filters: AttendanceQueryFilters = {},
): Promise<AttendanceRecord[]> {
  const db = requireFirestore();
  const constraints = [where("yearMonth", "==", yearMonth)];

  if (filters.classKey) {
    constraints.push(where("classKey", "==", filters.classKey));
  } else if (filters.grade && filters.section) {
    constraints.push(
      where("classKey", "==", buildClassKey(filters.grade, filters.section)),
    );
  } else if (filters.grade) {
    constraints.push(where("grade", "==", filters.grade));
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.attendance),
      ...constraints,
      orderBy("date", "asc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => mapAttendanceDoc(d.id, d.data()))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Attendance query failed (getAttendanceForMonth):', error);
    throw error;
  }
}

export async function getAttendanceInRange(
  startDate: string,
  endDate: string,
  filters: AttendanceQueryFilters = {},
): Promise<AttendanceRecord[]> {
  const yearMonth = buildYearMonth(startDate);
  const sameMonth = buildYearMonth(endDate) === yearMonth;

  if (sameMonth) {
    const monthly = await getAttendanceForMonth(yearMonth, filters);
    return monthly.filter((r) => r.date >= startDate && r.date <= endDate);
  }

  const db = requireFirestore();
  const constraints = [
    where("date", ">=", startDate),
    where("date", "<=", endDate),
  ];

  if (filters.classKey) {
    constraints.push(where("classKey", "==", filters.classKey));
  } else if (filters.grade && filters.section) {
    constraints.push(
      where("classKey", "==", buildClassKey(filters.grade, filters.section)),
    );
  }

  try {
    const q = query(collection(db, COLLECTIONS.attendance), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => mapAttendanceDoc(d.id, d.data()))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Attendance query failed (getAttendanceInRange):', error);
    throw error;
  }
}

export async function upsertAttendance(input: AttendanceInput): Promise<void> {
  const db = requireFirestore();
  const id = getAttendanceDocId(input.studentId, input.date);
  const ref = doc(db, COLLECTIONS.attendance, id);

  await runBatchedSet(db, [
    {
      ref,
      data: {
        ...toFirestoreAttendance(input),
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      merge: true,
    },
  ]);
}

export async function bulkUpsertAttendance(
  inputs: AttendanceInput[],
): Promise<void> {
  if (inputs.length === 0) return;

  const db = requireFirestore();
  const operations = inputs.map((input) => {
    const id = getAttendanceDocId(input.studentId, input.date);
    return {
      ref: doc(db, COLLECTIONS.attendance, id),
      data: {
        ...toFirestoreAttendance(input),
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      merge: true,
    };
  });

  await runBatchedSet(db, operations);
}
