import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  query,
  serverTimestamp,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";

import {
  ATTENDANCE_SUBCOLLECTIONS,
  COLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { runBatchedSet, toDate } from "@/lib/firebase/firestore/helpers";
import { requireFirestore, where } from "@/lib/firebase/firestore/query";
import type {
  ClassAttendanceInput,
  ClassAttendanceRecord,
  ClassAttendanceStatus,
} from "@/types/class-attendance";

function classAttendanceRef(
  db: ReturnType<typeof requireFirestore>,
  date: string,
  classId: string,
  studentId: string,
) {
  return doc(
    db,
    COLLECTIONS.attendance,
    date,
    ATTENDANCE_SUBCOLLECTIONS.classes,
    classId,
    ATTENDANCE_SUBCOLLECTIONS.students,
    studentId,
  );
}

function mapClassAttendance(
  data: DocumentData,
  studentId: string,
): ClassAttendanceRecord {
  return {
    studentId,
    studentName: String(data.studentName ?? ""),
    classId: String(data.classId ?? ""),
    teacherId: String(data.teacherId ?? ""),
    date: String(data.date ?? ""),
    status: (data.status as ClassAttendanceStatus) ?? "absent",
    timestamp: toDate(data.timestamp as Timestamp | undefined) ?? new Date(),
  };
}

export async function getClassAttendanceForDate(
  date: string,
  classId: string,
): Promise<ClassAttendanceRecord[]> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    collection(
      db,
      COLLECTIONS.attendance,
      date,
      ATTENDANCE_SUBCOLLECTIONS.classes,
      classId,
      ATTENDANCE_SUBCOLLECTIONS.students,
    ),
  );

  return snapshot.docs.map((d) => mapClassAttendance(d.data(), d.id));
}

export async function saveClassAttendanceBatch(
  inputs: ClassAttendanceInput[],
): Promise<void> {
  if (inputs.length === 0) return;

  const db = requireFirestore();
  const operations = inputs.map((input) => ({
    ref: classAttendanceRef(db, input.date, input.classId, input.studentId),
    data: {
      status: input.status,
      studentId: input.studentId,
      studentName: input.studentName,
      classId: input.classId,
      teacherId: input.teacherId,
      date: input.date,
      timestamp: serverTimestamp(),
    },
    merge: true,
  }));

  await runBatchedSet(db, operations);
}

export async function getClassAttendanceHistory(
  classId: string,
  startDate: string,
  endDate: string,
): Promise<ClassAttendanceRecord[]> {
  const db = requireFirestore();
  const groupQuery = query(
    collectionGroup(db, ATTENDANCE_SUBCOLLECTIONS.students),
    where("classId", "==", classId),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
  );

  const snapshot = await getDocs(groupQuery);
  return snapshot.docs.map((d) => mapClassAttendance(d.data(), d.id));
}
