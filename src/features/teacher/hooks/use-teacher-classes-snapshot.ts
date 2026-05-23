"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { mapClassDoc } from "@/services/classes.service";
import type { ClassRoom } from "@/types/class";

export function useTeacherClassesSnapshot(teacherId: string | undefined) {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teacherId) {
      setClasses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const db = requireFirestore();
      const q = query(
        collection(db, COLLECTIONS.classes),
        where("teacherId", "==", teacherId),
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const next = snapshot.docs
            .map((d) => mapClassDoc(d.id, d.data()))
            .sort((a, b) => a.name.localeCompare(b.name));
          setClasses(next);
          setIsLoading(false);
        },
        (err) => {
          setError(err.message || "Failed to load classes.");
          setClasses([]);
          setIsLoading(false);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load classes.",
      );
      setClasses([]);
      setIsLoading(false);
    }
  }, [teacherId]);

  return { classes, isLoading, error };
}
