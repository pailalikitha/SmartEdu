import { NextResponse } from "next/server";

import {
  createStudentWithParent,
  type CreateStudentParentInput,
} from "@/lib/server/create-student-parent";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateStudentParentInput;

    if (
      !body.studentName?.trim() ||
      !body.studentEmail?.trim() ||
      !body.rollNumber?.trim() ||
      !body.classId?.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Student name, email, roll number, and class are required." },
        { status: 400 },
      );
    }

    const result = await createStudentWithParent(body);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create student and parent accounts",
      },
      { status: 500 },
    );
  }
}
