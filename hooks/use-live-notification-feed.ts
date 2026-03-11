"use client";

import { useEffect, useMemo, useState } from "react";
import type { RealtimeNotificationPayload } from "@/lib/realtime/events";

interface UseLiveNotificationFeedOptions {
  endpoint: string;
  windowEventName: string;
  limit?: number;
}

function sortNotifications(
  notifications: RealtimeNotificationPayload[],
): RealtimeNotificationPayload[] {
  return [...notifications].sort((left, right) => {
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

function mergeNotifications(
  current: RealtimeNotificationPayload[],
  incoming: RealtimeNotificationPayload,
  limit: number,
) {
  const next = current.filter((notification) => notification.id !== incoming.id);
  next.unshift(incoming);
  return sortNotifications(next).slice(0, limit);
}

export function useLiveNotificationFeed({
  endpoint,
  windowEventName,
  limit = 8,
}: UseLiveNotificationFeedOptions) {
  const [notifications, setNotifications] = useState<RealtimeNotificationPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${endpoint}?limit=${limit}`, {
          cache: "no-store",
          credentials: "include",
        });
        const payload = (await response.json().catch(() => ({}))) as {
          notifications?: RealtimeNotificationPayload[];
        };

        if (!mounted || !response.ok) {
          return;
        }

        setNotifications(
          Array.isArray(payload.notifications)
            ? sortNotifications(payload.notifications).slice(0, limit)
            : [],
        );
      } catch (error) {
        console.error("[useLiveNotificationFeed] Failed to load notifications", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [endpoint, limit]);

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const payload = (event as CustomEvent<RealtimeNotificationPayload>).detail;
      if (!payload) {
        return;
      }

      setNotifications((current) => mergeNotifications(current, payload, limit));
    };

    window.addEventListener(windowEventName, handleNotification as EventListener);
    return () => {
      window.removeEventListener(windowEventName, handleNotification as EventListener);
    };
  }, [limit, windowEventName]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  return {
    notifications,
    unreadCount,
    isLoading,
  };
}
