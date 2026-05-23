import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";

import {
  COLLECTIONS,
  DASHBOARD_ACTIVITY_LIMIT,
  STUDENT_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { toDate } from "@/lib/firebase/firestore/helpers";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import type { ActivityLogEntry } from "@/types/student-dashboard";

function mapActivityLog(id: string, data: DocumentData): ActivityLogEntry | null {
  const title = String(data.title ?? "").trim();
  const timestamp = toDate(data.timestamp as Timestamp | undefined);
  if (!title || !timestamp) return null;

  return {
    id,
    title,
    description: String(data.description ?? "").trim(),
    timestamp,
    type: data.type ? String(data.type) : undefined,
  };
}

export async function listRecentActivityLogs(
  studentId: string,
  maxItems = DASHBOARD_ACTIVITY_LIMIT,
): Promise<ActivityLogEntry[]> {
  const db = requireFirestore();
  const q = query(
    collection(
      db,
      COLLECTIONS.activityLog,
      studentId,
      STUDENT_SUBCOLLECTIONS.activityLogs,
    ),
    orderBy("timestamp", "desc"),
    limit(maxItems),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((d) => mapActivityLog(d.id, d.data()))
    .filter((entry): entry is ActivityLogEntry => entry !== null);
}
