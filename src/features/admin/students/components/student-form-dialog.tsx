"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button, FormField, Label, Text } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import {
  GRADE_OPTIONS,
  SECTION_OPTIONS,
  studentFormSchema,
  type StudentFormValues,
} from "@/features/admin/students/schemas/student.schema";
import { cn } from "@/lib/utils";
import type { Student } from "@/types/student";

type StudentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  student?: Student | null;
  isSubmitting?: boolean;
  onSubmit: (values: StudentFormValues) => Promise<void>;
};

const defaultValues: StudentFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  rollNumber: "",
  grade: "10",
  section: "A",
  guardianName: "",
  guardianContact: "",
  status: "active",
};

function studentToFormValues(student: Student): StudentFormValues {
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

function toStudentInput(values: StudentFormValues) {
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

export function StudentFormDialog({
  open,
  onOpenChange,
  mode,
  student,
  isSubmitting = false,
  onSubmit,
}: StudentFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(mode === "edit" && student ? studentToFormValues(student) : defaultValues);
  }, [open, mode, student, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "add" ? "Add student" : "Edit student"}
      description={
        mode === "add"
          ? "Register a new student in the school directory."
          : "Update student details and save changes."
      }
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
            form="student-form"
            size="sm"
            isLoading={isSubmitting}
          >
            {mode === "add" ? "Add student" : "Save changes"}
          </Button>
        </>
      }
    >
      <form
        id="student-form"
        className="space-y-4"
        onSubmit={handleFormSubmit}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="First name"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <FormField
            label="Last name"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="student@school.edu"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="Roll number"
            error={errors.rollNumber?.message}
            {...register("rollNumber")}
          />
          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <select
              id="grade"
              className={cn(
                "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                errors.grade && "border-destructive",
              )}
              {...register("grade")}
            >
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
            {errors.grade?.message ? (
              <Text variant="caption" className="text-destructive">
                {errors.grade.message}
              </Text>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <select
              id="section"
              className={cn(
                "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                errors.section && "border-destructive",
              )}
              {...register("section")}
            >
              {SECTION_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.section?.message ? (
              <Text variant="caption" className="text-destructive">
                {errors.section.message}
              </Text>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Guardian name (optional)"
            error={errors.guardianName?.message}
            {...register("guardianName")}
          />
          <FormField
            label="Guardian contact (optional)"
            placeholder="+91 ..."
            error={errors.guardianContact?.message}
            {...register("guardianContact")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("status")}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}

export { toStudentInput };
