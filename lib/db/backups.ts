import { randomUUID } from "node:crypto";
import { getMySQLPool } from "@/lib/mysql/pool";
import { ensureBackupSchema } from "@/lib/mysql/legacy-schema";
import type {
  BackupLogRow,
  BackupRow,
  ExportRow,
  RestoreLogRow,
  RestoreRow,
} from "./types";

type BackupDbRow = Omit<BackupRow, "metadata" | "size_bytes"> & {
  metadata: string | null;
  size_bytes: number | string | null;
};

type BackupLogDbRow = Omit<BackupLogRow, "details"> & {
  details: string | null;
};

type ExportDbRow = Omit<ExportRow, "metadata" | "size_bytes" | "download_count"> & {
  metadata: string | null;
  size_bytes: number | string | null;
  download_count: number | string;
};

type RestoreDbRow = Omit<RestoreRow, "metadata"> & {
  metadata: string | null;
};

type RestoreLogDbRow = Omit<RestoreLogRow, "details" | "duration_ms"> & {
  details: string | null;
  duration_ms: number | string | null;
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

function mapBackup(row: BackupDbRow | null): BackupRow | null {
  if (!row) return null;
  return {
    ...row,
    size_bytes: row.size_bytes === null ? null : Number(row.size_bytes),
    metadata: parseJsonRecord(row.metadata),
  };
}

function mapBackupLog(row: BackupLogDbRow): BackupLogRow {
  return {
    ...row,
    details: parseJsonRecord(row.details),
  };
}

function mapExport(row: ExportDbRow | null): ExportRow | null {
  if (!row) return null;
  return {
    ...row,
    size_bytes: row.size_bytes === null ? null : Number(row.size_bytes),
    download_count: Number(row.download_count || 0),
    metadata: parseJsonRecord(row.metadata),
  };
}

function mapRestore(row: RestoreDbRow | null): RestoreRow | null {
  if (!row) return null;
  return {
    ...row,
    metadata: parseJsonRecord(row.metadata),
  };
}

function mapRestoreLog(row: RestoreLogDbRow): RestoreLogRow {
  return {
    ...row,
    duration_ms: row.duration_ms === null ? null : Number(row.duration_ms),
    details: parseJsonRecord(row.details),
  };
}

export async function createBackup(
  websiteId: string,
  userId: string,
  backupType: BackupRow["backup_type"] = "manual",
  retentionDays: number | null = 30,
): Promise<BackupRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const id = randomUUID();
    const expiresAt =
      typeof retentionDays === "number"
        ? new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

    await pool.query(
      `
        INSERT INTO backups (
          id, website_id, user_id, backup_type, status, storage_provider, retention_days, expires_at, metadata
        )
        VALUES (?, ?, ?, ?, 'pending', 'local', ?, ?, ?)
      `,
      [id, websiteId, userId, backupType, retentionDays, expiresAt, JSON.stringify({})],
    );

    return getBackup(id);
  } catch (error) {
    console.error("[db] Error creating backup:", error);
    return null;
  }
}

export async function updateBackupStatus(
  backupId: string,
  status: BackupRow["status"],
): Promise<BackupRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    await pool.query("UPDATE backups SET status = ?, updated_at = NOW() WHERE id = ?", [
      status,
      backupId,
    ]);
    return getBackup(backupId);
  } catch (error) {
    console.error("[db] Error updating backup status:", error);
    return null;
  }
}

export async function getBackup(backupId: string): Promise<BackupRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query("SELECT * FROM backups WHERE id = ? LIMIT 1", [backupId]);
    return mapBackup(((rows as BackupDbRow[])[0] || null));
  } catch (error) {
    console.error("[db] Error fetching backup:", error);
    return null;
  }
}

export async function getWebsiteBackups(
  websiteId: string,
  limit: number = 20,
): Promise<BackupRow[]> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM backups
        WHERE website_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `,
      [websiteId, limit],
    );

    return (rows as BackupDbRow[])
      .map((row) => mapBackup(row))
      .filter(Boolean) as BackupRow[];
  } catch (error) {
    console.error("[db] Error fetching backups:", error);
    return [];
  }
}

export async function markBackupCompleted(
  backupId: string,
  storageLocation: string,
  sizeBytes: number,
): Promise<BackupRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE backups
        SET status = 'completed',
            storage_location = ?,
            size_bytes = ?,
            updated_at = NOW()
        WHERE id = ?
      `,
      [storageLocation, sizeBytes, backupId],
    );

    return getBackup(backupId);
  } catch (error) {
    console.error("[db] Error marking backup completed:", error);
    return null;
  }
}

