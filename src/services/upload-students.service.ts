import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import type { StudentCsvRow, UploadResultSummary } from "@/types/upload";

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export async function uploadStudentRows(
  rows: StudentCsvRow[],
  uploadedBy: string,
): Promise<UploadResultSummary> {
  const db = requireFirestore();
  const summary: UploadResultSummary = {
    successCount: 0,
    failureCount: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const { firstName, lastName } = splitName(row.studentName);
      await setDoc(
        doc(db, COLLECTIONS.students, row.studentId),
        {
          firstName,
          lastName,
          email: row.parentEmail || `${row.studentId}@students.local`,
          rollNumber: row.rollNumber,
          classId: row.classId,
          guardianContact: row.phone || null,
          guardianName: null,
          parentEmail: row.parentEmail || null,
          grade: "",
          section: "",
          status: "active",
          uploadedBy,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      if (row.parentEmail) {
        try {
          await fetch("/api/students/create-parent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: row.parentEmail,
              displayName: `${firstName} ${lastName}`.trim() || row.studentName,
              studentId: row.studentId,
            }),
          });
        } catch {
          // Student saved; parent auth is best-effort when Admin SDK is configured.
        }
      }

      summary.successCount += 1;
    } catch (err) {
      summary.failureCount += 1;
      summary.errors.push(
        `Row ${i + 2}: ${err instanceof Error ? err.message : "Upload failed"}`,
      );
    }
  }

  return summary;
}
