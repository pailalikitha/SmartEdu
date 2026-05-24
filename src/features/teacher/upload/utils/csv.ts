import Papa from "papaparse";

export type ParsedCsvResult<T> = {
  validRows: T[];
  errors: string[];
};

export function parseCsvFile<T>(
  file: File,
  mapRow: (row: Record<string, string>, lineNumber: number) => {
    data?: T;
    error?: string;
  },
): Promise<ParsedCsvResult<T>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const validRows: T[] = [];
        const errors: string[] = [];

        results.data.forEach((row, index) => {
          const lineNumber = index + 2;
          const mapped = mapRow(row, lineNumber);
          if (mapped.error) errors.push(`Line ${lineNumber}: ${mapped.error}`);
          else if (mapped.data) validRows.push(mapped.data);
        });

        if (results.errors.length > 0) {
          for (const err of results.errors) {
            errors.push(err.message ?? "CSV parse error");
          }
        }

        resolve({ validRows, errors });
      },
      error: (error) => reject(error),
    });
  });
}

export function downloadCsv(filename: string, rows: string[][]) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const MARKS_TEMPLATE_ROWS = [
  [
    "studentId",
    "studentName",
    "subject",
    "marksObtained",
    "totalMarks",
    "examType",
    "date",
  ],
  [
    "stu_001",
    "Aarav Sharma",
    "Mathematics",
    "42",
    "50",
    "Unit Test",
    "2025-05-20",
  ],
  [
    "stu_002",
    "Priya Patel",
    "Physics",
    "38",
    "50",
    "Unit Test",
    "2025-05-20",
  ],
] as const;

export const STUDENT_TEMPLATE_ROWS = [
  [
    "studentName",
    "studentEmail",
    "rollNumber",
    "classId",
    "parentName",
    "parentEmail",
  ],
  [
    "Aarav Sharma",
    "aarav@school.edu",
    "101",
    "class_10a",
    "Raj Sharma",
    "parent1@email.com",
  ],
  [
    "Priya Patel",
    "priya@school.edu",
    "102",
    "class_10a",
    "Anita Patel",
    "parent2@email.com",
  ],
] as const;
