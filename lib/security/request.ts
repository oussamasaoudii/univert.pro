import { NextResponse } from "next/server";
import { z } from "zod";
import { isTrustedOrigin } from "./trusted-origin";
import { consumeRateLimit } from "@/lib/mysql/security";
import {
  queueSecurityRequestAuditLog,
  type SecurityAuditLogger,
} from "@/lib/security/audit";
import {
  AppError,
  AuthorizationError,
  RateLimitError,
  ValidationError,
} from "@/lib/utils/errors";
import { logger } from "@/lib/utils/errors";

const INTERNAL_SECRET_HEADERS = ["CRON_SECRET", "WEBHOOK_SECRET"] as const;

type RequestAuditOptions = {
  actorId?: string;
  actorType?: "admin" | "user" | "system";
  resourceType?: string;
  resourceId?: string;
  log?: SecurityAuditLogger;
};

type ParseJsonBodyOptions = {
  maxBytes?: number;
  audit?: RequestAuditOptions;
};

export function getRequestIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function getRequestUserAgent(request: Request): string {
  return request.headers.get("user-agent")?.slice(0, 255) || "unknown";
}

export function hasValidInternalBearer(request: Request): boolean {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  const token = authorization.slice("Bearer ".length);
  return INTERNAL_SECRET_HEADERS.some((envKey) => {
    const expected = process.env[envKey];
    return Boolean(expected && token === expected);
  });
}

export function assertTrustedOrigin(request: Request) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method.toUpperCase())) {
    return;
  }

  if (hasValidInternalBearer(request)) {
    return;
  }

  if (
    isTrustedOrigin(request.url, request.headers.get("origin"), request.headers.get("referer"))
  ) {
    return;
  }

  throw new AuthorizationError("invalid_request_origin");
}

async function emitSecurityAuditLog(
  request: Request,
  input: Parameters<SecurityAuditLogger>[1],
  log?: SecurityAuditLogger,
) {
  await Promise.resolve((log || queueSecurityRequestAuditLog)(request, input));
}

function getJsonBodyAuditMetadata(parsedJson: unknown) {
  if (parsedJson && typeof parsedJson === "object" && !Array.isArray(parsedJson)) {
    return {
      payloadType: "object",
      receivedKeys: Object.keys(parsedJson as Record<string, unknown>).slice(0, 25),
    };
  }

  if (Array.isArray(parsedJson)) {
    return {
      payloadType: "array",
      receivedKeys: [],
    };
  }

  return {
    payloadType: typeof parsedJson,
    receivedKeys: [],
  };
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
  options?: ParseJsonBodyOptions,
): Promise<T> {
  const rawBody = await request.text();
  if (!rawBody) {
    if (options?.audit) {
      await emitSecurityAuditLog(
        request,
        {
          action: "security.invalid_schema_rejected",
          actorId: options.audit.actorId,
          actorType: options.audit.actorType,
          resourceType: options.audit.resourceType,
          resourceId: options.audit.resourceId,
          errorMessage: "request_body_required",
          changes: {
            location: "body",
            reason: "request_body_required",
          },
        },
        options.audit.log,
      );
    }
    throw new ValidationError("request_body_required");
  }

  const maxBytes = options?.maxBytes ?? 64 * 1024;
  if (Buffer.byteLength(rawBody, "utf8") > maxBytes) {
    if (options?.audit) {
      await emitSecurityAuditLog(
        request,
        {
          action: "security.invalid_schema_rejected",
          actorId: options.audit.actorId,
          actorType: options.audit.actorType,
          resourceType: options.audit.resourceType,
          resourceId: options.audit.resourceId,
          errorMessage: "request_body_too_large",
          changes: {
            location: "body",
            reason: "request_body_too_large",
            sizeBytes: Buffer.byteLength(rawBody, "utf8"),
            maxBytes,
          },
        },
        options.audit.log,
      );
    }
    throw new ValidationError("request_body_too_large");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    if (options?.audit) {
      await emitSecurityAuditLog(
        request,
        {
          action: "security.invalid_json_rejected",
          actorId: options.audit.actorId,
          actorType: options.audit.actorType,
          resourceType: options.audit.resourceType,
          resourceId: options.audit.resourceId,
          errorMessage: "invalid_json",
          changes: {
            location: "body",
            reason: "invalid_json",
          },
        },
        options.audit.log,
      );
    }
    throw new ValidationError("invalid_json");
  }

  const result = schema.safeParse(parsedJson);
  if (!result.success) {
    if (options?.audit) {
      await emitSecurityAuditLog(
        request,
        {
          action: "security.invalid_schema_rejected",
          actorId: options.audit.actorId,
          actorType: options.audit.actorType,
          resourceType: options.audit.resourceType,
          resourceId: options.audit.resourceId,
          errorMessage: "invalid_request_body",
          changes: {
            location: "body",
            reason: "invalid_request_body",
            issueCount: result.error.issues.length,
            ...getJsonBodyAuditMetadata(parsedJson),
          },
        },
        options.audit.log,
      );
    }
    throw new ValidationError("invalid_request_body", {
      issues: result.error.flatten(),
    });
  }

  return result.data;
}

export async function enforceRouteRateLimit(input: {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
  blockDurationMs: number;
}) {
  const result = await consumeRateLimit(input);
  if (!result.allowed) {
    throw new RateLimitError("too_many_requests", {
      retryAfterSeconds: result.retryAfterSeconds,
      scope: input.scope,
    });
  }

  return result;
}

export async function applyProgressiveDelay(attempts: number) {
  const delayMs = Math.min(2000, Math.max(0, attempts - 1) * 250);
  if (delayMs <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

export function toApiErrorResponse(error: unknown, context?: Record<string, unknown>) {
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error(error.message, error, context);
    } else {
      logger.warn(error.message, context);
    }

    return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
  }

  logger.error("Unhandled API error", error, context);
  return NextResponse.json({ error: "internal_error" }, { status: 500 });
}
