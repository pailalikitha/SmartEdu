import { collection, doc, serverTimestamp } from "firebase/firestore";

import {
  COLLECTIONS,
  STUDENT_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { runBatchedSet } from "@/lib/firebase/firestore/helpers";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import {
  getCanonicalMarksStudentId,
  logMarksIdResolution,
  resolveStudentByCsvId,
} from "@/services/marks-student-resolver.service";
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

  const resolvedCanonicalByCsv = new Map<string, string>();
  const loggedResolutions = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const csvId = row.studentId.trim();

    try {
      let canonicalId = resolvedCanonicalByCsv.get(csvId);
      if (!canonicalId) {
        const student = await resolveStudentByCsvId(csvId);
        if (!student) {
          summary.failureCount += 1;
          summary.errors.push(
            `Row ${i + 2}: No student found for studentId "${csvId}" (checked document ID, authUserId, rollNumber, rollNo).`,
          );
          continue;
        }
        canonicalId = getCanonicalMarksStudentId(student);
        resolvedCanonicalByCsv.set(csvId, canonicalId);

        const logKey = `${csvId}->${canonicalId}`;
        if (!loggedResolutions.has(logKey)) {
          logMarksIdResolution("upload", csvId, canonicalId);
          loggedResolutions.add(logKey);
        }
      }

      const ref = doc(
        collection(
          db,
          COLLECTIONS.marks,
          canonicalId,
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

  if (operations.length === 0) {
    return summary;
  }

  try {
    await runBatchedSet(db, operations);

    const byStudentSubject = new Map<
      string,
      { subject: string; scores: number[] }
    >();

    for (const row of rows) {
      const csvId = row.studentId.trim();
      const canonicalId = resolvedCanonicalByCsv.get(csvId);
      if (!canonicalId) continue;

      const pct = computeScore(row.marksObtained, row.totalMarks);
      const key = `${canonicalId}::${row.subject}`;
      const current = byStudentSubject.get(key) ?? {
        subject: row.subject,
        scores: [],
      };
      current.scores.push(pct);
      byStudentSubject.set(key, current);
    }

    for (const [key, { subject, scores }] of byStudentSubject) {
      const studentId = key.split("::")[0];
      const { notifyMarksUploaded } = await import(
        "@/services/notifications.service"
      );
      await notifyMarksUploaded([studentId], subject);

      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < 60) {
        const { notifyWeakSubject } = await import(
          "@/services/notifications.service"
        );
        await notifyWeakSubject(
          studentId,
          subject,
          Math.round(avg * 10) / 10,
        );
      }
    }
  } catch (err) {
    summary.failureCount += summary.successCount;
    summary.successCount = 0;
    summary.errors.push(
      err instanceof Error ? err.message : "Batch upload failed",
    );
  }

  return summary;
}
