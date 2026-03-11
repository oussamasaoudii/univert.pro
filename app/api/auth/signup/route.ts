import { z } from "zod";
import { NextResponse } from "next/server";
import { createPendingUser } from "@/lib/mysql/users";
import { getPlatformSettings } from "@/lib/mysql/settings";
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  parseJsonBody,
  toApiErrorResponse,
} from "@/lib/security/request";

const signupSchema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(256),
    fullName: z.string().trim().min(1).max(191).optional(),
    companyName: z.string().trim().min(1).max(191).optional(),
  })
  .strict();

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    await enforceRouteRateLimit({
      scope: "auth-signup-ip",
      key: getRequestIp(request),
      limit: 5,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 2 * 60 * 60 * 1000,
    });

    const settings = await getPlatformSettings();
    if (!settings.allowNewSignups) {
      return NextResponse.json({ error: "signup_disabled" }, { status: 403 });
    }

    const body = await parseJsonBody(request, signupSchema, {
      maxBytes: 16 * 1024,
      audit: {
        resourceId: "/api/auth/signup",
      },
    });
    const result = await createPendingUser({
      email: body.email,
      password: body.password,
      fullName: body.fullName,
      companyName: body.companyName,
    });

    if (result.error === "invalid_email" || result.error === "weak_password") {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (result.error === "already_exists") {
      return NextResponse.json(
        { ok: true, status: "pending_review" },
        { status: 202 },
      );
    }

    return NextResponse.json({ ok: true, status: "pending_review" }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error, { action: "auth.signup" });
  }
}
