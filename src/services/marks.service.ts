import {
  collection,
  getDocs,
  orderBy,
  query,
  type DocumentData,
} from "firebase/firestore";

import {
  COLLECTIONS,
  STUDENT_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import type { MarkEntry } from "@/types/student-dashboard";
import type { StudentMarkEntry } from "@/types/student-marks";
import { percentageToGrade } from "@/lib/utils/grade";

function resolvePercentage(data: DocumentData): number | null {
  const score = Number(data.score);
  if (!Number.isNaN(score)) return Math.round(score * 10) / 10;

  const obtained = Number(data.marksObtained);
  const total = Number(data.totalMarks);
  if (!Number.isNaN(obtained) && !Number.isNaN(total) && total > 0) {
    return Math.round((obtained / total) * 1000) / 10;
  }

  return null;
}

function mapMarkEntry(id: string, data: DocumentData): MarkEntry | null {
  const subject = String(data.subject ?? "").trim();
  const percentage = resolvePercentage(data);
  if (!subject || percentage === null) return null;

  return { id, subject, score: percentage };
}

export function mapStudentMarkEntry(
  id: string,
  data: DocumentData,
): StudentMarkEntry | null {
  const subject = String(data.subject ?? "").trim();
  const examType = String(data.examType ?? "Exam").trim();
  const date = String(data.date ?? "").trim();
  const percentage = resolvePercentage(data);

  const marksObtained = Number(data.marksObtained);
  const totalMarks = Number(data.totalMarks);
  const hasMarks =
    !Number.isNaN(marksObtained) &&
    !Number.isNaN(totalMarks) &&
    totalMarks > 0;

  if (!subject || !date || percentage === null) return null;

  return {
    id,
    subject,
    examType: examType || "Exam",
    marksObtained: hasMarks ? marksObtained : Math.round((percentage / 100) * 100),
    totalMarks: hasMarks ? totalMarks : 100,
    percentage,
    grade: percentageToGrade(percentage),
    date,
  };
}

function marksCollectionRef(
  db: ReturnType<typeof requireFirestore>,
  studentId: string,
) {
  return collection(
    db,
    COLLECTIONS.marks,
    studentId,
    STUDENT_SUBCOLLECTIONS.markEntries,
  );
}

export async function listMarkEntries(studentId: string): Promise<MarkEntry[]> {
  const entries = await listStudentMarkEntries(studentId);
  return entries.map((e) => ({
    id: e.id,
    subject: e.subject,
    score: e.percentage,
  }));
}

/** Full mark rows for the student marks page, newest first. */
export async function listStudentMarkEntries(
  studentId: string,
): Promise<StudentMarkEntry[]> {
  const db = requireFirestore();
  const q = query(
    marksCollectionRef(db, studentId),
    orderBy("date", "desc"),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((d) => mapStudentMarkEntry(d.id, d.data()))
    .filter((entry): entry is StudentMarkEntry => entry !== null);
}

export function averageMarkScore(entries: MarkEntry[]): number | null {
  if (entries.length === 0) return null;
  const sum = entries.reduce((acc, e) => acc + e.score, 0);
  return sum / entries.length;
}

export async function listMarkEntriesForStudents(
  studentIds: string[],
): Promise<MarkEntry[]> {
  const uniqueIds = [...new Set(studentIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const batches = await Promise.all(
    uniqueIds.map((studentId) => listMarkEntries(studentId)),
  );

  return batches.flat();
}

export function averageMarksBySubject(
  entries: MarkEntry[],
): { label: string; value: number }[] {
  if (entries.length === 0) return [];

  const bySubject = new Map<string, { sum: number; count: number }>();

  for (const entry of entries) {
    const key = entry.subject;
    const current = bySubject.get(key) ?? { sum: 0, count: 0 };
    current.sum += entry.score;
    current.count += 1;
    bySubject.set(key, current);
  }

  return Array.from(bySubject.entries())
    .map(([label, { sum, count }]) => ({
      label,
      value: Math.round((sum / count) * 10) / 10,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
