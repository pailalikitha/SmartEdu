"use client";

import { Camera, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, FormField } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import {
  getTeacherAssignedClasses,
  uploadProfileAvatar,
} from "@/services/profile.service";
import {
  getTeacherProfile,
  saveTeacherProfile,
  type TeacherProfile,
} from "@/services/teachers.service";
import type { ClassRoom } from "@/types/class";
import { cn } from "@/lib/utils";

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Science",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Computer Science",
];

export function TeacherProfilePage() {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [draft, setDraft] = useState<TeacherProfile | null>(null);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [subjectInput, setSubjectInput] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [teacher, assigned] = await Promise.all([
        getTeacherProfile(user.id),
        getTeacherAssignedClasses(user.id),
      ]);
      setProfile(teacher);
      setDraft(teacher);
      setClasses(assigned);
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Failed to load profile.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const display = isEditing ? draft : profile;
  const subjects = display?.subjects ?? [];

  const toggleSubject = (subject: string) => {
    if (!draft) return;
    const next = subjects.includes(subject)
      ? subjects.filter((s) => s !== subject)
      : [...subjects, subject];
    setDraft({ ...draft, subjects: next });
  };

  const addCustomSubject = () => {
    const value = subjectInput.trim();
    if (!value || !draft || subjects.includes(value)) return;
    setDraft({ ...draft, subjects: [...subjects, value] });
    setSubjectInput("");
  };

  const handleAvatar = async (file: File | undefined) => {
    if (!file || !user?.id || !draft) return;
    setUploadProgress(0);
    try {
      const url = await uploadProfileAvatar(user.id, file, setUploadProgress);
      const next = { ...draft, photoURL: url };
      setDraft(next);
      await saveTeacherProfile(user.id, user.email, {
        name: next.name,
        phone: next.phone,
        subjects: next.subjects,
        dateOfJoining: next.dateOfJoining,
        photoURL: url,
      });
      setProfile(next);
      setUser({ ...user, photoURL: url });
      toast({ title: "Profile photo updated" });
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Upload failed.",
      });
    } finally {
      setUploadProgress(null);
    }
  };

  const handleSave = async () => {
    if (!user?.id || !draft) return;
    setIsSaving(true);
    try {
      await saveTeacherProfile(user.id, user.email, {
        name: draft.name,
        phone: draft.phone,
        subjects: draft.subjects,
        dateOfJoining: draft.dateOfJoining,
        photoURL: draft.photoURL,
      });
      setProfile(draft);
      setIsEditing(false);
      setUser({ ...user, displayName: draft.name, photoURL: draft.photoURL ?? null });
      toast({ title: "Profile saved successfully" });
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Could not save profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading profile" />
      </div>
    );
  }

  if (!display) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-medium">Complete onboarding first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your teacher account and assigned classes." />

      <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            className="group relative size-28 overflow-hidden rounded-full border-2 border-border bg-muted"
            onClick={() => fileRef.current?.click()}
          >
            {display.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={display.photoURL} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-2xl font-semibold text-primary">
                {display.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-6 text-white" />
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => void handleAvatar(e.target.files?.[0])}
          />
          {uploadProgress !== null ? (
            <div className="w-28">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {!isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button type="button" isLoading={isSaving} onClick={() => void handleSave()}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDraft(profile);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Name"
              value={display.name}
              readOnly={!isEditing}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, name: e.target.value } : d))
              }
            />
            <FormField
              label="Phone"
              value={display.phone ?? ""}
              readOnly={!isEditing}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, phone: e.target.value } : d))
              }
            />
            <FormField
              label="Date of joining"
              type="date"
              value={display.dateOfJoining ?? ""}
              readOnly={!isEditing}
              onChange={(e) =>
                setDraft((d) =>
                  d ? { ...d, dateOfJoining: e.target.value } : d,
                )
              }
            />
            <FormField label="Email" value={display.email || user?.email || ""} readOnly />
            <FormField
              label="Employee ID"
              value={display.employeeId ?? "—"}
              readOnly
            />
          </div>

          <section className="space-y-3">
            <h2 className="font-heading text-base font-semibold">Subjects taught</h2>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <Badge
                  key={subject}
                  variant="secondary"
                  className={cn(isEditing && "pr-1")}
                >
                  {subject}
                  {isEditing ? (
                    <button
                      type="button"
                      className="ml-1 rounded p-0.5 hover:bg-muted"
                      onClick={() => toggleSubject(subject)}
                      aria-label={`Remove ${subject}`}
                    >
                      <X className="size-3" />
                    </button>
                  ) : null}
                </Badge>
              ))}
            </div>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {SUBJECT_OPTIONS.filter((s) => !subjects.includes(s)).map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
                    onClick={() => toggleSubject(subject)}
                  >
                    + {subject}
                  </button>
                ))}
                <div className="flex gap-2">
                  <FormField
                    label="Add subject"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    className="min-w-[10rem]"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addCustomSubject}>
                    Add
                  </Button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-base font-semibold">Classes assigned</h2>
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes yet.</p>
            ) : (
              <ul className="space-y-2">
                {classes.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    {c.name}
                    {c.section ? ` · Section ${c.section}` : ""}
                    {c.classCode ? (
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {c.classCode}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
