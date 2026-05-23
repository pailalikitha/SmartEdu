import {
  addDoc,
  collection,
  limit,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { toDate } from "@/lib/firebase/firestore/helpers";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import type { Timestamp } from "firebase/firestore";

export type SchoolActivityEntry = {
  id: string;
  title: string;
  description: string;
  type?: string;
  timestamp: Date;
};

export async function logSchoolActivity(entry: {
  title: string;
  description: string;
  type?: string;
}): Promise<void> {
  const db = requireFirestore();
  await addDoc(collection(db, COLLECTIONS.schoolActivity), {
    ...entry,
    timestamp: serverTimestamp(),
  });
}

export function mapSchoolActivity(
  id: string,
  data: Record<string, unknown>,
): SchoolActivityEntry {
  return {
    id,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    type: data.type ? String(data.type) : undefined,
    timestamp: toDate(data.timestamp as Timestamp | undefined) ?? new Date(),
  };
}

export function schoolActivityQuery() {
  const db = requireFirestore();
  return orderBy("timestamp", "desc");
}

export const SCHOOL_ACTIVITY_LIMIT = 10;
