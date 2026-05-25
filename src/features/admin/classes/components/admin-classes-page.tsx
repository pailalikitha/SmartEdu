"use client";

import { Plus, Download } from "lucide-react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { createClass, mapClassDoc } from "@/services/classes.service";
import { listStudentsByClassIds } from "@/services/student.service";
import type { ClassRoom } from "@/types/class";
import { getStudentFullName } from "@/types/student";
import { exportToCSV } from "@/lib/utils/export";

export function AdminClassesPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewClass, setViewClass] = useState<ClassRoom | null>(null);
  const [classStudents, setClassStudents] = useState<
    Awaited<ReturnType<typeof listStudentsByClassIds>>
  >([]);
  const [form, setForm] = useState({
    name: "",
    section: "",
    subject: "",
    teacherId: "",
    academicYear: new Date().getFullYear().toString(),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const db = requireFirestore();
    const unsubs = [
      onSnapshot(collection(db, COLLECTIONS.classes), (snap) => {
        setClasses(snap.docs.map((d) => mapClassDoc(d.id, d.data())));
        setIsLoading(false);
      }),
      onSnapshot(collection(db, COLLECTIONS.teachers), (snap) => {
        setTeachers(
          snap.docs.map((d) => ({
            id: d.id,
            name: String(d.data().name ?? d.id),
          })),
        );
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    if (classes.length === 0) return;
    void listStudentsByClassIds(classes.map((c) => c.id)).then((students) => {
      const counts: Record<string, number> = {};
      for (const s of students) {
        if (s.classId) counts[s.classId] = (counts[s.classId] ?? 0) + 1;
      }
      setStudentCounts(counts);
    });
  }, [classes]);

  const teacherName = (id: string) =>
    teachers.find((t) => t.id === id)?.name ?? "Unassigned";

  const handleCreate = async () => {
    if (!form.name || !form.teacherId) {
      toast({ variant: "error", title: "Name and teacher are required." });
      return;
    }
    setSaving(true);
    try {
      await createClass({
        name: form.name,
        section: form.section,
        subject: form.subject,
        academicYear: form.academicYear,
        teacherId: form.teacherId,
      });
      toast({ title: "Class created" });
      setCreateOpen(false);
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Failed to create class",
      });
    } finally {
      setSaving(false);
    }
  };

  const assignTeacher = async (classId: string, teacherId: string) => {
    try {
      const db = requireFirestore();
      await updateDoc(doc(db, COLLECTIONS.classes, classId), { teacherId });
      toast({ title: "Teacher updated" });
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Update failed",
      });
    }
  };

  const openStudents = async (c: ClassRoom) => {
    setViewClass(c);
    const students = await listStudentsByClassIds([c.id]);
    setClassStudents(students);
  };

  const handleExport = async () => {
    const data = classes.map((c) => ({
      Name: c.name,
      Section: c.section || "—",
      Subject: c.subject || "—",
      Teacher: teacherName(c.teacherId),
      Students: studentCounts[c.id] || 0,
      AcademicYear: c.academicYear,
    }));
    await exportToCSV(data, "classes-export.xlsx");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading classes" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Create classes and assign teachers."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void handleExport()}>
              <Download className="size-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4 mr-2" />
              Create class
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <Card key={c.id}>
            <CardContent className="space-y-3 py-4">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Section {c.section ?? "—"} · {teacherName(c.teacherId)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {studentCounts[c.id] ?? 0} students
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Assign teacher</Label>
                <select
                  className="h-9 w-full rounded-lg border border-border bg-card px-2 text-sm"
                  value={c.teacherId}
                  onChange={(e) => void assignTeacher(c.id, e.target.value)}
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <Button size="sm" variant="outline" onClick={() => void openStudents(c)}>
                View students
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create class</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <FormField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FormField label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
            <FormField label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <div className="space-y-2">
              <Label>Teacher</Label>
              <select className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm" value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
                <option value="">Select</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button isLoading={saving} onClick={() => void handleCreate()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewClass)} onOpenChange={() => setViewClass(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Students — {viewClass?.name}</DialogTitle>
          </DialogHeader>
          {classStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students in this class.</p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto text-sm">
              {classStudents.map((s) => (
                <li key={s.id}>{getStudentFullName(s)} · Roll {s.rollNumber}</li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
