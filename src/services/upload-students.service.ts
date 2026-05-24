import type { StudentCsvRow, UploadResultSummary } from "@/types/upload";
import { bulkCreateStudentsWithParents } from "@/services/create-student-parent.service";

export async function uploadStudentRows(
  rows: StudentCsvRow[],
  _uploadedBy: string,
): Promise<UploadResultSummary> {
  const payload = rows.map((row) => {
    const roll = row.rollNumber.trim();
    const slug = roll.replace(/\W+/g, "").toLowerCase() || "student";
    return {
      studentName: row.studentName,
      studentEmail:
        row.studentEmail?.trim() ||
        `${slug}@students.local`,
      rollNumber: roll,
      classId: row.classId,
      parentName: row.parentName?.trim() || undefined,
      parentEmail: row.parentEmail?.trim() || undefined,
    };
  });

  const result = await bulkCreateStudentsWithParents(payload);

  return {
    successCount: result.successCount,
    failureCount: result.failureCount,
    errors: result.results
      .filter((r) => !r.success)
      .map((r) => `Row ${r.row}: ${r.error ?? "Failed"}`),
  };
}
