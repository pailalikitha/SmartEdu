import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { toDate } from "@/lib/firebase/firestore/helpers";
import type { Timestamp } from "firebase/firestore";

export type TeacherProfile = {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  subjects?: string[];
  employeeId?: string;
  dateOfJoining?: string;
  photoURL?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TeacherProfileInput = {
  name: string;
  phone?: string;
  subject?: string;
  subjects?: string[];
  dateOfJoining?: string;
  photoURL?: string | null;
};

function mapTeacherDoc(uid: string, data: DocumentData): TeacherProfile {
  return {
    uid,
    name: String(data.name ?? ""),
    email: String(data.email ?? ""),
    phone: data.phone ? String(data.phone) : undefined,
    subject: data.subject ? String(data.subject) : undefined,
    subjects: Array.isArray(data.subjects)
      ? data.subjects.map(String)
      : undefined,
    employeeId: data.employeeId ? String(data.employeeId) : undefined,
    dateOfJoining: data.dateOfJoining
      ? String(data.dateOfJoining)
      : undefined,
    photoURL: data.photoURL ? String(data.photoURL) : null,
    createdAt: toDate(data.createdAt as Timestamp | undefined),
    updatedAt: toDate(data.updatedAt as Timestamp | undefined),
  };
}

export async function getTeacherProfile(
  uid: string,
): Promise<TeacherProfile | null> {
  const db = requireFirestore();
  const snapshot = await getDoc(doc(db, COLLECTIONS.teachers, uid));
  if (!snapshot.exists()) return null;
  return mapTeacherDoc(uid, snapshot.data());
}

export async function saveTeacherProfile(
  uid: string,
  email: string,
  input: TeacherProfileInput,
): Promise<void> {
  const db = requireFirestore();
  const ref = doc(db, COLLECTIONS.teachers, uid);
  const existing = await getDoc(ref);

  const payload: DocumentData = {
    name: input.name.trim(),
    email: email.trim().toLowerCase(),
    phone: input.phone?.trim() ?? null,
    subject: input.subject?.trim() ?? null,
    subjects: input.subjects ?? [],
    dateOfJoining: input.dateOfJoining ?? null,
    photoURL: input.photoURL ?? null,
    updatedAt: serverTimestamp(),
  };

  if (!existing.exists()) {
    await setDoc(ref, {
      ...payload,
      employeeId: `TCH-${uid.slice(0, 6).toUpperCase()}`,
      createdAt: serverTimestamp(),
    });
  } else {
    await updateDoc(ref, payload);
  }
}

export async function teacherNeedsOnboarding(uid: string): Promise<boolean> {
  const { listClassesByTeacher } = await import("@/services/classes.service");
  const classes = await listClassesByTeacher(uid);
  return classes.length === 0;
}
