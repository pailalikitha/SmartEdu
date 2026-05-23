"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createStudent,
  deleteStudent,
  listStudents,
  updateStudent,
} from "@/services/student.service";
import type { Student, StudentInput } from "@/types/student";
import {
  getStudentClassLabel,
  getStudentFullName,
} from "@/types/student";

function matchesSearch(student: Student, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    getStudentFullName(student),
    student.email,
    student.rollNumber,
    getStudentClassLabel(student),
    student.guardianName ?? "",
    student.guardianContact ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listStudents();
      setStudents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load students.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const filteredStudents = useMemo(
    () => students.filter((s) => matchesSearch(s, searchQuery)),
    [students, searchQuery],
  );

  const addStudent = useCallback(async (input: StudentInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createStudent(input);
      setStudents((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add student.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const editStudent = useCallback(async (id: string, input: StudentInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateStudent(id, input);
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, ...input, updatedAt: new Date() }
            : s,
        ),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update student.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const removeStudent = useCallback(async (id: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete student.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    students: filteredStudents,
    totalCount: students.length,
    searchQuery,
    setSearchQuery,
    isLoading,
    isSubmitting,
    error,
    setError,
    refresh: loadStudents,
    addStudent,
    editStudent,
    removeStudent,
  };
}
