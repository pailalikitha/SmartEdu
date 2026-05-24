"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy } from "lucide-react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button, FormField, Label, Text } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import {
  studentEditFormSchema,
  studentFormSchema,
  type StudentEditFormValues,
  type StudentFormValues,
  GRADE_OPTIONS,
  SECTION_OPTIONS,
} from "@/features/admin/students/schemas/student.schema";
import {
  generateParentPassword,
  generateStudentPassword,
} from "@/lib/auth/credentials";
import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { mapClassDoc } from "@/services/classes.service";
import { cn } from "@/lib/utils";
import type { ClassRoom } from "@/types/class";
import type { Student } from "@/types/student";

type StudentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  student?: Student | null;
  isSubmitting?: boolean;
  onSubmit: (values: StudentFormValues) => Promise<void>;
  onEditSubmit?: (values: StudentEditFormValues) => Promise<void>;
};

const addDefaults: StudentFormValues = {
  studentName: "",
  studentEmail: "",
  rollNumber: "",
  classId: "",
  parentName: "",
  parentEmail: "",
};

function studentToEditValues(student: Student): StudentEditFormValues {
  return {
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    rollNumber: student.rollNumber,
    grade: student.grade,
    section: student.section,
    guardianName: student.guardianName ?? "",
    guardianContact: student.guardianContact ?? "",
    status: student.status,
  };
}

function CopyablePassword({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-sm">{value}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0"
        onClick={() => void navigator.clipboard.writeText(value)}
        aria-label={`Copy ${label}`}
      >
        <Copy className="size-4" />
      </Button>
    </div>
  );
}

export function StudentFormDialog({
  open,
  onOpenChange,
  mode,
  student,
  isSubmitting = false,
  onSubmit,
  onEditSubmit,
}: StudentFormDialogProps) {
  const [classes, setClasses] = useState<ClassRoom[]>([]);

  const addForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: addDefaults,
  });

  const editForm = useForm<StudentEditFormValues>({
    resolver: zodResolver(studentEditFormSchema),
    defaultValues: studentToEditValues(
      student ?? {
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        rollNumber: "",
        grade: "10",
        section: "A",
        status: "active",
      },
    ),
  });

  useEffect(() => {
    if (!open) return;
    const db = requireFirestore();
    const unsub = onSnapshot(
      query(collection(db, COLLECTIONS.classes), orderBy("name")),
      (snap) => {
        setClasses(snap.docs.map((d) => mapClassDoc(d.id, d.data())));
      },
    );
    return () => unsub();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (mode === "add") {
      addForm.reset(addDefaults);
    } else if (student) {
      editForm.reset(studentToEditValues(student));
    }
  }, [open, mode, student, addForm, editForm]);

  const rollNumber = addForm.watch("rollNumber");
  const parentEmail = addForm.watch("parentEmail");

  const studentPassword = useMemo(
    () => (rollNumber.trim() ? generateStudentPassword(rollNumber) : ""),
    [rollNumber],
  );
  const parentPassword = useMemo(
    () => (rollNumber.trim() ? generateParentPassword(rollNumber) : ""),
    [rollNumber],
  );

  const handleAddSubmit = addForm.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const handleEditSubmit = editForm.handleSubmit(async (values) => {
    if (onEditSubmit) await onEditSubmit(values);
  });

  if (mode === "edit") {
    return (
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="Edit student"
        description="Update student directory details."
        size="lg"
        className="sm:max-w-lg"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="student-edit-form"
              size="sm"
              isLoading={isSubmitting}
            >
              Save changes
            </Button>
          </>
        }
      >
        <form
          id="student-edit-form"
          className="space-y-4"
          onSubmit={(e) => void handleEditSubmit(e)}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="First name"
              error={editForm.formState.errors.firstName?.message}
              {...editForm.register("firstName")}
            />
            <FormField
              label="Last name"
              error={editForm.formState.errors.lastName?.message}
              {...editForm.register("lastName")}
            />
          </div>
          <FormField
            label="Email"
            type="email"
            error={editForm.formState.errors.email?.message}
            {...editForm.register("email")}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              label="Roll number"
              error={editForm.formState.errors.rollNumber?.message}
              {...editForm.register("rollNumber")}
            />
            <div className="space-y-2">
              <Label htmlFor="edit-grade">Grade</Label>
              <select
                id="edit-grade"
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                {...editForm.register("grade")}
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-section">Section</Label>
              <select
                id="edit-section"
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                {...editForm.register("section")}
              >
                {SECTION_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add student"
      description="Creates student and parent Firebase accounts with linked Firestore records."
      size="lg"
      className="sm:max-w-lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="student-add-form"
            size="sm"
            isLoading={isSubmitting}
          >
            Create accounts
          </Button>
        </>
      }
    >
      <form
        id="student-add-form"
        className="space-y-6"
        onSubmit={(e) => void handleAddSubmit(e)}
        noValidate
      >
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">1. Student details</h3>
          <FormField
            label="Student name"
            error={addForm.formState.errors.studentName?.message}
            {...addForm.register("studentName")}
          />
          <FormField
            label="Student email"
            type="email"
            error={addForm.formState.errors.studentEmail?.message}
            {...addForm.register("studentEmail")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Roll number"
              error={addForm.formState.errors.rollNumber?.message}
              {...addForm.register("rollNumber")}
            />
            <div className="space-y-2">
              <Label htmlFor="classId">Class</Label>
              <select
                id="classId"
                className={cn(
                  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm",
                  addForm.formState.errors.classId && "border-destructive",
                )}
                {...addForm.register("classId")}
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {addForm.formState.errors.classId?.message ? (
                <Text variant="caption" className="text-destructive">
                  {addForm.formState.errors.classId.message}
                </Text>
              ) : null}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">2. Parent details</h3>
          <FormField
            label="Parent name"
            error={addForm.formState.errors.parentName?.message}
            {...addForm.register("parentName")}
          />
          <FormField
            label="Parent email"
            type="email"
            error={addForm.formState.errors.parentEmail?.message}
            {...addForm.register("parentEmail")}
          />
          {!parentEmail?.trim() ? (
            <p className="text-xs text-warning">
              No parent email — parent account will be skipped.
            </p>
          ) : null}
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">3. Auto-generated passwords</h3>
          {studentPassword ? (
            <div className="space-y-2">
              <CopyablePassword label="Student password" value={studentPassword} />
              {parentEmail?.trim() ? (
                <CopyablePassword label="Parent password" value={parentPassword} />
              ) : null}
            </div>
          ) : (
            <Text variant="muted" className="text-sm">
              Enter a roll number to preview passwords.
            </Text>
          )}
        </section>
      </form>
    </Modal>
  );
}
