import { logger } from "@/lib/utils/errors";
import { getAdminNotificationChannel, getUserNotificationChannel } from "./channels";
import { REALTIME_NOTIFICATION_CREATED_EVENT, type RealtimeNotificationPayload } from "./events";
import { getPusherServerClient } from "./pusher-server";

async function triggerNotification(channelName: string, payload: RealtimeNotificationPayload) {
  const pusher = getPusherServerClient();
  if (!pusher) {
    return;
  }

  try {
    await pusher.trigger(channelName, REALTIME_NOTIFICATION_CREATED_EVENT, payload);
  } catch (error) {
    logger.error("[realtime] Failed to publish notification", error, {
      channelName,
      notificationId: payload.id,
    });
  }
}

export async function publishUserNotificationCreated(
  userId: string,
  payload: RealtimeNotificationPayload,
) {
  await triggerNotification(getUserNotificationChannel(userId), payload);
}

export async function publishAdminNotificationCreated(
  adminUserId: string,
  payload: RealtimeNotificationPayload,
) {
  await triggerNotification(getAdminNotificationChannel(adminUserId), payload);
}
