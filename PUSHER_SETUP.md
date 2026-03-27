# Pusher Real-time Messaging Integration

## Overview

Pusher integration enables real-time messaging, notifications, and live updates in your application.

## Setup

### 1. Install Dependencies

```bash
npm install pusher pusher-js
```

### 2. Configure Environment Variables

Add the following to your `.env.local`:

```env
# Server-side Pusher configuration
PUSHER_APP_ID=your_pusher_app_id
PUSHER_APP_KEY=your_pusher_app_key
PUSHER_APP_SECRET=your_pusher_app_secret
PUSHER_HOST=api-eu.pusher.com
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=eu

# Client-side Pusher configuration (must have NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_app_key
NEXT_PUBLIC_PUSHER_HOST=api-eu.pusher.com
NEXT_PUBLIC_PUSHER_PORT=443
NEXT_PUBLIC_PUSHER_SCHEME=https
NEXT_PUBLIC_PUSHER_APP_CLUSTER=eu
```

Replace:
- `your_pusher_app_id` - Your Pusher App ID
- `your_pusher_app_key` - Your Pusher App Key
- `your_pusher_app_secret` - Your Pusher App Secret
- `eu` - Your Pusher cluster (e.g., 'eu', 'us2', etc.)

## Usage

### Server-side: Broadcasting Messages

```typescript
import pusherServer from '@/lib/pusher/server';

// Broadcast to a specific channel
await pusherServer.trigger('channel-name', 'event-name', {
  message: 'Hello, users!',
  userId: 123,
});

// Trigger multiple channels
await pusherServer.trigger(
  ['channel-1', 'channel-2'],
  'event-name',
  { data: 'broadcast data' }
);
```

### Client-side: Subscribing to Channels

#### Basic Channel Subscription

```typescript
'use client';

import { usePusherChannel, usePusherEvent } from '@/hooks/use-pusher';

export function MyComponent() {
  const channel = usePusherChannel('my-channel', {
    onSubscribe: () => console.log('Subscribed!'),
    onError: (error) => console.error('Subscription failed:', error),
  });

  usePusherEvent(channel, 'my-event', (data) => {
    console.log('Received event:', data);
  });

  return <div>Listening for real-time updates...</div>;
}
```

#### Private Channels

Private channels require authentication. They follow the naming pattern `private-*`.

```typescript
const channel = usePusherChannel('private-user-123');
```

The authentication is handled by `/api/pusher/auth` endpoint.

#### Presence Channels

Presence channels allow you to see who's online and track user presence.

```typescript
const { channel, members } = usePusherPresence('presence-chat', {
  user_id: userId,
  user_info: { name: userName },
});

// Access online members
members.forEach((info, userId) => {
  console.log(`${userId}: ${info.name}`);
});
```

### API Route: Channel Authorization

The `/api/pusher/auth` route handles authentication for private and presence channels:

```typescript
// Example: Private channel authorization
// POST /api/pusher/auth
// Body: { socket_id: '123.456', channel_name: 'private-user-123' }
// Returns: { auth: 'token', channel_data: {...} }
```

## Channel Types

### Public Channels

Any client can subscribe without authentication.

```typescript
const channel = usePusherChannel('public-channel');
```

### Private Channels

Named with `private-` prefix. Requires authentication.

```typescript
const channel = usePusherChannel('private-user-123');
```

### Presence Channels

Named with `presence-` prefix. Shows who's online and their data.

```typescript
const { channel, members } = usePusherPresence('presence-room-1');
```

## Security

### Best Practices

1. **Authenticate users** - Use JWT or sessions before broadcasting
2. **Validate authorization** - Check channel permissions in `/api/pusher/auth`
3. **Use private channels** - For user-specific data (messages, notifications)
4. **Validate events** - Sanitize and validate data before displaying
5. **Rate limiting** - Implement rate limiting on broadcast endpoints

### Example: Secure Private Channel

```typescript
// /api/pusher/auth
if (channel_name.startsWith('private-user-')) {
  const userId = channel_name.split('-').pop();
  
  // Only authorize if user owns this channel
  if (userId !== currentUser.id) {
    return { error: 'Forbidden' };
  }
}
```

## Examples

### Real-time Notifications

```typescript
// Server: Send notification
await pusherServer.trigger(`private-user-${userId}`, 'notification', {
  title: 'New Message',
  body: 'You have a new message',
});

// Client: Listen for notifications
const channel = usePusherChannel(`private-user-${userId}`);
usePusherEvent(channel, 'notification', (data) => {
  showNotification(data.title, data.body);
});
```

### Live Chat

```typescript
// Server: Broadcast message
await pusherServer.trigger('presence-chat-room-1', 'message', {
  userId: user.id,
  username: user.name,
  message: 'Hello everyone!',
  timestamp: new Date(),
});

// Client: Subscribe and listen
const { channel, members } = usePusherPresence('presence-chat-room-1');

usePusherEvent(channel, 'message', (data) => {
  addMessageToChat(data);
});
```

### Live Presence Tracking

```typescript
const { channel, members } = usePusherPresence('presence-office', {
  user_id: currentUser.id,
  user_info: { name: currentUser.name, status: 'online' },
});

// Update members list when they join/leave
useEffect(() => {
  setOnlineUsers(Array.from(members.entries()).map(([id, info]) => info));
}, [members]);
```

## Troubleshooting

### "Pusher environment variables not configured"

- Check that all `PUSHER_*` environment variables are set
- Ensure the variables match exactly (case-sensitive)
- Restart the development server after updating `.env.local`

### Failed to connect

- Verify Pusher App ID, Key, and Secret are correct
- Check your Pusher cluster is correct (eu, us2, etc.)
- Ensure firewall allows connections to Pusher servers

### Channel authorization fails

- Verify `/api/pusher/auth` endpoint is accessible
- Check that the user is authenticated
- Ensure channel name validation logic is correct

### No events received

- Check channel name is spelled correctly
- Verify the event name matches the listener
- Ensure data is being triggered from the server
- Check browser console for errors

## Resources

- [Pusher Documentation](https://pusher.com/docs)
- [Pusher JavaScript Library](https://github.com/pusher/pusher-js)
- [Pusher Node.js Library](https://github.com/pusher/pusher-http-node)
