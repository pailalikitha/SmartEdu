"use client";

import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, Text } from "@/components/ui";
import { listUploadHistory } from "@/services/upload-history.service";
import type { UploadHistoryLog } from "@/types/upload";
import { formatDate } from "@/lib/utils/format";

type UploadHistorySectionProps = {
  teacherId: string;
  refreshKey: number;
};

export function UploadHistorySection({
  teacherId,
  refreshKey,
}: UploadHistorySectionProps) {
  const [logs, setLogs] = useState<UploadHistoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!teacherId) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await listUploadHistory(teacherId);
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div
          className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Loading upload history"
        />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        title="No uploads yet"
        description="Your last 10 uploads will appear here."
      />
    );
  }

  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-foreground">{log.filename}</p>
              <Text variant="caption" className="text-muted-foreground">
                {log.uploadType === "marks" ? "Marks" : "Students"} ·{" "}
                {formatDate(log.uploadedAt, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </div>
            <Text variant="small" className="text-muted-foreground">
              {log.successCount} ok · {log.failureCount} failed ·{" "}
              {log.recordsUploaded} rows
            </Text>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
