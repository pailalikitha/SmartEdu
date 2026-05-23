import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";

import {
  ATTENDANCE_SUBCOLLECTIONS,
  COLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import {
  buildClassKey,
  buildYearMonth,
  runBatchedSet,
  toDate,
} from "@/lib/firebase/firestore/helpers";
import { requireFirestore, where as firestoreWhere } from "@/lib/firebase/firestore/query";
import {
  getAttendanceDocId,
} from "@/services/attendance.service";
import { getStudent } from "@/services/student.service";
import {
  notifyAbsent,
  notifyLowAttendance,
} from "@/services/notifications.service";
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

  const flatOps: Array<{
    ref: ReturnType<typeof doc>;
    data: Record<string, unknown>;
    merge?: boolean;
  }> = [];

  for (const input of inputs) {
    const student = await getStudent(input.studentId);
    if (student) {
      const flatStatus =
        input.status === "present" ? "present" : "absent";
      flatOps.push({
        ref: doc(
          db,
          COLLECTIONS.attendance,
          getAttendanceDocId(input.studentId, input.date),
        ),
        data: {
          studentId: input.studentId,
          studentName: input.studentName,
          rollNumber: student.rollNumber,
          grade: student.grade,
          section: student.section,
          classKey: buildClassKey(student.grade, student.section),
          date: input.date,
          yearMonth: buildYearMonth(input.date),
          status: flatStatus,
          markedBy: input.teacherId,
          updatedAt: serverTimestamp(),
        },
        merge: true,
      });
    }

    if (input.status === "absent") {
      await notifyAbsent(input.studentId, input.date);
    }

    const history = await getStudentClassAttendanceRecords(
      input.studentId,
      input.classId,
    );
    const presentCount = history.filter((r) => r.status === "present").length;
    const percent =
      history.length > 0
        ? Math.round((presentCount / history.length) * 1000) / 10
        : 100;
    if (history.length >= 5 && percent < 75) {
      await notifyLowAttendance(input.studentId, percent);
    }
  }

  if (flatOps.length > 0) {
    await runBatchedSet(db, flatOps);
  }
}

async function getStudentClassAttendanceRecords(
  studentId: string,
  classId: string,
): Promise<ClassAttendanceRecord[]> {
  const db = requireFirestore();
  const groupQuery = query(
    collectionGroup(db, ATTENDANCE_SUBCOLLECTIONS.students),
    firestoreWhere("studentId", "==", studentId),
    firestoreWhere("classId", "==", classId),
  );
  const snapshot = await getDocs(groupQuery);
  return snapshot.docs.map((d) => mapClassAttendance(d.data(), d.id));
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
