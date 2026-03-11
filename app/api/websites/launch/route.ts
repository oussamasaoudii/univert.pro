import { z } from "zod";
import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import {
  launchWebsiteForUser,
  type LaunchWebsiteInput,
} from "@/lib/provisioning/launch-workflow";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  parseJsonBody,
  toApiErrorResponse,
} from "@/lib/security/request";

const subdomainPattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
const domainPattern =
  /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;

const launchWebsiteSchema = z
  .object({
    templateId: z.string().trim().min(1).max(64),
    name: z.string().trim().min(2).max(120),
    subdomain: z.string().trim().regex(subdomainPattern, "invalid_subdomain"),
    customDomain: z.string().trim().regex(domainPattern, "invalid_domain").optional(),
  })
  .strict();

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const user = await getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: "website-launch",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 10,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 2 * 60 * 60 * 1000,
    });

    const body = await parseJsonBody(request, launchWebsiteSchema, { maxBytes: 8 * 1024 });
    const payload: LaunchWebsiteInput = {
      templateId: body.templateId,
      name: body.name,
      subdomain: body.subdomain.toLowerCase(),
      customDomain: body.customDomain?.toLowerCase(),
    };

    const result = await launchWebsiteForUser(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      payload,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "launch_failed" },
        { status: 422 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return toApiErrorResponse(error, { action: "websites.launch" });
  }
}
