import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { ensureMonitoringSchema } from "@/lib/mysql/legacy-schema";
import type {
  AlertRow,
  HealthCheckRow,
  IncidentRow,
  ServerHealthRow,
  WebsiteHealthSummaryRow,
} from "./types";

type HealthCheckDbRow = Omit<HealthCheckRow, "details" | "response_time_ms"> & {
  details: string | null;
  response_time_ms: number | string | null;
};

type IncidentDbRow = Omit<IncidentRow, "affected_resources"> & {
  affected_resources: string | null;
};

type AlertDbRow = Omit<AlertRow, "message">;

type WebsiteHealthSummaryDbRow = Omit<
  WebsiteHealthSummaryRow,
  "uptime_percentage" | "open_incidents_count" | "critical_incidents_count" | "last_check_duration_ms"
> & {
  uptime_percentage: number | string;
  open_incidents_count: number | string;
  critical_incidents_count: number | string;
  last_check_duration_ms: number | string | null;
};

type ServerHealthDbRow = Omit<
  ServerHealthRow,
  "cpu_percentage" | "memory_percentage" | "disk_percentage" | "active_deployments" | "error_rate"
> & {
  cpu_percentage: number | string | null;
  memory_percentage: number | string | null;
  disk_percentage: number | string | null;
  active_deployments: number | string | null;
  error_rate: number | string | null;
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

function mapHealthCheck(row: HealthCheckDbRow | null): HealthCheckRow | null {
  if (!row) return null;
  return {
    ...row,
    response_time_ms: row.response_time_ms === null ? null : Number(row.response_time_ms),
    details: parseJsonRecord(row.details),
  };
}

function mapIncident(row: IncidentDbRow | null): IncidentRow | null {
  if (!row) return null;
  return {
    ...row,
    affected_resources: parseJsonRecord(row.affected_resources),
  };
}

function mapWebsiteHealthSummary(row: WebsiteHealthSummaryDbRow | null): WebsiteHealthSummaryRow | null {
  if (!row) return null;
  return {
    ...row,
    uptime_percentage: Number(row.uptime_percentage || 0),
    open_incidents_count: Number(row.open_incidents_count || 0),
    critical_incidents_count: Number(row.critical_incidents_count || 0),
    last_check_duration_ms: row.last_check_duration_ms === null ? null : Number(row.last_check_duration_ms),
  };
}

function mapServerHealth(row: ServerHealthDbRow | null): ServerHealthRow | null {
  if (!row) return null;
  return {
    ...row,
    cpu_percentage: row.cpu_percentage === null ? null : Number(row.cpu_percentage),
    memory_percentage: row.memory_percentage === null ? null : Number(row.memory_percentage),
    disk_percentage: row.disk_percentage === null ? null : Number(row.disk_percentage),
    active_deployments: row.active_deployments === null ? null : Number(row.active_deployments),
    error_rate: row.error_rate === null ? null : Number(row.error_rate),
  };
}

export async function recordHealthCheck(
  websiteId: string | null,
  checkType: HealthCheckRow["check_type"],
  status: HealthCheckRow["status"],
  responseTimeMs: number | null = null,
  errorMessage: string | null = null,
  details: Record<string, any> = {},
): Promise<HealthCheckRow | null> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    const id = randomUUID();
    await pool.query(
      `
        INSERT INTO health_checks (
          id, website_id, check_type, status, response_time_ms, error_message, details, checked_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [id, websiteId, checkType, status, responseTimeMs, errorMessage, JSON.stringify(details)],
    );

    const [rows] = await pool.query("SELECT * FROM health_checks WHERE id = ? LIMIT 1", [id]);
    return mapHealthCheck(((rows as HealthCheckDbRow[])[0] || null));
  } catch (error) {
    console.error("[db] Error recording health check:", error);
    return null;
  }
}

export async function getLatestHealthChecks(
  websiteId: string,
  limit: number = 20,
): Promise<HealthCheckRow[]> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM health_checks
        WHERE website_id = ?
        ORDER BY checked_at DESC, created_at DESC
        LIMIT ?
      `,
      [websiteId, limit],
    );

    return (rows as HealthCheckDbRow[])
      .map((row) => mapHealthCheck(row))
      .filter(Boolean) as HealthCheckRow[];
  } catch (error) {
    console.error("[db] Error fetching health checks:", error);
    return [];
  }
}

export async function createIncident(
  websiteId: string,
  userId: string,
  incidentType: IncidentRow["incident_type"],
  severity: IncidentRow["severity"],
  title: string,
  description: string | null = null,
  affectedResources: Record<string, any> = {},
): Promise<IncidentRow | null> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    const id = randomUUID();
    await pool.query(
      `
        INSERT INTO incidents (
          id, website_id, user_id, incident_type, status, severity, title, description, affected_resources
        )
        VALUES (?, ?, ?, ?, 'open', ?, ?, ?, ?)
      `,
      [id, websiteId, userId, incidentType, severity, title, description, JSON.stringify(affectedResources)],
    );

    const [rows] = await pool.query("SELECT * FROM incidents WHERE id = ? LIMIT 1", [id]);
    return mapIncident(((rows as IncidentDbRow[])[0] || null));
  } catch (error) {
    console.error("[db] Error creating incident:", error);
    return null;
  }
}

