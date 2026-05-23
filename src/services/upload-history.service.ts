import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  doc,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";

import {
  COLLECTIONS,
  UPLOAD_HISTORY_LIMIT,
  UPLOAD_HISTORY_SUBCOLLECTION,
} from "@/lib/firebase/firestore/constants";
import { toDate } from "@/lib/firebase/firestore/helpers";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import type { UploadHistoryLog } from "@/types/upload";

function mapUploadLog(id: string, data: DocumentData): UploadHistoryLog {
  const uploadType = data.uploadType === "students" ? "students" : "marks";
  return {
    id,
    filename: String(data.filename ?? "upload.csv"),
    uploadType,
    uploadedAt: toDate(data.uploadedAt as Timestamp | undefined) ?? new Date(),
    uploadedBy: String(data.uploadedBy ?? ""),
    recordsUploaded: Number(data.recordsUploaded ?? 0),
    successCount: Number(data.successCount ?? 0),
    failureCount: Number(data.failureCount ?? 0),
  };
}

export async function listUploadHistory(
  teacherId: string,
): Promise<UploadHistoryLog[]> {
  const db = requireFirestore();
  const q = query(
    collection(
      db,
      COLLECTIONS.uploadHistory,
      teacherId,
      UPLOAD_HISTORY_SUBCOLLECTION,
    ),
    orderBy("uploadedAt", "desc"),
    limit(UPLOAD_HISTORY_LIMIT),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapUploadLog(d.id, d.data()));
}

export async function logUploadHistory(
  teacherId: string,
  entry: Omit<UploadHistoryLog, "id" | "uploadedAt">,
): Promise<void> {
  const db = requireFirestore();
  const ref = doc(
    collection(
      db,
      COLLECTIONS.uploadHistory,
      teacherId,
      UPLOAD_HISTORY_SUBCOLLECTION,
    ),
  );

  await setDoc(ref, {
    filename: entry.filename,
    uploadType: entry.uploadType,
    uploadedBy: entry.uploadedBy,
    recordsUploaded: entry.recordsUploaded,
    successCount: entry.successCount,
    failureCount: entry.failureCount,
    uploadedAt: serverTimestamp(),
  });
}
