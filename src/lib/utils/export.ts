import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { formatPercentage } from "./format";
import { toDateString } from "./date";
import { CLASS_ATTENDANCE_SHORT } from "@/types/class-attendance";
import type { StudentAnalyticsResult } from "@/hooks/use-student-analytics";
import { getStudentFullName, type Student } from "@/types/student";

export async function exportToCSV(data: any[], filename: string) {
  const sheet = XLSX.utils.json_to_sheet(data);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Data");
  XLSX.writeFile(book, filename);
}

export async function exportAttendanceToExcel(
  students: Student[],
  dates: string[],
  grid: Record<string, Record<string, string | undefined>>,
  className: string,
  filename: string
) {
  const rows = students.map((student) => {
    const row: any = {
      "Student Name": getStudentFullName(student),
      "Roll Number": student.rollNumber || "—",
    };
    let present = 0;
    let total = 0;

    for (const d of dates) {
      const status = grid[student.id]?.[d];
      row[d] = status ? CLASS_ATTENDANCE_SHORT[status as keyof typeof CLASS_ATTENDANCE_SHORT] : "—";
      if (status) total++;
      if (status === "present" || status === "late") present++;
    }
    
    row["Attendance %"] = total > 0 ? formatPercentage((present / total) * 100) : "N/A";
    return row;
  });

  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Attendance");
  XLSX.writeFile(book, filename);
}

export async function exportElementToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Element not found");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canvas = await html2canvas(element, { scale: 2 } as any);
  const imgData = canvas.toDataURL("image/png");
  
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
  // Create pages if height > a4 height
  const pageHeight = pdf.internal.pageSize.getHeight();
  let heightLeft = pdfHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
  }
  
  pdf.save(filename);
}

export function generateStudentReportCardPDF(
  studentName: string,
  className: string,
  analytics: StudentAnalyticsResult,
  filename: string
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(33, 37, 41);
  doc.text("SmartEdu Report Card", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(73, 80, 87);
  doc.text(`Student: ${studentName}`, 14, 35);
  if (className) doc.text(`Class: ${className}`, 14, 45);
  doc.text(`Date: ${toDateString(new Date())}`, 14, className ? 55 : 45);
  
  // Marks Table
  const tableData = analytics.subjectAverages.map((s) => {
    let grade = "F";
    if (s.average >= 85) grade = "A";
    else if (s.average >= 70) grade = "B";
    else if (s.average >= 55) grade = "C";
    else if (s.average >= 40) grade = "D";
    
    return [s.subject, formatPercentage(s.average), grade];
  });
  
  autoTable(doc, {
    startY: className ? 65 : 55,
    head: [["Subject", "Average Mark", "Grade"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Summary
  doc.setFontSize(12);
  doc.setTextColor(33, 37, 41);
  doc.text(`Overall Average: ${analytics.overallAverage !== null ? formatPercentage(analytics.overallAverage) : "N/A"}`, 14, finalY);
  doc.text(`Attendance Rate: ${analytics.attendanceRate !== null ? formatPercentage(analytics.attendanceRate) : "N/A"}`, 14, finalY + 10);
  
  if (analytics.weakSubjects.length > 0) {
    const weakList = analytics.weakSubjects.map((s) => s.subject).join(", ");
    doc.text(`Areas for Improvement: ${weakList}`, 14, finalY + 20);
  }
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 280, { align: "center" });
  
  doc.save(filename);
}
