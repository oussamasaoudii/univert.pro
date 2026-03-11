import { NextResponse } from "next/server";
import { getAdminRequestUser, getDashboardRequestUser } from "@/lib/api-auth";
import {
  parseAdminNotificationChannel,
  parseUserNotificationChannel,
} from "@/lib/realtime/channels";
import { getPusherServerClient } from "@/lib/realtime/pusher-server";
import { enforceRouteRateLimit, getRequestIp } from "@/lib/security/request";

function parsePusherAuthRequest(requestBody: string) {
  const params = new URLSearchParams(requestBody);
  return {
    socketId: params.get("socket_id")?.trim() || "",
    channelName: params.get("channel_name")?.trim() || "",
  };
}

export async function POST(request: Request) {
  try {
    const pusher = getPusherServerClient();
    if (!pusher) {
      return NextResponse.json({ error: "realtime_not_configured" }, { status: 503 });
    }

    const { socketId, channelName } = parsePusherAuthRequest(await request.text());
    if (!socketId || !channelName) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const [dashboardUser, adminUser] = await Promise.all([
      getDashboardRequestUser(),
      getAdminRequestUser(),
    ]);
    const actor = adminUser || dashboardUser;
    if (!actor) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: "realtime-channel-auth",
      key: `${actor.id}:${getRequestIp(request)}`,
      limit: 240,
      windowMs: 5 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    });

    const userChannelUserId = parseUserNotificationChannel(channelName);
    if (userChannelUserId) {
      if (!dashboardUser || dashboardUser.id !== userChannelUserId) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }

      return NextResponse.json(pusher.authorizeChannel(socketId, channelName));
    }

    const adminChannelUserId = parseAdminNotificationChannel(channelName);
    if (adminChannelUserId) {
      if (!adminUser || adminUser.id !== adminChannelUserId) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }

      return NextResponse.json(pusher.authorizeChannel(socketId, channelName));
    }

    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  } catch (error) {
    console.error("[realtime/pusher/auth] Failed to authorize channel", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
