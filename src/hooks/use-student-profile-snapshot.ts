"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import type { Student } from "@/types/student";

function mapStudent(id: string, data: Record<string, unknown>): Student {
  return {
    id,
    firstName: String(data.firstName ?? ""),
    lastName: String(data.lastName ?? ""),
    email: String(data.email ?? ""),
    rollNumber: String(data.rollNumber ?? ""),
    grade: String(data.grade ?? ""),
    section: String(data.section ?? ""),
    classId: data.classId ? String(data.classId) : undefined,
    authUserId: data.authUserId ? String(data.authUserId) : undefined,
    parentEmail: data.parentEmail ? String(data.parentEmail) : undefined,
    status: data.status === "inactive" ? "inactive" : "active",
  };
}

export function useStudentProfileSnapshot(uid: string | undefined) {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setStudent(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const db = requireFirestore();
      const ref = doc(db, COLLECTIONS.students, uid);

      const unsubscribe = onSnapshot(
        ref,
        (snap) => {
          if (!snap.exists()) {
            setStudent(null);
          } else {
            setStudent(mapStudent(snap.id, snap.data() as Record<string, unknown>));
          }
          setIsLoading(false);
        },
        (err) => {
          console.error(err);
          setError(err.message);
          setStudent(null);
          setIsLoading(false);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      setIsLoading(false);
    }
  }, [uid]);

  return { student, isLoading, error };
}
