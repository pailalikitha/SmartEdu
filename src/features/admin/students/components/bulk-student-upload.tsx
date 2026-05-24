"use client";

import Papa from "papaparse";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button, Card, CardContent, Text } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { BULK_STUDENT_CSV_HEADERS } from "@/features/admin/students/schemas/student.schema";
import { bulkCreateStudentsWithParents } from "@/services/create-student-parent.service";
import type { CreateStudentParentInput } from "@/lib/server/create-student-parent";

type BulkStudentUploadProps = {
  onComplete?: () => void;
};

export function BulkStudentUpload({ onComplete }: BulkStudentUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<{
    successCount: number;
    failureCount: number;
    errors: string[];
  } | null>(null);

  const handleFile = (file: File) => {
    setIsUploading(true);
    setSummary(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          const rows: CreateStudentParentInput[] = result.data.map((row) => ({
            studentName: row.studentName?.trim() ?? "",
            studentEmail: row.studentEmail?.trim() ?? "",
            rollNumber: row.rollNumber?.trim() ?? "",
            classId: row.classId?.trim() ?? "",
            parentName: row.parentName?.trim() ?? "",
            parentEmail: row.parentEmail?.trim() ?? "",
          }));

          const data = await bulkCreateStudentsWithParents(rows);
          const errors = data.results
            .filter((r) => !r.success)
            .map((r) => `Row ${r.row}: ${r.error ?? "Failed"}`);

          setSummary({
            successCount: data.successCount,
            failureCount: data.failureCount,
            errors,
          });

          toast({
            title: `Bulk upload: ${data.successCount} created, ${data.failureCount} failed.`,
            variant: data.failureCount > 0 ? "error" : "success",
          });
          onComplete?.();
        } catch (err) {
          toast({
            title: err instanceof Error ? err.message : "Bulk upload failed",
            variant: "error",
          });
        } finally {
          setIsUploading(false);
        }
      },
      error: () => {
        toast({ title: "Could not parse CSV file.", variant: "error" });
        setIsUploading(false);
      },
    });
  };

  return (
    <Card>
      <CardContent className="space-y-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Bulk CSV upload</p>
            <Text variant="muted" className="text-sm">
              Columns: {BULK_STUDENT_CSV_HEADERS.join(", ")}
            </Text>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" aria-hidden />
            {isUploading ? "Uploading…" : "Upload CSV"}
          </Button>
        </div>

        {summary ? (
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
            <p>
              <strong>{summary.successCount}</strong> created,{" "}
              <strong>{summary.failureCount}</strong> failed.
            </p>
            {summary.errors.length > 0 ? (
              <ul className="mt-2 max-h-32 list-inside list-disc overflow-y-auto text-destructive">
                {summary.errors.slice(0, 10).map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
