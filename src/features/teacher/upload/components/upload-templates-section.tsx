"use client";

import { Download } from "lucide-react";

import { Button, Card, CardContent, Text } from "@/components/ui";
import {
  downloadCsv,
  MARKS_TEMPLATE_ROWS,
  STUDENT_TEMPLATE_ROWS,
} from "@/features/teacher/upload/utils/csv";

export function UploadTemplatesSection() {
  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <div>
          <h3 className="font-heading text-lg font-semibold">
            Download templates
          </h3>
          <Text variant="muted" className="mt-1">
            CSV files include headers and two example rows.
          </Text>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() =>
              downloadCsv(
                "marks-template.csv",
                MARKS_TEMPLATE_ROWS.map((r) => [...r]),
              )
            }
          >
            <Download className="size-4" aria-hidden />
            Download marks template
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() =>
              downloadCsv(
                "students-template.csv",
                STUDENT_TEMPLATE_ROWS.map((r) => [...r]),
              )
            }
          >
            <Download className="size-4" aria-hidden />
            Download student template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
