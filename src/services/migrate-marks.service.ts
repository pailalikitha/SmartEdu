import {
  collection,
  collectionGroup,
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
  logResolvedStudentDebug,
  resolveStudentByCsvId,
} from "@/services/marks-student-resolver.service";

export type MigrateMarksResult = {
  parentsScanned: number;
  entriesMoved: number;
  migratedParents: number;
  skippedCount: number;
  parentsMigrated: Array<{ from: string; to: string; count: number }>;
  errors: string[];
  logs: string[];
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

function marksEntriesPath(parentId: string): string {
  return `${COLLECTIONS.marks}/${parentId}/${STUDENT_SUBCOLLECTIONS.markEntries}`;
}

function logMigrationConstants(): void {
  console.log("[marks-migrate] Firestore constants", {
    marksCollection: COLLECTIONS.marks,
    markEntriesSubcollection: STUDENT_SUBCOLLECTIONS.markEntries,
    examplePath: marksEntriesPath("{parentId}"),
  });
}

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

function parseMarksParentIdFromEntryPath(path: string): string | null {
  const parts = path.split("/");
  if (
    parts.length >= 4 &&
    parts[0] === COLLECTIONS.marks &&
    parts[2] === STUDENT_SUBCOLLECTIONS.markEntries
  ) {
    return parts[1];
  }
  return null;
}

/**
 * Discovers marks parent ids from entry subcollections.
 * Listing `marks` alone misses parents that only exist as subcollection paths.
 */
async function discoverMarksParentIds(
  db: ReturnType<typeof requireFirestore>,
): Promise<Set<string>> {
  const parentIds = new Set<string>();

  const entriesGroup = await getDocs(
    collectionGroup(db, STUDENT_SUBCOLLECTIONS.markEntries),
  );
  for (const entryDoc of entriesGroup.docs) {
    const parentId = parseMarksParentIdFromEntryPath(entryDoc.ref.path);
    if (parentId) parentIds.add(parentId);
  }

  const marksParents = await getDocs(collection(db, COLLECTIONS.marks));
  for (const parentDoc of marksParents.docs) {
    parentIds.add(parentDoc.id);
  }

  console.log("[marks-migrate] discovered marks parent ids", [...parentIds]);
  return parentIds;
}

async function countEntriesAtParent(parentId: string): Promise<number> {
  const db = requireFirestore();
  const snapshot = await getDocs(
    collection(
      db,
      COLLECTIONS.marks,
      parentId,
      STUDENT_SUBCOLLECTIONS.markEntries,
    ),
  );
  return snapshot.size;
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
          : `Failed migrating ${marksEntriesPath(fromParentId)}`,
    };
  }
}

/**
 * One-time migration: moves mark entries from legacy parent ids (e.g. roll numbers)
 * to marks/{canonicalStudentId}/entries.
 */
export async function migrateMisplacedMarksEntries(): Promise<MigrateMarksResult> {
  logMigrationConstants();

  const db = requireFirestore();
  const result: MigrateMarksResult = {
    parentsScanned: 0,
    entriesMoved: 0,
    migratedParents: 0,
    skippedCount: 0,
    parentsMigrated: [],
    errors: [],
    logs: [],
  };

  const parentIds = await discoverMarksParentIds(db);
  result.parentsScanned = parentIds.size;

  for (const legacyParentId of parentIds) {
    const sourcePath = marksEntriesPath(legacyParentId);
    const entriesFound = await countEntriesAtParent(legacyParentId);

    console.log("[marks-migrate] checking source", {
      legacyParentId,
      sourcePath,
      entriesFound,
    });

    if (entriesFound === 0) {
      result.skippedCount += 1;
      result.logs.push(
        `SKIP ${legacyParentId}: 0 entries at ${sourcePath}`,
      );
      continue;
    }

    const student = await resolveStudentByCsvId(legacyParentId);
    if (!student) {
      result.skippedCount += 1;
      const line = `SKIP ${legacyParentId}: no student match (${entriesFound} entries at ${sourcePath})`;
      result.logs.push(line);
      result.errors.push(line);
      console.warn("[marks-migrate]", line);
      continue;
    }

    const canonicalId = getCanonicalMarksStudentId(student);
    logResolvedStudentDebug("migrate", legacyParentId, student, canonicalId);

    const destPath = marksEntriesPath(canonicalId);

    if (legacyParentId === canonicalId) {
      result.skippedCount += 1;
      result.logs.push(
        `SKIP ${legacyParentId}: already canonical (${entriesFound} entries at ${sourcePath})`,
      );
      continue;
    }

    logMarksIdResolution("migrate", legacyParentId, canonicalId);
    console.log("[marks-migrate] migrating", {
      from: sourcePath,
      to: destPath,
      entriesFound,
      studentDocId: student.id,
      authUserId: student.authUserId,
      rollNumber: student.rollNumber,
      rollNo: student.rollNo,
      canonicalId,
    });

    const { moved, error } = await migrateEntriesBetweenParents(
      legacyParentId,
      canonicalId,
    );

    if (error) {
      result.errors.push(`${legacyParentId} -> ${canonicalId}: ${error}`);
      result.logs.push(
        `ERROR ${legacyParentId} -> ${canonicalId}: ${error}`,
      );
      continue;
    }

    if (moved > 0) {
      result.entriesMoved += moved;
      result.migratedParents += 1;
      result.parentsMigrated.push({
        from: legacyParentId,
        to: canonicalId,
        count: moved,
      });
      result.logs.push(
        `MIGRATED ${moved} entries: ${sourcePath} -> ${destPath}`,
      );
    } else {
      result.skippedCount += 1;
      result.logs.push(
        `SKIP ${legacyParentId}: resolved but 0 entries copied to ${destPath}`,
      );
    }
  }

  console.log("[marks-migrate] summary", result);
  return result;
}
