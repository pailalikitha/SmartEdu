"use client";

import { useState } from "react";

import { Button, Card, CardContent, Label, Text } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { studentCsvRowSchema } from "@/features/teacher/upload/schemas/upload.schema";
import { parseCsvFile } from "@/features/teacher/upload/utils/csv";
import { logUploadHistory } from "@/services/upload-history.service";
import { uploadStudentRows } from "@/services/upload-students.service";
import type { StudentCsvRow } from "@/types/upload";

type UploadStudentsSectionProps = {
  teacherId: string;
  onUploaded: () => void;
};

export function UploadStudentsSection({
  teacherId,
  onUploaded,
}: UploadStudentsSectionProps) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<StudentCsvRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [filename, setFilename] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setFilename(file.name);
    setSummary(null);

    try {
      const result = await parseCsvFile<StudentCsvRow>(file, (row) => {
        const parsed = studentCsvRowSchema.safeParse({
          ...row,
          studentEmail: row.studentEmail?.trim() ?? "",
          parentName: row.parentName?.trim() ?? "",
          parentEmail: row.parentEmail?.trim() ?? "",
          phone: row.phone?.trim() ?? "",
        });
        if (!parsed.success) {
          return {
            error: parsed.error.issues.map((i) => i.message).join("; "),
          };
        }
        return { data: parsed.data };
      });

      setPreview(result.validRows);
      setErrors(result.errors);
    } catch (err) {
      setPreview([]);
      setErrors([
        err instanceof Error ? err.message : "Failed to parse CSV file",
      ]);
    }
  };

  const handleUpload = async () => {
    if (preview.length === 0) {
      toast({ variant: "error", title: "No valid rows to upload." });
      return;
    }

    setIsUploading(true);
    setProgress(15);

    try {
      const result = await uploadStudentRows(preview, teacherId);
      setProgress(100);
      const message = `${result.successCount} records uploaded successfully, ${result.failureCount} failed`;
      setSummary(message);
      toast({
        variant: result.failureCount > 0 ? "error" : "success",
        title: message,
      });

      await logUploadHistory(teacherId, {
        filename: filename || "students.csv",
        uploadType: "students",
        uploadedBy: teacherId,
        recordsUploaded: preview.length,
        successCount: result.successCount,
        failureCount: result.failureCount,
      });

      onUploaded();
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <div>
          <h3 className="font-heading text-lg font-semibold">
            Upload student list
          </h3>
          <Text variant="muted" className="mt-1">
            CSV columns: studentId, studentName, rollNumber, classId,
            parentEmail, phone
          </Text>
        </div>

        <div className="space-y-2">
          <Label htmlFor="students-csv">CSV file</Label>
          <input
            id="students-csv"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground"
          />
        </div>

        {errors.length > 0 ? (
          <div
            role="alert"
            className="max-h-32 overflow-y-auto rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive"
          >
            {errors.slice(0, 8).map((err) => (
              <p key={err}>{err}</p>
            ))}
          </div>
        ) : null}

        {preview.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[36rem] text-sm">
              <thead className="bg-muted/40">
                <tr>
                  {[
                    "studentId",
                    "studentName",
                    "rollNumber",
                    "classId",
                    "parentEmail",
                    "phone",
                  ].map((h) => (
                    <th key={h} className="px-2 py-2 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, i) => (
                  <tr key={`${row.studentId}-${i}`} className="border-t border-border/60">
                    <td className="px-2 py-1.5">{row.studentId}</td>
                    <td className="px-2 py-1.5">{row.studentName}</td>
                    <td className="px-2 py-1.5">{row.rollNumber}</td>
                    <td className="px-2 py-1.5">{row.classId}</td>
                    <td className="px-2 py-1.5">{row.parentEmail || "—"}</td>
                    <td className="px-2 py-1.5">{row.phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {isUploading ? (
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}

        {summary ? (
          <p className="text-sm font-medium text-foreground" role="status">
            {summary}
          </p>
        ) : null}

        <Button
          type="button"
          disabled={preview.length === 0 || isUploading}
          isLoading={isUploading}
          onClick={() => void handleUpload()}
        >
          Confirm upload
        </Button>
      </CardContent>
    </Card>
  );
}
