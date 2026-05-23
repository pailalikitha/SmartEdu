"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import type { StudyTask, TaskStatus } from "@/types/study-planner";

function mapTaskDoc(id: string, data: Record<string, unknown>): StudyTask {
  return {
    id,
    studentId: String(data.studentId ?? ""),
    title: String(data.title ?? ""),
    subject: String(data.subject ?? ""),
    topic: String(data.topic ?? ""),
    scheduledDate: String(data.scheduledDate ?? ""),
    startTime: data.startTime ? String(data.startTime) : undefined,
    durationMinutes: Number(data.durationMinutes ?? 45),
    status: (data.status as TaskStatus) ?? "pending",
    priority:
      data.priority === "high" || data.priority === "low"
        ? data.priority
        : "medium",
    source: data.source === "manual" ? "manual" : "ai",
    notes: data.notes ? String(data.notes) : undefined,
  };
}

export function useStudentStudyTasksSnapshot(studentId: string | undefined) {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const db = requireFirestore();
      const q = query(
        collection(db, COLLECTIONS.studyTasks),
        where("studentId", "==", studentId),
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setTasks(
            snapshot.docs.map((d) =>
              mapTaskDoc(d.id, d.data() as Record<string, unknown>),
            ),
          );
          setIsLoading(false);
        },
        (err) => {
          setError(err.message || "Failed to load study tasks.");
          setTasks([]);
          setIsLoading(false);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load study tasks.",
      );
      setTasks([]);
      setIsLoading(false);
    }
  }, [studentId]);

  return { tasks, isLoading, error };
}
