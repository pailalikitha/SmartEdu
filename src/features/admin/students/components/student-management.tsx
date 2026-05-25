"use client";

import { Download, GraduationCap, Plus, RefreshCw, Search } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button, Card, CardContent, Input, Text } from "@/components/ui";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { BulkStudentUpload } from "@/features/admin/students/components/bulk-student-upload";
import {
  CredentialsSuccessModal,
  type AccountCredentials,
} from "@/features/admin/students/components/credentials-success-modal";
import { StudentFormDialog } from "@/features/admin/students/components/student-form-dialog";
import { StudentTable } from "@/features/admin/students/components/student-table";
import { useStudents } from "@/features/admin/students/hooks/use-students";
import type {
  StudentEditFormValues,
  StudentFormValues,
} from "@/features/admin/students/schemas/student.schema";
import type { Student, StudentInput } from "@/types/student";
import { getStudentFullName } from "@/types/student";
import { createStudentWithParentAccount } from "@/services/create-student-parent.service";
import { exportToCSV } from "@/lib/utils/export";

function editValuesToInput(values: StudentEditFormValues): StudentInput {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    rollNumber: values.rollNumber.trim(),
    grade: values.grade,
    section: values.section,
    guardianName: values.guardianName?.trim() || undefined,
    guardianContact: values.guardianContact?.trim() || undefined,
    status: values.status,
  };
}

export function StudentManagement() {
  const { toast } = useToast();
  const {
    students,
    totalCount,
    searchQuery,
    setSearchQuery,
    isLoading,
    isSubmitting,
    error,
    refresh,
    editStudent,
    removeStudent,
  } = useStudents();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [credentials, setCredentials] = useState<AccountCredentials | null>(null);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  const handleAddSubmit = async (values: StudentFormValues) => {
    setIsCreating(true);
    try {
    const result = await createStudentWithParentAccount({
      studentName: values.studentName.trim(),
      studentEmail: values.studentEmail.trim().toLowerCase(),
      rollNumber: values.rollNumber.trim(),
      classId: values.classId,
      parentName: values.parentName?.trim() || undefined,
      parentEmail: values.parentEmail?.trim().toLowerCase() || undefined,
    });

    await refresh();

    setCredentials({
      studentName: values.studentName,
      studentEmail: result.studentEmail ?? values.studentEmail,
      studentPassword: result.studentPassword ?? "",
      parentName: values.parentName,
      parentEmail: result.parentEmail,
      parentPassword: result.parentPassword,
      parentReused: result.parentReused,
      emailWarnings: result.emailWarnings,
    });
    setCredentialsOpen(true);
    setFormOpen(false);

    toast({
      title: "Student and parent accounts created.",
      variant: "success",
    });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Failed to create accounts",
        variant: "error",
      });
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditSubmit = async (values: StudentEditFormValues) => {
    if (!selectedStudent) return;
    await editStudent(selectedStudent.id, editValuesToInput(values));
    setFormOpen(false);
    toast({ title: "Student updated.", variant: "success" });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await removeStudent(deleteTarget.id);
    setDeleteTarget(null);
  };

  const exportCsv = async () => {
    const rows = students.map((s) => ({
      Name: getStudentFullName(s),
      Email: s.email,
      Roll: s.rollNumber,
      Grade: s.grade,
      Section: s.section,
      Status: s.status,
    }));
    await exportToCSV(rows, "students-export.xlsx");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student management"
        description="Create student and parent accounts with linked Firestore records."
        action={
          <Button onClick={openAdd} className="w-full sm:w-auto">
            <Plus className="size-4" aria-hidden />
            Add student
          </Button>
        }
      />

      <BulkStudentUpload onComplete={() => void refresh()} />

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
        isSubmitting={isCreating || isSubmitting}
        onSubmit={handleAddSubmit}
        onEditSubmit={handleEditSubmit}
      />

      <CredentialsSuccessModal
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        credentials={credentials}
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