export async function updateIncidentStatus(
  incidentId: string,
  status: IncidentRow["status"],
  resolutionNotes?: string | null,
): Promise<IncidentRow | null> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE incidents
        SET status = ?,
            resolution_notes = ?,
            resolved_at = CASE WHEN ? IN ('resolved', 'closed') THEN NOW() ELSE NULL END,
            updated_at = NOW()
        WHERE id = ?
      `,
      [status, resolutionNotes || null, status, incidentId],
    );

    const [rows] = await pool.query("SELECT * FROM incidents WHERE id = ? LIMIT 1", [incidentId]);
    return mapIncident(((rows as IncidentDbRow[])[0] || null));
  } catch (error) {
    console.error("[db] Error updating incident:", error);
    return null;
  }
}

export async function getWebsiteIncidents(
  websiteId: string,
  status?: IncidentRow["status"],
  limit: number = 50,
): Promise<IncidentRow[]> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM incidents
        WHERE website_id = ?
          ${status ? "AND status = ?" : ""}
        ORDER BY created_at DESC
        LIMIT ?
      `,
      status ? [websiteId, status, limit] : [websiteId, limit],
    );

    return (rows as IncidentDbRow[])
      .map((row) => mapIncident(row))
      .filter(Boolean) as IncidentRow[];
  } catch (error) {
    console.error("[db] Error fetching incidents:", error);
    return [];
  }
}

export async function createAlert(
  incidentId: string | null,
  websiteId: string,
  userId: string,
  alertType: string,
  alertState: AlertRow["alert_state"],
  title: string,
  message: string | null = null,
  actionUrl: string | null = null,
  actionLabel: string | null = null,
): Promise<AlertRow | null> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    const id = randomUUID();
    await pool.query(
      `
        INSERT INTO alerts (
          id, incident_id, website_id, user_id, alert_type, alert_state, title, message, action_url, action_label, sent_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [id, incidentId, websiteId, userId, alertType, alertState, title, message, actionUrl, actionLabel],
    );

    const [rows] = await pool.query("SELECT * FROM alerts WHERE id = ? LIMIT 1", [id]);
    return ((rows as AlertRow[])[0] || null);
  } catch (error) {
    console.error("[db] Error creating alert:", error);
    return null;
  }
}

export async function acknowledgeAlert(
  alertId: string,
  userId: string,
): Promise<AlertRow | null> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE alerts
        SET acknowledged_at = NOW(),
            acknowledged_by = ?,
            updated_at = NOW()
        WHERE id = ?
      `,
      [userId, alertId],
    );

    const [rows] = await pool.query("SELECT * FROM alerts WHERE id = ? LIMIT 1", [alertId]);
    return ((rows as AlertRow[])[0] || null);
  } catch (error) {
    console.error("[db] Error acknowledging alert:", error);
    return null;
  }
}

export async function getUserUnacknowledgedAlerts(userId: string): Promise<AlertRow[]> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM alerts
        WHERE user_id = ?
          AND acknowledged_at IS NULL
        ORDER BY created_at DESC
      `,
      [userId],
    );

    return rows as AlertRow[];
  } catch (error) {
    console.error("[db] Error fetching unacknowledged alerts:", error);
    return [];
  }
}

export async function getAlertsByWebsite(
  websiteId: string,
  limit: number = 50,
): Promise<AlertRow[]> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM alerts
        WHERE website_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `,
      [websiteId, limit],
    );

    return rows as AlertRow[];
  } catch (error) {
    console.error("[db] Error fetching alerts:", error);
    return [];
  }
}

