import {
  writeBatch,
  type DocumentData,
  type Firestore,
  type Timestamp,
} from "firebase/firestore";

import { BATCH_WRITE_CHUNK } from "@/lib/firebase/firestore/constants";

/** Composite key for class-scoped queries: `10_A` */
export function buildClassKey(grade: string, section: string): string {
  return `${grade}_${section}`;
}

/** Partition key for monthly attendance: `2025-05` */
export function buildYearMonth(date: string): string {
  return date.slice(0, 7);
}

export function toDate(value: Timestamp | undefined): Date | undefined {
  return value?.toDate?.();
}

export function stripUndefined<T extends Record<string, unknown>>(data: T): DocumentData {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  ) as DocumentData;
}

export async function runBatchedSet(
  db: Firestore,
  operations: Array<{
    ref: ReturnType<typeof import("firebase/firestore").doc>;
    data: DocumentData;
    merge?: boolean;
  }>,
): Promise<void> {
  for (let i = 0; i < operations.length; i += BATCH_WRITE_CHUNK) {
    const chunk = operations.slice(i, i + BATCH_WRITE_CHUNK);
    const batch = writeBatch(db);

    for (const { ref, data, merge } of chunk) {
      batch.set(ref, data, { merge: merge ?? false });
    }

    await batch.commit();
  }
}
