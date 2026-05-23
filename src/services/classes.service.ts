import { collection, getDocs, query, type DocumentData } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore, where } from "@/lib/firebase/firestore/query";
import type { ClassRoom } from "@/types/class";

function mapClassDoc(id: string, data: DocumentData): ClassRoom {
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
  };
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
