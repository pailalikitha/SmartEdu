"use client";

import { Camera } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Button, FormField } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import {
  getStudentProfileDoc,
  saveStudentProfile,
  uploadProfileAvatar,
  type StudentProfileDoc,
} from "@/services/profile.service";
import { getStudentClassLabel } from "@/types/student";

export function StudentProfilePage() {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<StudentProfileDoc | null>(null);
  const [draft, setDraft] = useState<StudentProfileDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await getStudentProfileDoc(user.id);
      setProfile(data);
      setDraft(data);
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
  const fullName = display
    ? `${display.firstName} ${display.lastName}`.trim()
    : user?.displayName ?? "";

  const handleAvatar = async (file: File | undefined) => {
    if (!file || !user?.id || !draft) return;

    setUploadProgress(0);
    try {
      const url = await uploadProfileAvatar(user.id, file, setUploadProgress);
      const next = { ...draft, photoURL: url };
      setDraft(next);
      await saveStudentProfile(user.id, { photoURL: url });
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
      await saveStudentProfile(user.id, {
        firstName: draft.firstName,
        lastName: draft.lastName,
        phone: draft.phone,
        dateOfBirth: draft.dateOfBirth,
        parentName: draft.parentName,
        parentEmail: draft.parentEmail,
        parentPhone: draft.parentPhone,
        photoURL: draft.photoURL,
      });
      setProfile(draft);
      setIsEditing(false);
      setUser({
        ...user,
        displayName: `${draft.firstName} ${draft.lastName}`.trim(),
        photoURL: draft.photoURL ?? null,
      });
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
        <p className="mt-1 text-sm text-muted-foreground">
          Your student profile has not been set up yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account and parent contact details." />

      <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            className="group relative size-28 overflow-hidden rounded-full border-2 border-border bg-muted"
            onClick={() => fileRef.current?.click()}
            aria-label="Change profile photo"
          >
            {display.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={display.photoURL}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-2xl font-semibold text-primary">
                {fullName.charAt(0).toUpperCase()}
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
            <div className="w-28 space-y-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                {uploadProgress}%
              </p>
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
                <Button
                  type="button"
                  isLoading={isSaving}
                  onClick={() => void handleSave()}
                >
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

          <section className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="First name"
              value={display.firstName}
              readOnly={!isEditing}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, firstName: e.target.value } : d))
              }
            />
            <FormField
              label="Last name"
              value={display.lastName}
              readOnly={!isEditing}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, lastName: e.target.value } : d))
              }
            />
            <FormField
              label="Date of birth"
              type="date"
              value={display.dateOfBirth ?? ""}
              readOnly={!isEditing}
              onChange={(e) =>
                setDraft((d) =>
                  d ? { ...d, dateOfBirth: e.target.value } : d,
                )
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
              label="Class"
              value={getStudentClassLabel(display)}
              readOnly
            />
            <FormField label="Roll number" value={display.rollNumber} readOnly />
            <FormField label="Email" value={display.email || user?.email || ""} readOnly />
            <FormField
              label="Member since"
              value={
                display.createdAt
                  ? display.createdAt.toLocaleDateString()
                  : "—"
              }
              readOnly
            />
          </section>

          <section className="space-y-4 rounded-xl border border-border p-4">
            <h2 className="font-heading text-base font-semibold">Parent info</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Parent name"
                value={display.parentName ?? ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, parentName: e.target.value } : d,
                  )
                }
              />
              <FormField
                label="Parent email"
                type="email"
                value={display.parentEmail ?? ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, parentEmail: e.target.value } : d,
                  )
                }
              />
              <FormField
                label="Parent phone"
                value={display.parentPhone ?? ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, parentPhone: e.target.value } : d,
                  )
                }
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
