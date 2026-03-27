'use client';

import PusherJS from 'pusher-js';

if (!process.env.NEXT_PUBLIC_PUSHER_APP_KEY || !process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER) {
  throw new Error('Pusher client environment variables are not configured');
}

const pusherClient = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
  encrypted: process.env.NEXT_PUBLIC_PUSHER_SCHEME === 'https',
});

export default pusherClient;
