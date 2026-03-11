import { z } from "zod";
import {
  createBackup,
  listBackups,
  updateBackupStatus,
  type BackupStatus,
  type BackupType,
} from "@/lib/mysql/operations";
import {
  adminJson,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";
import {
  assertTrustedOrigin,
  parseJsonBody,
} from "@/lib/security/request";

const VALID_BACKUP_STATUSES: BackupStatus[] = ["completed", "pending", "failed"];
const VALID_BACKUP_TYPES: BackupType[] = ["full", "incremental"];

const createBackupSchema = z
  .object({
    website: z.string().trim().min(1).max(191),
    server: z.string().trim().min(1).max(191),
    type: z.enum(VALID_BACKUP_TYPES).optional(),
  })
  .strict();

const updateBackupSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    status: z.enum(VALID_BACKUP_STATUSES),
  })
  .strict();

export async function GET(request: Request) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-backups-read",
      limit: 40,
    });

    const backups = await listBackups();
    return adminJson({ backups });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.backups.read" });
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    await requireAdminRouteAccess(request, {
      scope: "admin-backups-write",
      limit: 12,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });

    const body = await parseJsonBody(request, createBackupSchema, { maxBytes: 8 * 1024 });
    const backup = await createBackup(body);
    return adminJson({ ok: true, backup }, { status: 201 });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.backups.create" });
  }
}

export async function PATCH(request: Request) {
  try {
    assertTrustedOrigin(request);
    await requireAdminRouteAccess(request, {
      scope: "admin-backups-write",
      limit: 20,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });

    const body = await parseJsonBody(request, updateBackupSchema, { maxBytes: 8 * 1024 });
    const backup = await updateBackupStatus(body.id, body.status);
    if (!backup) {
      return adminJson({ error: "not_found" }, { status: 404 });
    }

    return adminJson({ ok: true, backup });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.backups.update" });
  }
}
