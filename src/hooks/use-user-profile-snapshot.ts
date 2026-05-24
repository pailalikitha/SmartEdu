"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import type { UserProfile } from "@/services/user.service";

export function useUserProfileSnapshot(uid: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const db = requireFirestore();
      const unsubscribe = onSnapshot(
        doc(db, COLLECTIONS.users, uid),
        (snapshot) => {
          if (!snapshot.exists()) {
            setProfile(null);
            setIsLoading(false);
            return;
          }
          setProfile(snapshot.data() as UserProfile);
          setIsLoading(false);
        },
        (err) => {
          console.error(err);
          setError(err.message);
          setProfile(null);
          setIsLoading(false);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      setIsLoading(false);
    }
  }, [uid]);

  return { profile, isLoading, error };
}
