import { NextResponse } from "next/server";
import { z } from "zod";
import type { AuthenticatedRequestUser } from "@/lib/api-auth";
import { getAdminRequestUser } from "@/lib/api-auth";
import {
  queueSecurityRequestAuditLog,
  type SecurityAuditLogger,
} from "@/lib/security/audit";
import {
  enforceRouteRateLimit,
  getRequestIp,
  getRequestUserAgent,
  toApiErrorResponse,
} from "@/lib/security/request";
import { AuthenticationError, ValidationError } from "@/lib/utils/errors";

type AdminRouteGuardOptions = {
  scope: string;
  limit?: number;
  windowMs?: number;
  blockDurationMs?: number;
  resourceId?: string;
  auditLog?: SecurityAuditLogger;
};

type AdminRouteContext = {
  adminUser: AuthenticatedRequestUser;
  ipAddress: string;
  userAgent: string;
};

const DEFAULT_RATE_LIMIT = {
  limit: 60,
  windowMs: 5 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
};

type SearchParamsAuditOptions = {
  actorId?: string;
  actorType?: "admin" | "user" | "system";
  resourceId?: string;
  resourceType?: string;
  auditLog?: SecurityAuditLogger;
};

export async function requireAdminRouteAccess(
  request: Request,
  options: AdminRouteGuardOptions,
): Promise<AdminRouteContext> {
  const adminUser = await getAdminRequestUser();
  if (!adminUser) {
    await Promise.resolve(
      (options.auditLog || queueSecurityRequestAuditLog)(request, {
        action: "security.admin_api_unauthorized",
        resourceId: options.resourceId || options.scope,
        changes: {
          scope: options.scope,
        },
      }),
    );
    throw new AuthenticationError("unauthorized");
  }

  const ipAddress = getRequestIp(request);
  
  // Temporarily skip rate limiting for admin routes due to MySQL deadlock issues
  // TODO: Fix deadlock and re-enable rate limiting
  // await enforceRouteRateLimit({
  //   scope: options.scope,
  //   key: `${adminUser.id}:${ipAddress}`,
  //   limit: options.limit ?? DEFAULT_RATE_LIMIT.limit,
  //   windowMs: options.windowMs ?? DEFAULT_RATE_LIMIT.windowMs,
  //   blockDurationMs:
  //     options.blockDurationMs ?? DEFAULT_RATE_LIMIT.blockDurationMs,
  // });

  return {
    adminUser,
    ipAddress,
    userAgent: getRequestUserAgent(request),
  };
}

export function parseSearchParams<T extends z.AnyZodObject>(
  request: Request,
  schema: T,
  options?: SearchParamsAuditOptions,
): z.infer<T> {
  const { searchParams } = new URL(request.url);
  const payload: Record<string, string | undefined> = {};
  const auditLog = options?.auditLog || queueSecurityRequestAuditLog;

  for (const [key, value] of searchParams.entries()) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      if (options) {
        void Promise.resolve(
          auditLog(request, {
            action: "security.invalid_schema_rejected",
            actorId: options.actorId,
            actorType: options.actorType,
            resourceId: options.resourceId,
            resourceType: options.resourceType,
            errorMessage: "duplicate_query_parameter",
            changes: {
              location: "query",
              reason: "duplicate_query_parameter",
              key,
            },
          }),
        ).catch(() => {});
      }
      throw new ValidationError("duplicate_query_parameter", { key });
    }
    payload[key] = value;
  }

  try {
    return schema.parse(payload);
  } catch (error) {
    if (options) {
      void Promise.resolve(
        auditLog(request, {
          action: "security.invalid_schema_rejected",
          actorId: options.actorId,
          actorType: options.actorType,
          resourceId: options.resourceId,
          resourceType: options.resourceType,
          errorMessage: "invalid_query_parameters",
          changes: {
            location: "query",
            reason: "invalid_query_parameters",
            receivedKeys: Object.keys(payload).slice(0, 25),
          },
        }),
      ).catch(() => {});
    }
    throw error;
  }
}

export function adminJson<T>(
  payload: T,
  init?: ResponseInit,
) {
  const response = NextResponse.json(payload, init);
  response.headers.set(
    "Cache-Control",
    "private, no-store, max-age=0, must-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export function toAdminApiErrorResponse(
  error: unknown,
  context?: Record<string, unknown>,
) {
  const response = toApiErrorResponse(error, context);
  response.headers.set(
    "Cache-Control",
    "private, no-store, max-age=0, must-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}