export async function markBackupFailed(backupId: string, errorMessage: string): Promise<BackupRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE backups
        SET status = 'failed',
            error_message = ?,
            updated_at = NOW()
        WHERE id = ?
      `,
      [errorMessage, backupId],
    );

    return getBackup(backupId);
  } catch (error) {
    console.error("[db] Error marking backup failed:", error);
    return null;
  }
}

export async function logBackupAction(
  backupId: string,
  websiteId: string,
  userId: string,
  action: string,
  oldStatus: string | null = null,
  newStatus: string | null = null,
  details: Record<string, any> = {},
): Promise<BackupLogRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const id = randomUUID();
    await pool.query(
      `
        INSERT INTO backup_logs (
          id, backup_id, website_id, user_id, action, old_status, new_status, details
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [id, backupId, websiteId, userId, action, oldStatus, newStatus, JSON.stringify(details)],
    );

    return {
      id,
      backup_id: backupId,
      website_id: websiteId,
      user_id: userId,
      action,
      old_status: oldStatus,
      new_status: newStatus,
      details,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[db] Error logging backup action:", error);
    return null;
  }
}

export async function getBackupLogs(backupId: string, limit: number = 100): Promise<BackupLogRow[]> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM backup_logs
        WHERE backup_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `,
      [backupId, limit],
    );

    return (rows as BackupLogDbRow[]).map(mapBackupLog);
  } catch (error) {
    console.error("[db] Error fetching backup logs:", error);
    return [];
  }
}

export async function createExport(
  websiteId: string,
  userId: string,
  backupId: string | null,
  exportType: ExportRow["export_type"],
  format: string,
): Promise<ExportRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const id = randomUUID();
    await pool.query(
      `
        INSERT INTO exports (
          id, backup_id, website_id, user_id, export_type, status, format, metadata
        )
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
      `,
      [id, backupId, websiteId, userId, exportType, format, JSON.stringify({})],
    );

    return getExport(id);
  } catch (error) {
    console.error("[db] Error creating export:", error);
    return null;
  }
}

export async function markExportCompleted(
  exportId: string,
  downloadUrl: string,
  sizeBytes: number,
  expiresAt: string,
): Promise<ExportRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE exports
        SET status = 'completed',
            download_url = ?,
            size_bytes = ?,
            download_expires_at = ?,
            updated_at = NOW()
        WHERE id = ?
      `,
      [downloadUrl, sizeBytes, expiresAt, exportId],
    );

    return getExport(exportId);
  } catch (error) {
    console.error("[db] Error marking export completed:", error);
    return null;
  }
}

export async function getWebsiteExports(websiteId: string, limit: number = 20): Promise<ExportRow[]> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM exports
        WHERE website_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `,
      [websiteId, limit],
    );

    return (rows as ExportDbRow[])
      .map((row) => mapExport(row))
      .filter(Boolean) as ExportRow[];
  } catch (error) {
    console.error("[db] Error fetching exports:", error);
    return [];
  }
}

export async function recordExportDownload(exportId: string): Promise<ExportRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE exports
        SET download_count = download_count + 1,
            last_downloaded_at = NOW(),
            updated_at = NOW()
        WHERE id = ?
      `,
      [exportId],
    );

    return getExport(exportId);
  } catch (error) {
    console.error("[db] Error recording export download:", error);
    return null;
  }
}

export async function getExport(exportId: string): Promise<ExportRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query("SELECT * FROM exports WHERE id = ? LIMIT 1", [exportId]);
    return mapExport(((rows as ExportDbRow[])[0] || null));
  } catch (error) {
    console.error("[db] Error fetching export:", error);
    return null;
  }
}

export async function createRestore(
  backupId: string,
  websiteId: string,
  userId: string,
  restoreType: RestoreRow["restore_type"],
): Promise<RestoreRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const id = randomUUID();
    await pool.query(
      `
        INSERT INTO restores (
          id, backup_id, website_id, user_id, restore_type, status, metadata
        )
        VALUES (?, ?, ?, ?, ?, 'pending', ?)
      `,
      [id, backupId, websiteId, userId, restoreType, JSON.stringify({})],
    );

    return getRestore(id);
  } catch (error) {
    console.error("[db] Error creating restore:", error);
    return null;
  }
}

