"use client";

import { AlertTriangle, Bell, Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { sendTeacherAlertNotification } from "@/services/notifications.service";
import { doc, updateDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { getStudentFullName } from "@/types/student";
import type { Student } from "@/types/student";

type QuickActionsSectionProps = {
  student: Student;
  marksStudentId: string;
  teacherId: string;
  teacherName: string;
  reportRef: React.RefObject<HTMLDivElement | null>;
};

export function QuickActionsSection({
  student,
  marksStudentId,
  teacherId,
  teacherName,
  reportRef,
}: QuickActionsSectionProps) {
  const { toast } = useToast();
  const [notifying, setNotifying] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const notifyStudent = async () => {
    setNotifying(true);
    try {
      await sendTeacherAlertNotification(
        marksStudentId,
        `${teacherName} sent you a message. Please check your dashboard.`,
      );
      toast({ title: "Notification sent to student.", variant: "success" });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Failed to send notification.",
        variant: "error",
      });
    } finally {
      setNotifying(false);
    }
  };

  const flagAtRisk = async () => {
    setFlagging(true);
    try {
      const db = requireFirestore();
      await updateDoc(doc(db, COLLECTIONS.students, student.id), {
        atRisk: true,
        atRiskFlaggedBy: teacherId,
        atRiskFlaggedAt: new Date().toISOString(),
      });
      toast({
        title: `${getStudentFullName(student)} flagged as at-risk. Admins will be notified.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Failed to flag student.",
        variant: "error",
      });
    } finally {
      setFlagging(false);
    }
  };

  const downloadReport = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(reportRef.current, {
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const safeName = getStudentFullName(student).replace(/\s+/g, "_");
      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`Report_${safeName}_${date}.pdf`);
      toast({ title: "Report downloaded.", variant: "success" });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Failed to generate PDF.",
        variant: "error",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void notifyStudent()}
          isLoading={notifying}
        >
          <Bell className="size-4" aria-hidden />
          Send notification
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void downloadReport()}
          isLoading={downloading}
        >
          <Download className="size-4" aria-hidden />
          Download report
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={() => void flagAtRisk()}
          isLoading={flagging}
        >
          <AlertTriangle className="size-4" aria-hidden />
          Flag at-risk
        </Button>
      </CardContent>
    </Card>
  );
}
