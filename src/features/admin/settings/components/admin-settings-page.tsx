"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { getFirebaseStorage } from "@/lib/firebase/client";
import {
  saveSchoolSettings,
  subscribeSchoolSettings,
} from "@/services/settings.service";
import {
  DEFAULT_SCHOOL_SETTINGS,
  type SchoolSettings,
} from "@/types/settings";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SchoolSettings>(DEFAULT_SCHOOL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeSchoolSettings(
      (data) => {
        setSettings(data);
        setIsLoading(false);
      },
      (msg) => {
        toast({ variant: "error", title: msg });
        setIsLoading(false);
      },
    );
    return unsubscribe;
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSchoolSettings(settings);
      toast({ title: "Settings saved" });
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogo = async (file: File | undefined) => {
    if (!file) return;
    setUploadProgress(0);
    try {
      const storage = getFirebaseStorage();
      const objectRef = ref(storage, "school/logo.png");
      const task = uploadBytesResumable(objectRef, file);
      await new Promise<void>((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) =>
            setUploadProgress(
              Math.round((snap.bytesTransferred / snap.totalBytes) * 100),
            ),
          reject,
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            setSettings((s) => ({ ...s, logoURL: url }));
            resolve();
          },
        );
      });
      toast({ title: "Logo uploaded" });
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setUploadProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading settings" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="School-wide configuration." />

      <Card>
        <CardContent className="max-w-lg space-y-4 py-6">
          <FormField
            label="School name"
            value={settings.schoolName}
            onChange={(e) =>
              setSettings((s) => ({ ...s, schoolName: e.target.value }))
            }
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">School logo</label>
            {settings.logoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoURL} alt="" className="h-16 w-auto" />
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => void handleLogo(e.target.files?.[0])}
            />
            {uploadProgress !== null ? (
              <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
            ) : null}
          </div>
          <FormField
            label="Attendance threshold (%)"
            type="number"
            value={String(settings.attendanceThreshold)}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                attendanceThreshold: Number(e.target.value),
              }))
            }
          />
          <FormField
            label="Passing marks threshold (%)"
            type="number"
            value={String(settings.passingMarksThreshold)}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                passingMarksThreshold: Number(e.target.value),
              }))
            }
          />
          <FormField
            label="Academic year"
            value={settings.academicYear}
            onChange={(e) =>
              setSettings((s) => ({ ...s, academicYear: e.target.value }))
            }
          />
          <Button isLoading={saving} onClick={() => void handleSave()}>
            Save settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
