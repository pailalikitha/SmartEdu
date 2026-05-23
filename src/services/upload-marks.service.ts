import { collection, doc, serverTimestamp } from "firebase/firestore";

import {
  COLLECTIONS,
  STUDENT_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { runBatchedSet } from "@/lib/firebase/firestore/helpers";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import type { MarksCsvRow, UploadResultSummary } from "@/types/upload";

function computeScore(marksObtained: number, totalMarks: number): number {
  if (totalMarks <= 0) return 0;
  return Math.round((marksObtained / totalMarks) * 1000) / 10;
}

export async function uploadMarksRows(
  rows: MarksCsvRow[],
  uploadedBy: string,
): Promise<UploadResultSummary> {
  const db = requireFirestore();
  const summary: UploadResultSummary = {
    successCount: 0,
    failureCount: 0,
    errors: [],
  };

  const operations: Array<{
    ref: ReturnType<typeof doc>;
    data: Record<string, unknown>;
    merge?: boolean;
  }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const ref = doc(
        collection(
          db,
          COLLECTIONS.marks,
          row.studentId,
          STUDENT_SUBCOLLECTIONS.markEntries,
        ),
      );

      operations.push({
        ref,
        data: {
          subject: row.subject,
          marksObtained: row.marksObtained,
          totalMarks: row.totalMarks,
          score: computeScore(row.marksObtained, row.totalMarks),
          examType: row.examType,
          date: row.date,
          studentName: row.studentName,
          uploadedBy,
          uploadedAt: serverTimestamp(),
        },
      });
      summary.successCount += 1;
    } catch (err) {
      summary.failureCount += 1;
      summary.errors.push(
        `Row ${i + 2}: ${err instanceof Error ? err.message : "Failed to prepare upload"}`,
      );
    }
  }

  try {
    await runBatchedSet(db, operations);
  } catch (err) {
    summary.failureCount += summary.successCount;
    summary.successCount = 0;
    summary.errors.push(
      err instanceof Error ? err.message : "Batch upload failed",
    );
  }

  return summary;
}
