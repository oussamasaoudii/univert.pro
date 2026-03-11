import { z } from "zod";
import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import { createUserActivity, createUserNotification } from "@/lib/mysql/platform";
import {
  createCustomDomainForUser,
  listDashboardDomainsForUser,
} from "@/lib/domain/user-domain-service";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  parseJsonBody,
  toApiErrorResponse,
} from "@/lib/security/request";

const domainPattern =
  /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;

const createDomainSchema = z
  .object({
    domain: z.string().trim().regex(domainPattern, "invalid_domain"),
    websiteId: z.string().trim().min(1).max(64).nullable().optional(),
    isPrimary: z.boolean().optional(),
  })
  .strict();

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: "dashboard-domain-read",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 60,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    const domains = await listDashboardDomainsForUser(user.id);
    return NextResponse.json({ domains });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.domains.read" });
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: "dashboard-domain-create",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 10,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 2 * 60 * 60 * 1000,
    });

    const body = await parseJsonBody(request, createDomainSchema, { maxBytes: 8 * 1024 });
    const result = await createCustomDomainForUser({
      userId: user.id,
      websiteId: body.websiteId || null,
      domain: body.domain.toLowerCase(),
      isPrimary: body.isPrimary === true,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 400 },
      );
    }

    await Promise.all([
      createUserActivity(user.id, {
        activityType: "domain_connected",
        message: body.websiteId
          ? `Domain ${result.domain.domain} was added and is awaiting DNS verification.`
          : `Domain ${result.domain.domain} was added to your account and is awaiting DNS verification.`,
      }),
      createUserNotification(user.id, {
        title: "Domain Added",
        message: body.websiteId
          ? `${result.domain.domain} was added. Publish the DNS records to complete verification.`
          : `${result.domain.domain} was added. Publish the DNS records, then bind it to a website once verification succeeds.`,
      }),
    ]);

    return NextResponse.json({ ok: true, domain: result.domain }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.domains.create" });
  }
}
