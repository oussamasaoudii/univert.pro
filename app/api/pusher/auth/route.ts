import { NextRequest, NextResponse } from 'next/server';
import pusherServer from '@/lib/pusher/server';
import { getAuthenticatedRequestUser } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { socket_id, channel_name } = body;

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: 'socket_id and channel_name are required' },
        { status: 400 }
      );
    }

    // Validate that user is authorized for this channel
    // Example: private-user-123
    if (channel_name.startsWith('private-user-')) {
      const userId = channel_name.split('-').pop();
      if (userId !== user.id.toString()) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    // Authorize the subscription
    const auth = pusherServer.authorizeChannel(socket_id, channel_name);

    return NextResponse.json(auth);
  } catch (error) {
    console.error('Pusher authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to authorize channel' },
      { status: 500 }
    );
  }
}
