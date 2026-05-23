"use client";

import {
  AlertTriangle,
  Bell,
  BookOpen,
  Calendar,
  ClipboardList,
  Megaphone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/constants/routes";
import { useNotificationsSnapshot } from "@/hooks/use-notifications-snapshot";
import { useAuth } from "@/hooks/use-auth";
import { formatRelativeTime } from "@/lib/utils/format";
import {
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
  type NotificationType,
} from "@/services/notifications.service";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  marks_uploaded: BookOpen,
  attendance_marked: Calendar,
  weak_topic_alert: AlertTriangle,
  assignment_posted: ClipboardList,
  teacher_alert: Megaphone,
  system: UserRound,
};

function NotificationRow({
  item,
  onSelect,
}: {
  item: AppNotification;
  onSelect: (item: AppNotification) => void;
}) {
  const Icon = TYPE_ICONS[item.type] ?? Bell;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={cn(
        "flex w-full gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
        !item.read && "bg-card",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4 text-primary" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-foreground">{item.message}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {item.createdAt ? formatRelativeTime(item.createdAt) : "Just now"}
        </span>
      </span>
      {!item.read ? (
        <span className="mt-2 size-2 shrink-0 rounded-full bg-destructive" />
      ) : null}
    </button>
  );
}

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, isLoading } = useNotificationsSnapshot(
    user?.id,
    10,
  );

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const handleSelect = async (item: AppNotification) => {
    if (!user?.id) return;

    try {
      if (!item.read) {
        await markNotificationRead(user.id, item.id);
      }
      setOpen(false);
      if (item.link) {
        router.push(item.link);
      }
    } catch (err) {
      toast({
        variant: "error",
        title:
          err instanceof Error ? err.message : "Could not open notification.",
      });
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await markAllNotificationsRead(user.id);
    } catch (err) {
      toast({
        variant: "error",
        title:
          err instanceof Error ? err.message : "Could not mark notifications read.",
      });
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-[1.125rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white ring-2 ring-card">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-sm font-semibold">Notifications</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => void handleMarkAllRead()}
            >
              Mark all read
            </Button>
          </div>

          <div className="max-h-80 overflow-y-auto p-1">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No notifications yet
              </p>
            ) : (
              notifications.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onSelect={(n) => void handleSelect(n)}
                />
              ))
            )}
          </div>

          <div className="border-t border-border p-2">
            <Link
              href={ROUTES.notifications}
              className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-primary hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
