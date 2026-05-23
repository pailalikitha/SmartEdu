"use client";

import {
  collection,
  collectionGroup,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import {
  COLLECTIONS,
  SCHOOL_ACTIVITY_LIMIT,
  STUDENT_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { calculateAttendancePercent } from "@/services/attendance.service";
import { mapStudentMarkEntry } from "@/services/marks.service";
import {
  mapSchoolActivity,
  type SchoolActivityEntry,
} from "@/services/school-activity.service";
import type { AttendanceRecord } from "@/types/attendance";

export type AdminStats = {
  teacherCount: number;
  studentCount: number;
  classCount: number;
  schoolAverage: number | null;
  attendancePercent: number | null;
  classMarks: { label: string; value: number }[];
  attendanceDistribution: { name: string; value: number }[];
  recentActivity: SchoolActivityEntry[];
};

const EMPTY: AdminStats = {
  teacherCount: 0,
  studentCount: 0,
  classCount: 0,
  schoolAverage: null,
  attendancePercent: null,
  classMarks: [],
  attendanceDistribution: [],
  recentActivity: [],
};

export function useAdminStatsSnapshot() {
  const [stats, setStats] = useState<AdminStats>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const db = requireFirestore();
    const unsubs: Array<() => void> = [];

    let teachers = 0;
    let students = 0;
    let classes = 0;
    let marksSum = 0;
    let marksCount = 0;
    const classMarksMap = new Map<string, { sum: number; count: number }>();
    const attendanceRecords: AttendanceRecord[] = [];
    let activity: SchoolActivityEntry[] = [];

    const publish = () => {
      const classMarks = Array.from(classMarksMap.entries()).map(
        ([label, { sum, count }]) => ({
          label,
          value: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
        }),
      );

      const present = attendanceRecords.filter((r) => r.status === "present").length;
      const absent = attendanceRecords.filter((r) => r.status === "absent").length;

      setStats({
        teacherCount: teachers,
        studentCount: students,
        classCount: classes,
        schoolAverage:
          marksCount > 0
            ? Math.round((marksSum / marksCount) * 10) / 10
            : null,
        attendancePercent: calculateAttendancePercent(attendanceRecords),
        classMarks,
        attendanceDistribution: [
          { name: "Present", value: present },
          { name: "Absent", value: absent },
        ],
        recentActivity: activity,
      });
      setIsLoading(false);
    };

    try {
      unsubs.push(
        onSnapshot(collection(db, COLLECTIONS.teachers), (snap) => {
          teachers = snap.docs.filter(
            (d) => (d.data().status as string | undefined) !== "inactive",
          ).length;
          publish();
        }),
      );

      unsubs.push(
        onSnapshot(collection(db, COLLECTIONS.students), (snap) => {
          students = snap.docs.filter(
            (d) => d.data().status !== "inactive",
          ).length;
          publish();
        }),
      );

      unsubs.push(
        onSnapshot(collection(db, COLLECTIONS.classes), (snap) => {
          classes = snap.size;
          for (const d of snap.docs) {
            const name = String(d.data().name ?? d.id);
            if (!classMarksMap.has(name)) {
              classMarksMap.set(name, { sum: 0, count: 0 });
            }
          }
          publish();
        }),
      );

      unsubs.push(
        onSnapshot(collection(db, COLLECTIONS.attendance), (snap) => {
          attendanceRecords.length = 0;
          for (const d of snap.docs) {
            const data = d.data();
            attendanceRecords.push({
              id: d.id,
              studentId: String(data.studentId ?? ""),
              studentName: String(data.studentName ?? ""),
              rollNumber: String(data.rollNumber ?? ""),
              grade: String(data.grade ?? ""),
              section: String(data.section ?? ""),
              date: String(data.date ?? ""),
              status: data.status === "present" ? "present" : "absent",
            });
          }
          publish();
        }),
      );

      unsubs.push(
        onSnapshot(collectionGroup(db, STUDENT_SUBCOLLECTIONS.markEntries), (snap) => {
          marksSum = 0;
          marksCount = 0;
          for (const d of snap.docs) {
            const entry = mapStudentMarkEntry(d.id, d.data());
            if (!entry) continue;
            marksSum += entry.percentage;
            marksCount += 1;
          }
          publish();
        }),
      );

      unsubs.push(
        onSnapshot(
          query(
            collection(db, COLLECTIONS.schoolActivity),
            orderBy("timestamp", "desc"),
            limit(SCHOOL_ACTIVITY_LIMIT),
          ),
          (snap) => {
            activity = snap.docs.map((d) =>
              mapSchoolActivity(d.id, d.data() as Record<string, unknown>),
            );
            publish();
          },
          () => publish(),
        ),
      );

      return () => {
        for (const unsub of unsubs) unsub();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin stats");
      setIsLoading(false);
    }
  }, []);

  return { stats, isLoading, error };
}
