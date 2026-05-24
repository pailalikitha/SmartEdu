"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { getLinkedStudentIds } from "@/lib/user/linked-students";
import { useParentStore } from "@/store/parent-store";
import type { UserProfile } from "@/services/user.service";
import type { Student } from "@/types/student";

function mapStudent(id: string, data: Record<string, unknown>): Student {
  const name = String(data.name ?? "").trim();
  let firstName = String(data.firstName ?? "");
  let lastName = String(data.lastName ?? "");
  if (!firstName && name) {
    const parts = name.split(/\s+/);
    firstName = parts[0] ?? "";
    lastName = parts.slice(1).join(" ");
  }

  return {
    id,
    firstName,
    lastName,
    email: String(data.email ?? ""),
    rollNumber: String(data.rollNumber ?? data.rollNo ?? ""),
    grade: String(data.grade ?? ""),
    section: String(data.section ?? ""),
    classId: data.classId ? String(data.classId) : undefined,
    authUserId: data.authUserId
      ? String(data.authUserId)
      : data.uid
        ? String(data.uid)
        : id,
    parentEmail: data.parentEmail ? String(data.parentEmail) : undefined,
    parentUid: data.parentUid ? String(data.parentUid) : undefined,
    uid: data.uid ? String(data.uid) : id,
    status: data.status === "inactive" ? "inactive" : "active",
  };
}

export function useParentChildrenSnapshot(
  parentUid: string | undefined,
  profile: UserProfile | null | undefined,
) {
  const setChildren = useParentStore((s) => s.setChildren);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const linkedIds = useMemo(
    () => getLinkedStudentIds(profile ?? null),
    [profile],
  );

  useEffect(() => {
    if (!parentUid) {
      setChildren([]);
      setIsLoading(false);
      return;
    }

    if (linkedIds.length === 0) {
      setChildren([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const db = requireFirestore();
    const studentsById = new Map<string, Student>();
    let pending = linkedIds.length;

    const publish = () => {
      const children = linkedIds
        .map((id) => studentsById.get(id))
        .filter((s): s is Student => Boolean(s && s.status === "active"));
      setChildren(children);
      setIsLoading(false);
    };

    const unsubscribers = linkedIds.map((studentId) =>
      onSnapshot(
        doc(db, COLLECTIONS.students, studentId),
        (docSnap) => {
          pending = Math.max(0, pending - 1);
          if (docSnap.exists()) {
            studentsById.set(
              studentId,
              mapStudent(studentId, docSnap.data() as Record<string, unknown>),
            );
          } else {
            studentsById.delete(studentId);
          }
          if (pending === 0 || studentsById.size > 0) {
            publish();
          }
        },
        (err) => {
          console.error(err);
          setError(err.message);
          setChildren([]);
          setIsLoading(false);
        },
      ),
    );

    return () => {
      for (const unsub of unsubscribers) unsub();
    };
  }, [parentUid, linkedIds, setChildren]);

  return { isLoading, error, linkedIds };
}
