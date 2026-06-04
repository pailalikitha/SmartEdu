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

type ResolvedStudent = Pick<Student, "id" | "authUserId">;

function mapResolvedStudent(id: string, data: DocumentData): ResolvedStudent {
  return {
    id,
    authUserId: data.authUserId ? String(data.authUserId) : undefined,
  };
}

async function queryStudentByField(
  field: "authUserId" | "rollNumber" | "rollNo",
  value: string,
): Promise<ResolvedStudent | null> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.students),
      where(field, "==", value),
      limit(1),
    ),
  );
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return mapResolvedStudent(d.id, d.data());
}

/**
 * Resolves a CSV `studentId` to a student record.
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
  return student.authUserId ?? student.id;
}

export function logMarksIdResolution(csvId: string, canonicalId: string): void {
  console.log(`[marks-upload] ${csvId} -> ${canonicalId}`);
}
