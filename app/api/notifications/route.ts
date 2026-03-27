import { NextResponse, NextRequest } from 'next/server';
import { getAuthenticatedRequestUser } from '@/lib/api-auth';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notifications/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const notifications = await getUserNotifications(user.id, limit, offset);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      await markAllNotificationsAsRead(user.id);
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      await markNotificationAsRead(notificationId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
