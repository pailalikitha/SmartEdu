"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPercentageColorClass } from "@/features/student-analytics/utils/performance";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { StudentMarkEntry } from "@/types/student-marks";

type RecentMarksListProps = {
  entries: StudentMarkEntry[];
};

export function RecentMarksList({ entries }: RecentMarksListProps) {
  const recent = entries.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Recent marks</CardTitle>
        <Link href={ROUTES.student.marks}>
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No marks recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {recent.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-2 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">{entry.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.examType} · {formatDate(entry.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "font-semibold",
                      getPercentageColorClass(entry.percentage),
                    )}
                  >
                    {entry.percentage}%
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.grade}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
