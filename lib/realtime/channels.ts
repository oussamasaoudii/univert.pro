export function getUserNotificationChannel(userId: string) {
  return `private-user-${userId}`;
}

export function getAdminNotificationChannel(adminUserId: string) {
  return `private-admin-${adminUserId}`;
}

export function parseUserNotificationChannel(channelName: string): string | null {
  const match = /^private-user-([0-9a-f-]{36})$/i.exec(channelName.trim());
  return match?.[1] || null;
}

export function parseAdminNotificationChannel(channelName: string): string | null {
  const match = /^private-admin-([0-9a-f-]{36})$/i.exec(channelName.trim());
  return match?.[1] || null;
}