export async function updateRestoreStatus(
  restoreId: string,
  status: RestoreRow["status"],
  updates?: Partial<RestoreRow>,
): Promise<RestoreRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const fields: string[] = ["status = ?", "updated_at = NOW()"];
    const values: Array<string | number | null> = [status];

    if (Object.prototype.hasOwnProperty.call(updates || {}, "restoration_job_id")) {
      fields.push("restoration_job_id = ?");
      values.push(updates?.restoration_job_id ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates || {}, "restore_started_at")) {
      fields.push("restore_started_at = ?");
      values.push(updates?.restore_started_at ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates || {}, "restore_completed_at")) {
      fields.push("restore_completed_at = ?");
      values.push(updates?.restore_completed_at ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates || {}, "metadata")) {
      fields.push("metadata = ?");
      values.push(JSON.stringify(updates?.metadata || {}));
    }
    if (Object.prototype.hasOwnProperty.call(updates || {}, "error_message")) {
      fields.push("error_message = ?");
      values.push(updates?.error_message ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(updates || {}, "rollback_notes")) {
      fields.push("rollback_notes = ?");
      values.push(updates?.rollback_notes ?? null);
    }

    values.push(restoreId);
    await pool.query(
      `
        UPDATE restores
        SET ${fields.join(", ")}
        WHERE id = ?
      `,
      values,
    );

    return getRestore(restoreId);
  } catch (error) {
    console.error("[db] Error updating restore status:", error);
    return null;
  }
}

export async function getRestore(restoreId: string): Promise<RestoreRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query("SELECT * FROM restores WHERE id = ? LIMIT 1", [restoreId]);
    return mapRestore(((rows as RestoreDbRow[])[0] || null));
  } catch (error) {
    console.error("[db] Error fetching restore:", error);
    return null;
  }
}

export async function getWebsiteRestores(websiteId: string, limit: number = 20): Promise<RestoreRow[]> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM restores
        WHERE website_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `,
      [websiteId, limit],
    );

    return (rows as RestoreDbRow[])
      .map((row) => mapRestore(row))
      .filter(Boolean) as RestoreRow[];
  } catch (error) {
    console.error("[db] Error fetching restores:", error);
    return [];
  }
}

export async function logRestoreStep(
  restoreId: string,
  websiteId: string,
  userId: string,
  step: string,
  status: string,
  details: Record<string, any> = {},
  durationMs: number | null = null,
  errorMessage: string | null = null,
): Promise<RestoreLogRow | null> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const id = randomUUID();
    await pool.query(
      `
        INSERT INTO restore_logs (
          id, restore_id, website_id, user_id, step, status, duration_ms, details, error_message
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [id, restoreId, websiteId, userId, step, status, durationMs, JSON.stringify(details), errorMessage],
    );

    return {
      id,
      restore_id: restoreId,
      website_id: websiteId,
      user_id: userId,
      step,
      status,
      duration_ms: durationMs,
      details,
      error_message: errorMessage,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[db] Error logging restore step:", error);
    return null;
  }
}

export async function getRestoreLogs(restoreId: string, limit: number = 100): Promise<RestoreLogRow[]> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT *
        FROM restore_logs
        WHERE restore_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `,
      [restoreId, limit],
    );

    return (rows as RestoreLogDbRow[]).map(mapRestoreLog);
  } catch (error) {
    console.error("[db] Error fetching restore logs:", error);
    return [];
  }
}

export async function deleteExpiredBackups(daysOld: number = 30): Promise<number> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const [result] = await pool.query(
      `
        DELETE FROM backups
        WHERE status IN ('completed', 'expired', 'deleted')
          AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `,
      [daysOld],
    );

    return Number((result as { affectedRows?: number }).affectedRows || 0);
  } catch (error) {
    console.error("[db] Error deleting expired backups:", error);
    return 0;
  }
}

export async function deleteExpiredExports(daysOld: number = 7): Promise<number> {
  try {
    await ensureBackupSchema();
    const pool = getMySQLPool();
    const [result] = await pool.query(
      `
        DELETE FROM exports
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
          AND status IN ('completed', 'expired', 'failed')
      `,
      [daysOld],
    );

    return Number((result as { affectedRows?: number }).affectedRows || 0);
  } catch (error) {
    console.error("[db] Error deleting expired exports:", error);
    return 0;
  }
}
