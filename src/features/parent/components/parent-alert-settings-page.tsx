"use client";

import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import {
  COLLECTIONS,
  PARENT_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { useAuth } from "@/hooks/use-auth";
import {
  DEFAULT_PARENT_ALERT_SETTINGS,
  type ParentAlertSettings,
} from "@/types/parent";

const PREFS_DOC = "default";

export function ParentAlertSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ParentAlertSettings>(
    DEFAULT_PARENT_ALERT_SETTINGS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const db = requireFirestore();
    const ref = doc(
      db,
      COLLECTIONS.parents,
      user.id,
      PARENT_SUBCOLLECTIONS.alertSettings,
      PREFS_DOC,
    );

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setSettings({
            attendanceAlerts: Boolean(data.attendanceAlerts ?? true),
            marksUploadedAlerts: Boolean(data.marksUploadedAlerts ?? true),
            weeklySummaryEmails: Boolean(data.weeklySummaryEmails ?? false),
          });
        }
        setIsLoading(false);
      },
      (err) => {
        toast({ variant: "error", title: err.message });
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.id, toast]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const db = requireFirestore();
      await setDoc(
        doc(
          db,
          COLLECTIONS.parents,
          user.id,
          PARENT_SUBCOLLECTIONS.alertSettings,
          PREFS_DOC,
        ),
        settings,
        { merge: true },
      );
      toast({ title: "Alert preferences saved" });
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading settings" />
      </div>
    );
  }

  const toggles: { key: keyof ParentAlertSettings; label: string }[] = [
    { key: "attendanceAlerts", label: "Attendance alerts" },
    { key: "marksUploadedAlerts", label: "Marks uploaded alerts" },
    { key: "weeklySummaryEmails", label: "Weekly summary emails" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Alert settings" description="Choose which updates you receive." />
      <Card>
        <CardContent className="space-y-4 py-6">
          {toggles.map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{label}</span>
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={settings[key]}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, [key]: e.target.checked }))
                }
              />
            </label>
          ))}
          <Button isLoading={saving} onClick={() => void handleSave()}>
            Save preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
