import { collection, getDocs } from "firebase/firestore";

import {
  COLLECTIONS,
  STUDENT_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";

const WEAK_SCORE_THRESHOLD = 60;

export type WeakTopicsStats = {
  weakCount: number;
} | null;

/** Returns `null` when the student has no topic documents yet. */
export async function getWeakTopicsStats(
  studentId: string,
): Promise<WeakTopicsStats> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    collection(
      db,
      COLLECTIONS.weakTopics,
      studentId,
      STUDENT_SUBCOLLECTIONS.weakTopics,
    ),
  );

  if (snapshot.empty) return null;

  const weakCount = snapshot.docs.filter((doc) => {
    const score = Number(doc.data().score);
    return !Number.isNaN(score) && score < WEAK_SCORE_THRESHOLD;
  }).length;

  return { weakCount };
}
