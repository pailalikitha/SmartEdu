import {
  collection,
  doc,
  getDocs,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";

import {
  BATCH_WRITE_CHUNK,
  COLLECTIONS,
  STUDENT_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import {
  getCanonicalMarksStudentId,
  logMarksIdResolution,
  resolveStudentByCsvId,
} from "@/services/marks-student-resolver.service";

export type MigrateMarksResult = {
  parentsScanned: number;
  entriesMoved: number;
  parentsMigrated: Array<{ from: string; to: string; count: number }>;
  errors: string[];
};

const PRESERVED_ENTRY_FIELDS = [
  "subject",
  "marksObtained",
  "score",
  "totalMarks",
  "examType",
  "date",
  "studentName",
] as const;

function pickPreservedFields(data: DocumentData): DocumentData {
  const out: DocumentData = {};
  for (const key of PRESERVED_ENTRY_FIELDS) {
    if (data[key] !== undefined) {
      out[key] = data[key];
    }
  }
  if (data.uploadedBy !== undefined) out.uploadedBy = data.uploadedBy;
  if (data.uploadedAt !== undefined) out.uploadedAt = data.uploadedAt;
  return out;
}

async function migrateEntriesBetweenParents(
  fromParentId: string,
  toParentId: string,
): Promise<{ moved: number; error?: string }> {
  if (fromParentId === toParentId) {
    return { moved: 0 };
  }

  const db = requireFirestore();
  const sourceRef = collection(
    db,
    COLLECTIONS.marks,
    fromParentId,
    STUDENT_SUBCOLLECTIONS.markEntries,
  );
  const snapshot = await getDocs(sourceRef);
  if (snapshot.empty) {
    return { moved: 0 };
  }

  type BatchOp = {
    setRef: ReturnType<typeof doc>;
    data: DocumentData;
    deleteRef: ReturnType<typeof doc>;
  };

  const ops: BatchOp[] = [];

  for (const entry of snapshot.docs) {
    const targetRef = doc(
      collection(
        db,
        COLLECTIONS.marks,
        toParentId,
        STUDENT_SUBCOLLECTIONS.markEntries,
      ),
      entry.id,
    );
    ops.push({
      setRef: targetRef,
      data: pickPreservedFields(entry.data()),
      deleteRef: entry.ref,
    });
  }

  const opsPerEntry = 2;
  const chunkSize = Math.floor(BATCH_WRITE_CHUNK / opsPerEntry);

  try {
    for (let i = 0; i < ops.length; i += chunkSize) {
      const chunk = ops.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const { setRef, data, deleteRef } of chunk) {
        batch.set(setRef, data);
        batch.delete(deleteRef);
      }
      await batch.commit();
    }
    return { moved: snapshot.size };
  } catch (err) {
    return {
      moved: 0,
      error:
        err instanceof Error
          ? err.message
          : `Failed migrating marks/${fromParentId}/entries`,
    };
  }
}

/**
 * One-time migration: moves mark entries from legacy parent ids (e.g. roll numbers)
 * to marks/{canonicalStudentId}/entries.
 */
export async function migrateMisplacedMarksEntries(): Promise<MigrateMarksResult> {
  const db = requireFirestore();
  const result: MigrateMarksResult = {
    parentsScanned: 0,
    entriesMoved: 0,
    parentsMigrated: [],
    errors: [],
  };

  const parentsSnap = await getDocs(collection(db, COLLECTIONS.marks));
  result.parentsScanned = parentsSnap.size;

  for (const parentDoc of parentsSnap.docs) {
    const legacyParentId = parentDoc.id;
    const student = await resolveStudentByCsvId(legacyParentId);
    if (!student) {
      continue;
    }

    const canonicalId = getCanonicalMarksStudentId(student);
    if (legacyParentId === canonicalId) {
      continue;
    }

    logMarksIdResolution(legacyParentId, canonicalId);

    const { moved, error } = await migrateEntriesBetweenParents(
      legacyParentId,
      canonicalId,
    );

    if (error) {
      result.errors.push(`${legacyParentId} -> ${canonicalId}: ${error}`);
      continue;
    }

    if (moved > 0) {
      result.entriesMoved += moved;
      result.parentsMigrated.push({
        from: legacyParentId,
        to: canonicalId,
        count: moved,
      });
    }
  }

  return result;
}
