import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore, where } from "@/lib/firebase/firestore/query";
import type { ClassRoom, CreateClassInput } from "@/types/class";

export function generateClassCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function mapClassDoc(id: string, data: DocumentData): ClassRoom {
  const name = String(data.name ?? "").trim();
  const grade = data.grade ? String(data.grade) : undefined;
  const section = data.section ? String(data.section) : undefined;
  const fallbackName =
    grade && section ? `${grade}-${section}` : grade ?? section ?? id;

  return {
    id,
    name: name || fallbackName,
    teacherId: String(data.teacherId ?? ""),
    grade,
    section,
    subject: data.subject ? String(data.subject) : undefined,
    academicYear: data.academicYear ? String(data.academicYear) : undefined,
    classCode: data.classCode ? String(data.classCode) : undefined,
    studentCount:
      typeof data.studentCount === "number" ? data.studentCount : undefined,
  };
}

export async function createClass(
  input: CreateClassInput,
): Promise<{ id: string; classCode: string }> {
  const db = requireFirestore();
  const classCode = generateClassCode();

  const ref = await addDoc(collection(db, COLLECTIONS.classes), {
    name: input.name.trim(),
    section: input.section.trim(),
    subject: input.subject.trim(),
    academicYear: input.academicYear.trim(),
    teacherId: input.teacherId,
    classCode,
    studentCount: 0,
    grade: input.name.trim(),
    createdAt: serverTimestamp(),
  });

  return { id: ref.id, classCode };
}

export async function listClassesByTeacher(
  teacherId: string,
): Promise<ClassRoom[]> {
  const db = requireFirestore();
  const q = query(
    collection(db, COLLECTIONS.classes),
    where("teacherId", "==", teacherId),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((d) => mapClassDoc(d.id, d.data()))
    .sort((a, b) => a.name.localeCompare(b.name));
}
