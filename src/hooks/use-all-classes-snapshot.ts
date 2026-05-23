"use client";

import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { mapClassDoc } from "@/services/classes.service";
import type { ClassRoom } from "@/types/class";

export function useAllClassesSnapshot() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const db = requireFirestore();
      const unsubscribe = onSnapshot(
        collection(db, COLLECTIONS.classes),
        (snapshot) => {
          setClasses(
            snapshot.docs
              .map((d) => mapClassDoc(d.id, d.data()))
              .sort((a, b) => a.name.localeCompare(b.name)),
          );
          setIsLoading(false);
        },
        (err) => {
          console.error(err);
          setError(err.message);
          setIsLoading(false);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load classes");
      setIsLoading(false);
    }
  }, []);

  return { classes, isLoading, error };
}
