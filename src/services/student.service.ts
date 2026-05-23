import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";

import {
  COLLECTIONS,
  FIRESTORE_IN_QUERY_LIMIT,
} from "@/lib/firebase/firestore/constants";
import { chunkArray } from "@/lib/firebase/firestore/chunks";
import {
  buildClassKey,
  toDate,
} from "@/lib/firebase/firestore/helpers";
import {
  orderBy,
  queryCollection,
  requireFirestore,
  where,
} from "@/lib/firebase/firestore/query";
import type { QueryConstraint } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import type { Student, StudentInput, StudentStatus } from "@/types/student";
import { buildStudentClassKey } from "@/types/student";

export type ListStudentsFilters = {
  status?: StudentStatus;
  grade?: string;
  section?: string;
};

function mapStudentDoc(id: string, data: DocumentData): Student {
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
    guardianName: data.guardianName ? String(data.guardianName) : undefined,
    guardianContact: data.guardianContact
      ? String(data.guardianContact)
      : undefined,
    status: data.status === "inactive" ? "inactive" : "active",
    createdAt: toDate(data.createdAt as Timestamp | undefined),
    updatedAt: toDate(data.updatedAt as Timestamp | undefined),
  };
}

function toFirestoreStudent(input: StudentInput): DocumentData {
  return {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    rollNumber: input.rollNumber.trim(),
    grade: input.grade,
    section: input.section,
    classKey: buildClassKey(input.grade, input.section),
    guardianName: input.guardianName?.trim() ?? null,
    guardianContact: input.guardianContact?.trim() ?? null,
    status: input.status,
  };
}

export async function getStudent(id: string): Promise<Student | null> {
  const db = requireFirestore();
  const snapshot = await getDoc(doc(db, COLLECTIONS.students, id));
  if (!snapshot.exists()) return null;
  return mapStudentDoc(snapshot.id, snapshot.data());
}

export async function listStudents(
  filters: ListStudentsFilters = {},
): Promise<Student[]> {
  const constraints: QueryConstraint[] = [];

  if (filters.status) {
    constraints.push(where("status", "==", filters.status));
  }

  if (filters.grade && filters.section) {
    constraints.push(
      where("classKey", "==", buildStudentClassKey(filters.grade, filters.section)),
    );
  } else if (filters.grade) {
    constraints.push(where("grade", "==", filters.grade));
  }

  constraints.push(orderBy("createdAt", "desc"));

  const { items } = await queryCollection({
    collectionPath: COLLECTIONS.students,
    constraints,
    mapDoc: mapStudentDoc,
  });

  return items;
}

export async function listActiveStudentsByClass(
  grade: string,
  section: string,
): Promise<Student[]> {
  return listStudents({
    status: "active",
    grade,
    section,
  });
}

export async function listStudentsByClassIds(
  classIds: string[],
): Promise<Student[]> {
  if (classIds.length === 0) return [];

  const uniqueIds = [...new Set(classIds)];
  const students: Student[] = [];

  for (const chunk of chunkArray(uniqueIds, FIRESTORE_IN_QUERY_LIMIT)) {
    const { items } = await queryCollection({
      collectionPath: COLLECTIONS.students,
      constraints: [where("classId", "in", chunk)],
      mapDoc: mapStudentDoc,
    });
    students.push(...items);
  }

  return students;
}

export function getMarksStudentId(student: Student): string {
  return student.authUserId ?? student.id;
}

export async function createStudent(input: StudentInput): Promise<Student> {
  const db = requireFirestore();
  const ref = doc(collection(db, COLLECTIONS.students));

  const payload = {
    ...toFirestoreStudent(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, payload);

  return {
    id: ref.id,
    ...input,
    classKey: buildStudentClassKey(input.grade, input.section),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function updateStudent(
  id: string,
  input: StudentInput,
): Promise<void> {
  const db = requireFirestore();

  await updateDoc(doc(db, COLLECTIONS.students, id), {
    ...toFirestoreStudent(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteStudent(id: string): Promise<void> {
  const db = requireFirestore();
  await deleteDoc(doc(db, COLLECTIONS.students, id));
}