export async function updateWebsiteHealthSummary(
  websiteId: string,
  updates: Partial<WebsiteHealthSummaryRow>,
): Promise<WebsiteHealthSummaryRow | null> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    const existing = await getWebsiteHealthSummary(websiteId);

    if (!existing) {
      await pool.query(
        `
          INSERT INTO website_health_summary (
            id, website_id, overall_status, reachability_status, ssl_status, dns_status,
            last_successful_check, last_failed_check, uptime_percentage,
            open_incidents_count, critical_incidents_count, last_check_duration_ms, last_updated
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `,
        [
          randomUUID(),
          websiteId,
          updates.overall_status || "unknown",
          updates.reachability_status || null,
          updates.ssl_status || null,
          updates.dns_status || null,
          updates.last_successful_check || null,
          updates.last_failed_check || null,
          updates.uptime_percentage ?? 100,
          updates.open_incidents_count ?? 0,
          updates.critical_incidents_count ?? 0,
          updates.last_check_duration_ms ?? null,
        ],
      );

      return getWebsiteHealthSummary(websiteId);
    }

    const fields: string[] = ["last_updated = NOW()"];
    const values: Array<string | number | null> = [];
    if (updates.overall_status) {
      fields.push("overall_status = ?");
      values.push(updates.overall_status);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "reachability_status")) {
      fields.push("reachability_status = ?");
      values.push(updates.reachability_status ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "ssl_status")) {
      fields.push("ssl_status = ?");
      values.push(updates.ssl_status ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "dns_status")) {
      fields.push("dns_status = ?");
      values.push(updates.dns_status ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "last_successful_check")) {
      fields.push("last_successful_check = ?");
      values.push(updates.last_successful_check ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "last_failed_check")) {
      fields.push("last_failed_check = ?");
      values.push(updates.last_failed_check ?? null);
    }
    if (typeof updates.uptime_percentage === "number") {
      fields.push("uptime_percentage = ?");
      values.push(updates.uptime_percentage);
    }
    if (typeof updates.open_incidents_count === "number") {
      fields.push("open_incidents_count = ?");
      values.push(updates.open_incidents_count);
    }
    if (typeof updates.critical_incidents_count === "number") {
      fields.push("critical_incidents_count = ?");
      values.push(updates.critical_incidents_count);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "last_check_duration_ms")) {
      fields.push("last_check_duration_ms = ?");
      values.push(updates.last_check_duration_ms ?? null);
    }

    values.push(websiteId);
    await pool.query(
      `
        UPDATE website_health_summary
        SET ${fields.join(", ")}
        WHERE website_id = ?
      `,
      values,
    );

    return getWebsiteHealthSummary(websiteId);
  } catch (error) {
    console.error("[db] Error updating website health summary:", error);
    return null;
  }
}

export async function getWebsiteHealthSummary(websiteId: string): Promise<WebsiteHealthSummaryRow | null> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM website_health_summary
        WHERE website_id = ?
        LIMIT 1
      `,
      [websiteId],
    );

    return mapWebsiteHealthSummary(((rows as WebsiteHealthSummaryDbRow[])[0] || null));
  } catch (error) {
    console.error("[db] Error fetching website health summary:", error);
    return null;
  }
}

export async function recordServerHealth(
  serverId: string,
  status: ServerHealthRow["status"],
  metrics: Partial<ServerHealthRow> = {},
): Promise<ServerHealthRow | null> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    const existing = await getServerHealth(serverId);

    if (!existing) {
      const id = randomUUID();
      await pool.query(
        `
          INSERT INTO server_health (
            id, server_id, status, cpu_percentage, memory_percentage, disk_percentage,
            active_deployments, error_rate, last_heartbeat
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          id,
          serverId,
          status,
          metrics.cpu_percentage ?? null,
          metrics.memory_percentage ?? null,
          metrics.disk_percentage ?? null,
          metrics.active_deployments ?? null,
          metrics.error_rate ?? null,
          metrics.last_heartbeat || new Date().toISOString(),
        ],
      );
    } else {
      await pool.query(
        `
          UPDATE server_health
          SET status = ?,
              cpu_percentage = ?,
              memory_percentage = ?,
              disk_percentage = ?,
              active_deployments = ?,
              error_rate = ?,
              last_heartbeat = ?,
              updated_at = NOW()
          WHERE server_id = ?
        `,
        [
          status,
          metrics.cpu_percentage ?? existing.cpu_percentage,
          metrics.memory_percentage ?? existing.memory_percentage,
          metrics.disk_percentage ?? existing.disk_percentage,
          metrics.active_deployments ?? existing.active_deployments,
          metrics.error_rate ?? existing.error_rate,
          metrics.last_heartbeat || new Date().toISOString(),
          serverId,
        ],
      );
    }

    return getServerHealth(serverId);
  } catch (error) {
    console.error("[db] Error recording server health:", error);
    return null;
  }
}

export async function getServerHealth(serverId: string): Promise<ServerHealthRow | null> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query("SELECT * FROM server_health WHERE server_id = ? LIMIT 1", [
      serverId,
    ]);
    return mapServerHealth(((rows as ServerHealthDbRow[])[0] || null));
  } catch (error) {
    console.error("[db] Error fetching server health:", error);
    return null;
  }
}

export async function getAllServerHealth(): Promise<ServerHealthRow[]> {
  try {
    await ensureMonitoringSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query("SELECT * FROM server_health ORDER BY updated_at DESC");
    return (rows as ServerHealthDbRow[])
      .map((row) => mapServerHealth(row))
      .filter(Boolean) as ServerHealthRow[];
  } catch (error) {
    console.error("[db] Error fetching all server health:", error);
    return [];
  }
}
