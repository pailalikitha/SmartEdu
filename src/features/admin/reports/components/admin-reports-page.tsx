"use client";

import { Download } from "lucide-react";
import { useMemo, useRef } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ChartSurface } from "@/components/ui/chart-surface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { useAdminStatsSnapshot } from "@/hooks/use-admin-stats-snapshot";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { COLLECTIONS, STUDENT_SUBCOLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { mapStudentMarkEntry } from "@/services/marks.service";
import { collectionGroup } from "firebase/firestore";

export function AdminReportsPage() {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const { stats, isLoading } = useAdminStatsSnapshot();
  const [studentAvgs, setStudentAvgs] = useState<
    { id: string; name: string; avg: number }[]
  >([]);

  useEffect(() => {
    const db = requireFirestore();
    const marksByStudent = new Map<string, number[]>();
    const names = new Map<string, string>();

    const unsubStudents = onSnapshot(collection(db, COLLECTIONS.students), (snap) => {
      for (const d of snap.docs) {
        const data = d.data();
        const id = String(data.authUserId ?? d.id);
        names.set(
          id,
          `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() || id,
        );
      }
    });

    const unsubMarks = onSnapshot(
      collectionGroup(db, STUDENT_SUBCOLLECTIONS.markEntries),
      (snap) => {
        for (const d of snap.docs) {
          const entry = mapStudentMarkEntry(d.id, d.data());
          if (!entry) continue;
          const studentId = d.ref.parent.parent?.id ?? "";
          if (!studentId) continue;
          const list = marksByStudent.get(studentId) ?? [];
          list.push(entry.percentage);
          marksByStudent.set(studentId, list);
        }
        const avgs = Array.from(marksByStudent.entries()).map(([id, scores]) => ({
          id,
          name: names.get(id) ?? id,
          avg: scores.reduce((a, b) => a + b, 0) / scores.length,
        }));
        setStudentAvgs(avgs.sort((a, b) => b.avg - a.avg));
      },
    );

    return () => {
      unsubStudents();
      unsubMarks();
    };
  }, []);

  const top10 = useMemo(() => studentAvgs.slice(0, 10), [studentAvgs]);
  const bottom10 = useMemo(
    () => [...studentAvgs].sort((a, b) => a.avg - b.avg).slice(0, 10),
    [studentAvgs],
  );

  const attendanceTrend = useMemo(() => {
    const months = new Map<string, { present: number; total: number }>();
    return Array.from(months.entries()).map(([month, v]) => ({
      month,
      percent: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
    }));
  }, []);

  const exportPdf = async () => {
    if (!reportRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(reportRef.current);
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, "PNG", 0, 0, w, h);
      pdf.save("smartedu-reports.pdf");
      toast({ title: "PDF exported" });
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Export failed",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading reports" />
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={reportRef}>
      <PageHeader
        title="Reports"
        description="Analytics and exportable school reports."
        action={
          <Button onClick={() => void exportPdf()}>
            <Download className="size-4" />
            Export PDF
          </Button>
        }
      />

      <Card>
        <CardHeader><CardTitle className="text-base">Subject averages by class</CardTitle></CardHeader>
        <CardContent>
          <ChartSurface>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.classMarks}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#1a56a8" />
            </BarChart>
          </ResponsiveContainer>
          </ChartSurface>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Top 10 students</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {top10.map((s, i) => (
                <li key={s.id}>{i + 1}. {s.name} — {s.avg.toFixed(1)}%</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">At-risk (bottom 10)</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {bottom10.map((s, i) => (
                <li key={s.id}>{i + 1}. {s.name} — {s.avg.toFixed(1)}%</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {attendanceTrend.length > 0 ? (
        <Card>
          <CardHeader><CardTitle className="text-base">Attendance trend</CardTitle></CardHeader>
          <CardContent>
            <ChartSurface>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="percent" stroke="#16a34a" />
              </LineChart>
            </ResponsiveContainer>
            </ChartSurface>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
