"use client";

import { Download, GraduationCap, Plus, RefreshCw, Search } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button, Card, CardContent, Input, Text } from "@/components/ui";
import { ConfirmModal } from "@/components/ui/modal";
import {
  StudentFormDialog,
  toStudentInput,
} from "@/features/admin/students/components/student-form-dialog";
import { StudentTable } from "@/features/admin/students/components/student-table";
import { useStudents } from "@/features/admin/students/hooks/use-students";
import type { StudentFormValues } from "@/features/admin/students/schemas/student.schema";
import type { Student } from "@/types/student";
import { getStudentFullName } from "@/types/student";

export function StudentManagement() {
  const {
    students,
    totalCount,
    searchQuery,
    setSearchQuery,
    isLoading,
    isSubmitting,
    error,
    refresh,
    addStudent,
    editStudent,
    removeStudent,
  } = useStudents();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const openAdd = () => {
    setFormMode("add");
    setSelectedStudent(null);
    setFormOpen(true);
  };

  const openEdit = (student: Student) => {
    setFormMode("edit");
    setSelectedStudent(student);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: StudentFormValues) => {
    const input = toStudentInput(values);
    if (formMode === "add") {
      await addStudent(input);
    } else if (selectedStudent) {
      await editStudent(selectedStudent.id, input);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await removeStudent(deleteTarget.id);
    setDeleteTarget(null);
  };

  const exportCsv = async () => {
    const XLSX = await import("xlsx");
    const rows = students.map((s) => ({
      Name: getStudentFullName(s),
      Email: s.email,
      Roll: s.rollNumber,
      Grade: s.grade,
      Section: s.section,
      Status: s.status,
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Students");
    XLSX.writeFile(book, "students-export.xlsx");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student management"
        description="Add, edit, and manage student records. Data is stored in Firestore."
        action={
          <Button onClick={openAdd} className="w-full sm:w-auto">
            <Plus className="size-4" aria-hidden />
            Add student
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search by name, email, roll number, class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full bg-muted/40 pl-9"
              aria-label="Search students"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
            <Text variant="muted" className="text-sm">
              {students.length} of {totalCount} students
            </Text>
            <Button variant="outline" size="sm" onClick={() => void exportCsv()}>
              <Download className="size-4" aria-hidden />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refresh()}
              disabled={isLoading}
            >
              <RefreshCw
                className={isLoading ? "size-4 animate-spin" : "size-4"}
                aria-hidden
              />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div
            className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            role="status"
            aria-label="Loading students"
          />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No students found" : "No students yet"}
          description={
            searchQuery
              ? "Try a different search term or clear the filter."
              : "Add your first student to get started."
          }
          icon={<GraduationCap className="size-10" />}
          actionLabel={searchQuery ? undefined : "Add student"}
          onAction={searchQuery ? undefined : openAdd}
        />
      ) : (
        <StudentTable
          students={students}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      )}

      <StudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        student={selectedStudent}
        isSubmitting={isSubmitting}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete student"
        description={
          deleteTarget
            ? `Remove ${getStudentFullName(deleteTarget)} from the directory? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={isSubmitting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
