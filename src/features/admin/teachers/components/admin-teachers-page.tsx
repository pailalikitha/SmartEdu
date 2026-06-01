"use client";

import { Plus, Search, Download } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

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
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { logSchoolActivity } from "@/services/school-activity.service";
import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getSecondaryFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { exportToCSV } from "@/lib/utils/export";

type TeacherRow = {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  classCount: number;
  status: string;
  phone?: string;
};

export function AdminTeachersPage() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [classes, setClasses] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
    phone: "",
  });

  useEffect(() => {
    const db = requireFirestore();
    const unsubs = [
      onSnapshot(collection(db, COLLECTIONS.teachers), (snap) => {
        setTeachers(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: String(data.name ?? ""),
              email: String(data.email ?? ""),
              subjects: Array.isArray(data.subjects)
                ? data.subjects.map(String)
                : data.subject
                  ? [String(data.subject)]
                  : [],
              classCount: 0,
              status: String(data.status ?? "active"),
              phone: data.phone ? String(data.phone) : undefined,
            };
          }),
        );
        setIsLoading(false);
      }),
      onSnapshot(collection(db, COLLECTIONS.classes), (snap) => {
        const counts: Record<string, number> = {};
        for (const d of snap.docs) {
          const tid = String(d.data().teacherId ?? "");
          counts[tid] = (counts[tid] ?? 0) + 1;
        }
        setClasses(counts);
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q)),
    );
  }, [teachers, search]);

  const rows = filtered.map((t) => ({
    ...t,
    classCount: classes[t.id] ?? 0,
  }));

  const handleAdd = async () => {
    setSaving(true);
    try {
      const secondaryAuth = getSecondaryFirebaseAuth();
      const db = getFirebaseDb();

      const teacherCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        form.email,
        form.password
      );
      const teacherUid = teacherCredential.user.uid;

      await updateProfile(teacherCredential.user, {
        displayName: form.name
      });

      await setDoc(doc(db, "users", teacherUid), {
        role: "teacher",
        name: form.name,
        email: form.email.toLowerCase().trim(),
        createdAt: serverTimestamp(),
        passwordChanged: false,
        status: "active"
      });

      await setDoc(doc(db, COLLECTIONS.teachers, teacherUid), {
        name: form.name,
        email: form.email.toLowerCase().trim(),
        subject: form.subject,
        phone: form.phone,
        uid: teacherUid,
        createdAt: serverTimestamp(),
        status: "active",
        subjects: [form.subject]
      });

      await secondaryAuth.signOut();

      await logSchoolActivity({
        title: "Teacher added",
        description: `${form.name} (${form.email})`,
        type: "admin",
      });
      toast({ title: "Teacher created" });
      setModalOpen(false);
      setForm({ name: "", email: "", password: "", subject: "", phone: "" });
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Failed to create teacher",
      });
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id: string) => {
    try {
      const db = requireFirestore();
      await updateDoc(doc(db, COLLECTIONS.teachers, id), { status: "inactive" });
      await updateDoc(doc(db, COLLECTIONS.users, id), { status: "inactive" });
      toast({ title: "Teacher deactivated" });
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Failed to deactivate",
      });
    }
  };

  const handleExport = async () => {
    const data = rows.map((t) => ({
      Name: t.name,
      Email: t.email,
      Subjects: t.subjects.join(", "),
      Classes: t.classCount,
      Status: t.status,
    }));
    await exportToCSV(data, "teachers-export.xlsx");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading teachers" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        description="Manage teacher accounts and assignments."
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            Add teacher
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or subject…"
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => void handleExport()} className="shrink-0">
            <Download className="size-4 mr-2" />
            Export
          </Button>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-muted/50">
            <tr>
              {["Name", "Email", "Subjects", "Classes", "Status", "Actions"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-3 py-2">{t.name}</td>
                <td className="px-3 py-2">{t.email}</td>
                <td className="px-3 py-2">{t.subjects.join(", ") || "—"}</td>
                <td className="px-3 py-2">{t.classCount}</td>
                <td className="px-3 py-2">{t.status}</td>
                <td className="px-3 py-2">
                  {t.status === "active" ? (
                    <Button size="sm" variant="outline" onClick={() => void deactivate(t.id)}>
                      Deactivate
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">Inactive</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <FormField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FormField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <FormField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <FormField label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <FormField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <DialogFooter>
            <Button isLoading={saving} onClick={() => void handleAdd()}>Create teacher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
