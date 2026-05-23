"use client";

import {
  AlertTriangle,
  Bell,
  BookOpen,
  Calendar,
  ClipboardList,
  Megaphone,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { useNotificationsSnapshot } from "@/hooks/use-notifications-snapshot";
import { useAuth } from "@/hooks/use-auth";
import { formatRelativeTime } from "@/lib/utils/format";
import {
  deleteReadNotifications,
  markNotificationRead,
  type AppNotification,
  type NotificationType,
} from "@/services/notifications.service";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "marks_uploaded", label: "Marks" },
  { id: "attendance_marked", label: "Attendance" },
  { id: "alerts", label: "Alerts" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  marks_uploaded: BookOpen,
  attendance_marked: Calendar,
  weak_topic_alert: AlertTriangle,
  assignment_posted: ClipboardList,
  teacher_alert: Megaphone,
  system: UserRound,
};

export function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterId>("all");
  const { notifications, isLoading, error } = useNotificationsSnapshot(user?.id);

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "alerts") {
      return notifications.filter(
        (n) =>
          n.type === "weak_topic_alert" ||
          n.type === "teacher_alert" ||
          n.type === "system",
      );
    }
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const handleOpen = async (item: AppNotification) => {
    if (!user?.id) return;
    try {
      if (!item.read) {
        await markNotificationRead(user.id, item.id);
      }
      if (item.link) router.push(item.link);
    } catch (err) {
      toast({
        variant: "error",
        title:
          err instanceof Error ? err.message : "Could not open notification.",
      });
    }
  };

  const handleClearRead = async () => {
    if (!user?.id) return;
    try {
      await deleteReadNotifications(user.id);
      toast({ title: "Cleared read notifications" });
    } catch (err) {
      toast({
        variant: "error",
        title:
          err instanceof Error ? err.message : "Could not clear notifications.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Notifications"
          description="Stay updated on marks, attendance, and alerts."
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleClearRead()}
        >
          <Trash2 className="size-4" aria-hidden />
          Clear all read
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              filter === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner label="Loading notifications" />
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <Bell className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No notifications</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((item) => {
            const Icon = TYPE_ICONS[item.type] ?? Bell;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => void handleOpen(item)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border border-border px-4 py-3 text-left transition-colors hover:bg-muted/50",
                    item.read ? "bg-muted/30" : "bg-card",
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-4 text-primary" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-sm text-foreground">{item.message}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {item.createdAt
                        ? formatRelativeTime(item.createdAt)
                        : "Just now"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
