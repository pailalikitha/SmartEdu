"use client";

import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import {
  COLLECTIONS,
  PARENT_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import {
  DEFAULT_PARENT_ALERT_SETTINGS,
  type ParentAlertSettings,
} from "@/types/parent";

const PREFS_DOC = "default";

type ParentAlertSettingsInlineProps = {
  parentUid: string | undefined;
};

export function ParentAlertSettingsInline({
  parentUid,
}: ParentAlertSettingsInlineProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ParentAlertSettings>(
    DEFAULT_PARENT_ALERT_SETTINGS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const skipSave = useRef(true);

  useEffect(() => {
    if (!parentUid) return;
    const db = requireFirestore();
    const ref = doc(
      db,
      COLLECTIONS.parents,
      parentUid,
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
        window.setTimeout(() => {
          skipSave.current = false;
        }, 0);
      },
      (err) => {
        toast({ variant: "error", title: err.message });
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [parentUid, toast]);

  const persist = useCallback(
    async (next: ParentAlertSettings) => {
      if (!parentUid) return;
      const db = requireFirestore();
      await setDoc(
        doc(
          db,
          COLLECTIONS.parents,
          parentUid,
          PARENT_SUBCOLLECTIONS.alertSettings,
          PREFS_DOC,
        ),
        next,
        { merge: true },
      );
      toast({ title: "Alert preferences saved", variant: "success" });
    },
    [parentUid, toast],
  );

  const updateSetting = (key: keyof ParentAlertSettings, value: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (!skipSave.current) {
        void persist(next).catch((err) => {
          toast({
            variant: "error",
            title: err instanceof Error ? err.message : "Save failed",
          });
        });
      }
      return next;
    });
  };

  const toggles: { key: keyof ParentAlertSettings; label: string }[] = [
    { key: "marksUploadedAlerts", label: "Notify when marks are uploaded" },
    { key: "attendanceAlerts", label: "Alert when attendance falls below 75%" },
    { key: "weeklySummaryEmails", label: "Weekly summary email" },
  ];

  if (isLoading) {
    return <LoadingSpinner label="Loading alert settings" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Alert preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {toggles.map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span>{label}</span>
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={settings[key]}
              onChange={(e) => updateSetting(key, e.target.checked)}
            />
          </label>
        ))}
      </CardContent>
    </Card>
  );
}
