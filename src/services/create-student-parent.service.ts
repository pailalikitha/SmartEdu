import type { CreateStudentParentInput } from "@/lib/server/create-student-parent";

export type CreateStudentParentResponse = {
  success: boolean;
  error?: string;
  studentUid?: string;
  parentUid?: string | null;
  studentEmail?: string;
  parentEmail?: string | null;
  studentPassword?: string;
  parentPassword?: string | null;
  parentReused?: boolean;
  emailsSent?: { student: boolean; parent: boolean };
  emailWarnings?: string[];
};

export async function createStudentWithParentAccount(
  input: CreateStudentParentInput,
): Promise<CreateStudentParentResponse> {
  const response = await fetch("/api/admin/create-student-with-parent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as CreateStudentParentResponse;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to create accounts");
  }

  return data;
}

export type BulkCreateResult = {
  success: boolean;
  successCount: number;
  failureCount: number;
  results: Array<{
    row: number;
    success: boolean;
    studentEmail?: string;
    error?: string;
    credentials?: {
      studentEmail: string;
      studentPassword: string;
      parentEmail: string | null;
      parentPassword: string | null;
    };
  }>;
  error?: string;
};

export async function bulkCreateStudentsWithParents(
  rows: CreateStudentParentInput[],
): Promise<BulkCreateResult> {
  const response = await fetch("/api/admin/bulk-create-students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows }),
  });

  const data = (await response.json()) as BulkCreateResult;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Bulk upload failed");
  }

  return data;
}
