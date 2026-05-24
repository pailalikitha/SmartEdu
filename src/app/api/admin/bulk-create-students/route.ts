import { NextResponse } from "next/server";

import {
  createStudentWithParent,
  type CreateStudentParentInput,
} from "@/lib/server/create-student-parent";

type BulkRow = CreateStudentParentInput;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rows = Array.isArray(body?.rows) ? (body.rows as BulkRow[]) : [];

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "No rows provided." },
        { status: 400 },
      );
    }

    const results: Array<{
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
    }> = [];

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (
          !row.studentName?.trim() ||
          !row.studentEmail?.trim() ||
          !row.rollNumber?.trim() ||
          !row.classId?.trim()
        ) {
          throw new Error("Missing required fields");
        }

        const created = await createStudentWithParent(row);
        successCount += 1;
        results.push({
          row: i + 1,
          success: true,
          studentEmail: created.studentEmail,
          credentials: {
            studentEmail: created.studentEmail,
            studentPassword: created.studentPassword,
            parentEmail: created.parentEmail,
            parentPassword: created.parentPassword,
          },
        });
      } catch (error) {
        failureCount += 1;
        results.push({
          row: i + 1,
          success: false,
          studentEmail: row.studentEmail,
          error: error instanceof Error ? error.message : "Failed",
        });
      }
    }

    return NextResponse.json({
      success: true,
      successCount,
      failureCount,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Bulk upload failed",
      },
      { status: 500 },
    );
  }
}
