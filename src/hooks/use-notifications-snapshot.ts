"use client";

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import {
  COLLECTIONS,
  NOTIFICATION_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore/constants";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import type { AppNotification } from "@/services/notifications.service";

function mapNotification(
  id: string,
  data: Record<string, unknown>,
): AppNotification {
  const createdAt = data.createdAt;
  return {
    id,
    message: String(data.message ?? ""),
    type: (data.type as AppNotification["type"]) ?? "system",
    read: Boolean(data.read),
    link: data.link ? String(data.link) : undefined,
    createdAt:
      createdAt && typeof createdAt === "object" && "toDate" in createdAt
        ? (createdAt as { toDate: () => Date }).toDate()
        : null,
  };
}

export function useNotificationsSnapshot(
  userId: string | undefined,
  maxItems = 50,
) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const db = requireFirestore();
      const q = query(
        collection(
          db,
          COLLECTIONS.notifications,
          userId,
          NOTIFICATION_SUBCOLLECTIONS.items,
        ),
        orderBy("createdAt", "desc"),
        limit(maxItems),
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setNotifications(
            snapshot.docs.map((d) =>
              mapNotification(d.id, d.data() as Record<string, unknown>),
            ),
          );
          setIsLoading(false);
        },
        (err) => {
          console.error(err);
          setError(err.message || "Failed to load notifications.");
          setNotifications([]);
          setIsLoading(false);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to load notifications.",
      );
      setNotifications([]);
      setIsLoading(false);
    }
  }, [userId, maxItems]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  return { notifications, unreadCount, isLoading, error };
}
