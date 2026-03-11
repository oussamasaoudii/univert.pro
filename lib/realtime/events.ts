export const REALTIME_NOTIFICATION_CREATED_EVENT = "notification.created";

export const USER_NOTIFICATION_WINDOW_EVENT = "ovmon:user-notification";
export const ADMIN_NOTIFICATION_WINDOW_EVENT = "ovmon:admin-notification";

export type RealtimeNotificationPayload = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  category?: string | null;
};
