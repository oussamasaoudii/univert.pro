"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { RealtimeNotificationPayload } from "@/lib/realtime/events";
import {
  ADMIN_NOTIFICATION_WINDOW_EVENT,
  REALTIME_NOTIFICATION_CREATED_EVENT,
  USER_NOTIFICATION_WINDOW_EVENT,
} from "@/lib/realtime/events";
import {
  getBrowserPusherClient,
  isPusherClientConfigured,
} from "@/lib/realtime/pusher-client";
import {
  getAdminNotificationChannel,
  getUserNotificationChannel,
} from "@/lib/realtime/channels";

interface RealtimeSessionBridgeProps {
  role: "user" | "admin";
  userId: string;
}

export function RealtimeSessionBridge({
  role,
  userId,
}: RealtimeSessionBridgeProps) {
  useEffect(() => {
    if (!userId || !isPusherClientConfigured()) {
      return;
    }

    const pusher = getBrowserPusherClient();
    if (!pusher) {
      return;
    }

    const channelName =
      role === "admin"
        ? getAdminNotificationChannel(userId)
        : getUserNotificationChannel(userId);
    const windowEventName =
      role === "admin"
        ? ADMIN_NOTIFICATION_WINDOW_EVENT
        : USER_NOTIFICATION_WINDOW_EVENT;

    const channel = pusher.subscribe(channelName);
    const handleNotification = (payload: RealtimeNotificationPayload) => {
      window.dispatchEvent(
        new CustomEvent<RealtimeNotificationPayload>(windowEventName, {
          detail: payload,
        }),
      );

      toast(payload.title, {
        description: payload.message,
      });
    };

    channel.bind(REALTIME_NOTIFICATION_CREATED_EVENT, handleNotification);

    return () => {
      channel.unbind(REALTIME_NOTIFICATION_CREATED_EVENT, handleNotification);
      pusher.unsubscribe(channelName);
    };
  }, [role, userId]);

  return null;
}
