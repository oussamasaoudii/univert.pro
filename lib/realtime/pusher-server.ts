import Pusher from "pusher";

let pusherServer: Pusher | null | undefined;

function getServerPusherConfig() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  return { appId, key, secret, cluster };
}

export function isPusherServerConfigured() {
  return getServerPusherConfig() !== null;
}

export function getPusherServerClient() {
  if (pusherServer !== undefined) {
    return pusherServer;
  }

  const config = getServerPusherConfig();
  if (!config) {
    pusherServer = null;
    return pusherServer;
  }

  pusherServer = new Pusher({
    appId: config.appId,
    key: config.key,
    secret: config.secret,
    cluster: config.cluster,
    useTLS: true,
  });

  return pusherServer;
}
