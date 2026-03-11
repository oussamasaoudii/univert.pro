import { NextResponse } from "next/server";
import { getAdminRequestUser } from "@/lib/api-auth";
import { updateWebsiteStatus, type WebsiteStatus } from "@/lib/mysql/platform";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const ALLOWED_STATUSES: WebsiteStatus[] = [
  "pending",
  "provisioning",
  "ready",
  "suspended",
  "failed",
];

function parseStatus(value: unknown): WebsiteStatus | undefined {
  return typeof value === "string" &&
    ALLOWED_STATUSES.includes(value as WebsiteStatus)
    ? (value as WebsiteStatus)
    : undefined;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "invalid_website_id" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const status = parseStatus(body.status);
    if (!status) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }

    const website = await updateWebsiteStatus(id, status);
    if (!website) {
      return NextResponse.json({ error: "website_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, website });
  } catch (error) {
    console.error("[api/admin/websites/:id][PATCH] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
