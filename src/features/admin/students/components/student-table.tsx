"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge, Button } from "@/components/ui";
import type { Student } from "@/types/student";
import {
  getStudentClassLabel,
  getStudentFullName,
} from "@/types/student";

type StudentTableProps = {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
};

function StatusBadge({ status }: { status: Student["status"] }) {
  return (
    <Badge variant={status === "active" ? "success" : "secondary"}>
      {status === "active" ? "Active" : "Inactive"}
    </Badge>
  );
}

function StudentActions({
  student,
  onEdit,
  onDelete,
}: {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onEdit(student)}
        aria-label={`Edit ${getStudentFullName(student)}`}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:text-destructive"
        onClick={() => onDelete(student)}
        aria-label={`Delete ${getStudentFullName(student)}`}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function StudentCard({
  student,
  onEdit,
  onDelete,
}: {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {getStudentFullName(student)}
          </p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {student.email}
          </p>
        </div>
        <StatusBadge status={student.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Roll no.</dt>
          <dd className="font-medium">{student.rollNumber}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Class</dt>
          <dd className="font-medium">{getStudentClassLabel(student)}</dd>
        </div>
      </dl>

      {expanded && student.guardianName ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Guardian: {student.guardianName}
          {student.guardianContact ? ` · ${student.guardianContact}` : ""}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Less" : "More"} details
        </button>
        <StudentActions
          student={student}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}

export function StudentTable({
  students,
  onEdit,
  onDelete,
}: StudentTableProps) {
  return (
    <>
      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {students.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Student
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Roll no.
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Class
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Guardian
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {getStudentFullName(student)}
                      </p>
                      <p className="text-muted-foreground">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {student.rollNumber}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {getStudentClassLabel(student)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-[180px]">
                      <p className="truncate text-foreground">
                        {student.guardianName ?? "—"}
                      </p>
                      {student.guardianContact ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {student.guardianContact}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StudentActions
                      student={student}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
