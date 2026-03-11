import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { toMySqlDateTime } from "@/lib/mysql/datetime";
import { ensureAuditSchema } from "@/lib/mysql/legacy-schema";
import { logger } from "@/lib/utils/errors";

export type AuditAction =
  | 'admin.provision_website'
  | 'admin.cancel_provision'
  | 'admin.approve_provision'
  | 'admin.reject_provision'
  | 'admin.create_domain'
  | 'admin.delete_domain'
  | 'admin.create_backup'
  | 'admin.delete_backup'
  | 'admin.restore_backup'
  | 'admin.update_subscription'
  | 'admin.update_billing_plan'
  | 'admin.create_user'
  | 'admin.update_user_access'
  | 'admin.suspend_user'
  | 'admin.enable_maintenance'
  | 'admin.disable_maintenance'
  | 'admin.update_system_settings'
  | 'user.launch_website'
  | 'user.update_website'
  | 'user.delete_website'
  | 'user.add_domain'
  | 'user.remove_domain'
  | 'user.create_backup'
  | 'user.export_website'
  | 'user.restore_backup'
  | 'user.update_billing'
  | 'user.login'
  | 'user.logout'
  | 'user.update_profile'
  | 'admin.login'
  | 'admin.logout'
  | 'security.admin_mfa_challenge_issued'
  | 'security.admin_mfa_enrolled'
  | 'security.admin_mfa_verified'
  | 'security.admin_mfa_verification_failed'
  | 'security.admin_mfa_recovery_code_used'
  | 'security.admin_mfa_recovery_codes_regenerated'
  | 'security.admin_mfa_disable_attempted'
  | 'security.admin_mfa_disabled'
  | 'security.admin_step_up_verified'
  | 'security.invalid_json_rejected'
  | 'security.invalid_schema_rejected'
  | 'security.admin_api_unauthorized'
  | 'security.internal_api_unauthorized'
  | 'security.cross_tenant_access_rejected'
  | 'security.repeated_failed_login_detected'
  | 'security.password_reset_requested'
  | 'security.password_reset_completed'
  | 'security.rate_limit_exceeded';

export interface AuditLogEntry {
  id: string;
  actor_id: string;
  actor_type: 'admin' | 'user' | 'system';
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  changes: Record<string, any>;
  status: 'success' | 'failure';
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

type AuditLogDbRow = Omit<AuditLogEntry, "changes" | "metadata"> & {
  changes: string | null;
  metadata: string | null;
};

function parseJsonRecord(value: string | null): Record<string, any> {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, any>)
      : {};
  } catch {
    return {};
  }
}

function mapAuditLog(row: AuditLogDbRow): AuditLogEntry {
  return {
    ...row,
    changes: parseJsonRecord(row.changes),
    metadata: parseJsonRecord(row.metadata),
  };
}

async function listAuditLogs(
  whereClause: string,
  params: Array<string | number>,
  limit: number,
): Promise<AuditLogEntry[]> {
  await ensureAuditSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query(
    `
      SELECT
        id,
        actor_id,
        actor_type,
        action,
        resource_type,
        resource_id,
        changes,
        status,
        error_message,
        ip_address,
        user_agent,
        timestamp,
        metadata
      FROM audit_logs
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ?
    `,
    [...params, limit],
  );

  return (rows as AuditLogDbRow[]).map(mapAuditLog);
}

export async function createAuditLog(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>,
): Promise<boolean> {
  try {
    await ensureAuditSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        INSERT INTO audit_logs (
          id, actor_id, actor_type, action, resource_type, resource_id,
          changes, status, error_message, ip_address, user_agent, timestamp, metadata
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        randomUUID(),
        entry.actor_id,
        entry.actor_type,
        entry.action,
        entry.resource_type,
        entry.resource_id,
        JSON.stringify(entry.changes || {}),
        entry.status,
        entry.error_message || null,
        entry.ip_address || null,
        entry.user_agent || null,
        toMySqlDateTime(new Date()),
        JSON.stringify(entry.metadata || {}),
      ],
    );

    return true;
  } catch (error) {
    logger.error('Error creating audit log', error, { action: entry.action });
    return false;
  }
}

export async function getResourceAuditLogs(
  resourceId: string,
  limit: number = 50,
): Promise<AuditLogEntry[]> {
  try {
    return listAuditLogs("WHERE resource_id = ?", [resourceId], limit);
  } catch (error) {
    logger.error('Error fetching audit logs', error, { resourceId });
    return [];
  }
}

export async function getActorAuditLogs(
  actorId: string,
  limit: number = 100,
): Promise<AuditLogEntry[]> {
  try {
    return listAuditLogs("WHERE actor_id = ?", [actorId], limit);
  } catch (error) {
    logger.error('Error fetching actor audit logs', error, { actorId });
    return [];
  }
}

export async function getAllAuditLogs(
  filters?: {
    action?: AuditAction;
    resourceType?: string;
    actorId?: string;
    status?: 'success' | 'failure';
    startDate?: Date;
    endDate?: Date;
  },
  limit: number = 1000,
): Promise<AuditLogEntry[]> {
  try {
    const where: string[] = [];
    const params: Array<string | number> = [];

    if (filters?.action) {
      where.push("action = ?");
      params.push(filters.action);
    }
    if (filters?.resourceType) {
      where.push("resource_type = ?");
      params.push(filters.resourceType);
    }
    if (filters?.actorId) {
      where.push("actor_id = ?");
      params.push(filters.actorId);
    }
    if (filters?.status) {
      where.push("status = ?");
      params.push(filters.status);
    }
    if (filters?.startDate) {
      where.push("timestamp >= ?");
      params.push(filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      where.push("timestamp <= ?");
      params.push(filters.endDate.toISOString());
    }

    const clause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    return listAuditLogs(clause, params, limit);
  } catch (error) {
    logger.error('Error fetching audit logs', error);
    return [];
  }
}

export async function logAdminAction(
  adminId: string,
  action: AuditAction,
  resourceType: string,
  resourceId: string,
  changes?: Record<string, any>,
  status: 'success' | 'failure' = 'success',
  errorMessage?: string,
): Promise<boolean> {
  return createAuditLog({
    actor_id: adminId,
    actor_type: 'admin',
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    changes: changes || {},
    status,
    error_message: errorMessage,
  });
}

export async function logUserAction(
  userId: string,
  action: AuditAction,
  resourceType: string,
  resourceId: string,
  changes?: Record<string, any>,
  status: 'success' | 'failure' = 'success',
  errorMessage?: string,
): Promise<boolean> {
  return createAuditLog({
    actor_id: userId,
    actor_type: 'user',
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    changes: changes || {},
    status,
    error_message: errorMessage,
  });
}

export async function logSystemAction(
  action: AuditAction,
  resourceType: string,
  resourceId: string,
  changes?: Record<string, any>,
  status: 'success' | 'failure' = 'success',
  errorMessage?: string,
): Promise<boolean> {
  return createAuditLog({
    actor_id: 'system',
    actor_type: 'system',
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    changes: changes || {},
    status,
    error_message: errorMessage,
  });
}
