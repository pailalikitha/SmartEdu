import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import type { Student } from "@/types/student";

export type ResolvedStudent = Pick<Student, "id" | "authUserId"> & {
  rollNumber?: string;
  rollNo?: string;
  uid?: string;
};

function mapResolvedStudent(id: string, data: DocumentData): ResolvedStudent {
  return {
    id,
    authUserId: data.authUserId ? String(data.authUserId) : undefined,
    uid: data.uid ? String(data.uid) : undefined,
    rollNumber:
      data.rollNumber !== undefined && data.rollNumber !== null
        ? String(data.rollNumber)
        : undefined,
    rollNo:
      data.rollNo !== undefined && data.rollNo !== null
        ? String(data.rollNo)
        : undefined,
  };
}

function rollLookupValues(value: string): (string | number)[] {
  const trimmed = value.trim();
  const values: (string | number)[] = [trimmed];
  if (/^\d+$/.test(trimmed)) {
    values.push(Number(trimmed));
  }
  return values;
}

async function queryStudentByField(
  field: "authUserId" | "rollNumber" | "rollNo",
  value: string,
): Promise<ResolvedStudent | null> {
  const db = requireFirestore();
  const candidates =
    field === "authUserId" ? [value] : rollLookupValues(value);

  for (const candidate of candidates) {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.students),
        where(field, "==", candidate),
        limit(1),
      ),
    );
    if (!snapshot.empty) {
      const d = snapshot.docs[0];
      return mapResolvedStudent(d.id, d.data());
    }
  }

  return null;
}

/**
 * Resolves a CSV / legacy marks parent id to a student record.
 * Match order: document ID → authUserId → rollNumber → rollNo.
 */
export async function resolveStudentByCsvId(
  csvId: string,
): Promise<ResolvedStudent | null> {
  const trimmed = csvId.trim();
  if (!trimmed) return null;

  const db = requireFirestore();

  const direct = await getDoc(doc(db, COLLECTIONS.students, trimmed));
  if (direct.exists()) {
    return mapResolvedStudent(direct.id, direct.data());
  }

  const byAuth = await queryStudentByField("authUserId", trimmed);
  if (byAuth) return byAuth;

  const byRollNumber = await queryStudentByField("rollNumber", trimmed);
  if (byRollNumber) return byRollNumber;

  const byRollNo = await queryStudentByField("rollNo", trimmed);
  if (byRollNo) return byRollNo;

  return null;
}

/** Canonical marks parent id: authUserId if set, else Firestore student doc id. */
export function getCanonicalMarksStudentId(student: ResolvedStudent): string {
  return student.authUserId ?? student.uid ?? student.id;
}

export function logMarksIdResolution(
  context: "upload" | "migrate",
  csvId: string,
  canonicalId: string,
): void {
  console.log(`[marks-${context}] ${csvId} -> ${canonicalId}`);
}

export function logResolvedStudentDebug(
  context: "migrate",
  legacyParentId: string,
  student: ResolvedStudent,
  canonicalId: string,
): void {
  console.log(`[marks-${context}] resolved legacy parent "${legacyParentId}"`, {
    studentDocId: student.id,
    authUserId: student.authUserId ?? "(none)",
    uid: student.uid ?? "(none)",
    rollNumber: student.rollNumber ?? "(none)",
    rollNo: student.rollNo ?? "(none)",
    canonicalId,
  });
}
