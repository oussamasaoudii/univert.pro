"use client";

import Pusher from "pusher-js";

let browserPusherClient: Pusher | null | undefined;

export function isPusherClientConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_PUSHER_KEY &&
      process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  );
}

export function getBrowserPusherClient() {
  if (browserPusherClient !== undefined) {
    return browserPusherClient;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) {
    browserPusherClient = null;
    return browserPusherClient;
  }

  browserPusherClient = new Pusher(key, {
    cluster,
    forceTLS: true,
    channelAuthorization: {
      endpoint: "/api/realtime/pusher/auth",
      transport: "ajax",
    },
  });

  return browserPusherClient;
}
