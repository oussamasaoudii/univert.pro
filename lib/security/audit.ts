import { createAuditLog, type AuditAction, type AuditLogEntry } from "@/lib/utils/audit";
import { logger } from "@/lib/utils/errors";

export type SecurityRequestAuditAction = Extract<
  AuditAction,
  | "security.invalid_json_rejected"
  | "security.invalid_schema_rejected"
  | "security.admin_api_unauthorized"
  | "security.internal_api_unauthorized"
  | "security.cross_tenant_access_rejected"
>;

export type SecurityRequestAuditInput = {
  action: SecurityRequestAuditAction;
  actorId?: string;
  actorType?: AuditLogEntry["actor_type"];
  resourceType?: string;
  resourceId?: string;
  status?: AuditLogEntry["status"];
  errorMessage?: string;
  changes?: Record<string, unknown>;
};

export type SecurityAuditLogger = (
  request: Request,
  input: SecurityRequestAuditInput,
) => Promise<void> | void;

function getRequestPath(request: Request) {
  try {
    return new URL(request.url).pathname;
  } catch {
    return "unknown";
  }
}

function getRequestIp(request: Request) {
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

function getRequestUserAgent(request: Request) {
  return request.headers.get("user-agent")?.slice(0, 255) || "unknown";
}

export async function createSecurityRequestAuditLog(
  request: Request,
  input: SecurityRequestAuditInput,
) {
  const path = getRequestPath(request);

  await createAuditLog({
    actor_id: input.actorId || "security",
    actor_type: input.actorType || "system",
    action: input.action,
    resource_type: input.resourceType || "api_route",
    resource_id: input.resourceId || path,
    changes: {
      method: request.method,
      path,
      ...(input.changes || {}),
    },
    status: input.status || "failure",
    error_message: input.errorMessage,
    ip_address: getRequestIp(request),
    user_agent: getRequestUserAgent(request),
  });
}

export function queueSecurityRequestAuditLog(
  request: Request,
  input: SecurityRequestAuditInput,
) {
  void createSecurityRequestAuditLog(request, input).catch((error) => {
    logger.error("Failed to create security request audit log", error, {
      action: input.action,
      resourceId: input.resourceId,
    });
  });
}

export function toSecurityActorType(role: string | undefined): AuditLogEntry["actor_type"] {
  return role === "admin" ? "admin" : "user";
}

export type CrossTenantAuditInput = {
  actorId: string;
  actorType: AuditLogEntry["actor_type"];
  resourceType: string;
  targetId: string;
  routeId: string;
  statusCode: 403 | 404;
  relatedResourceType?: string;
  relatedResourceId?: string;
};

export type CrossTenantAuditLogger = (
  request: Request,
  input: CrossTenantAuditInput,
) => Promise<void> | void;

export function queueCrossTenantAccessAuditLog(
  request: Request,
  input: CrossTenantAuditInput,
) {
  queueSecurityRequestAuditLog(request, {
    action: "security.cross_tenant_access_rejected",
    actorId: input.actorId,
    actorType: input.actorType,
    resourceType: input.resourceType,
    resourceId: input.targetId,
    errorMessage: "cross_tenant_access_rejected",
    changes: {
      route: input.routeId,
      statusCode: input.statusCode,
      ...(input.relatedResourceType
        ? {
            relatedResourceType: input.relatedResourceType,
            relatedResourceId: input.relatedResourceId || null,
          }
        : {}),
    },
  });
}
