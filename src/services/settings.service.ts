import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import {
  COLLECTIONS,
  SETTINGS_DOCS,
} from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import {
  DEFAULT_SCHOOL_SETTINGS,
  type SchoolSettings,
} from "@/types/settings";

export function schoolSettingsRef() {
  const db = requireFirestore();
  return doc(db, COLLECTIONS.settings, SETTINGS_DOCS.school);
}

export async function saveSchoolSettings(
  settings: SchoolSettings,
): Promise<void> {
  await setDoc(
    schoolSettingsRef(),
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function mapSchoolSettings(data: Record<string, unknown>): SchoolSettings {
  return {
    schoolName: String(data.schoolName ?? DEFAULT_SCHOOL_SETTINGS.schoolName),
    logoURL: data.logoURL ? String(data.logoURL) : null,
    attendanceThreshold:
      typeof data.attendanceThreshold === "number"
        ? data.attendanceThreshold
        : DEFAULT_SCHOOL_SETTINGS.attendanceThreshold,
    passingMarksThreshold:
      typeof data.passingMarksThreshold === "number"
        ? data.passingMarksThreshold
        : DEFAULT_SCHOOL_SETTINGS.passingMarksThreshold,
    academicYear: String(
      data.academicYear ?? DEFAULT_SCHOOL_SETTINGS.academicYear,
    ),
  };
}

export function subscribeSchoolSettings(
  onData: (settings: SchoolSettings) => void,
  onError: (message: string) => void,
): () => void {
  return onSnapshot(
    schoolSettingsRef(),
    (snap) => {
      if (!snap.exists()) {
        onData(DEFAULT_SCHOOL_SETTINGS);
        return;
      }
      onData(mapSchoolSettings(snap.data() as Record<string, unknown>));
    },
    (err) => onError(err.message),
  );
}
