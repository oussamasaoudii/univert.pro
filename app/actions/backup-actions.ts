// User Backup and Export Actions
// Server actions for user-facing backup, export, and restore workflows

'use server';

import { getAuthenticatedRequestUser } from '@/lib/api-auth';
import {
  getWebsiteBackups,
  getBackup,
  getWebsiteExports,
  getExport,
  getWebsiteRestores,
  getRestore,
  getRestoreLogs,
  createBackup,
  createExport,
  createRestore,
} from '@/lib/db/backups';
import { BackupLifecycle } from '@/lib/backup/backup-lifecycle';
import { ExportEngine } from '@/lib/backup/export-engine';
import { RestoreEngine } from '@/lib/backup/restore-engine';
import { RetentionPolicy } from '@/lib/backup/retention-policy';
import { enqueueBackupJob, enqueueRestoreJob } from '@/lib/queue/queue-manager';
import { getWebsiteById } from '@/lib/db/websites';
import type { BackupRow, ExportRow, RestoreRow } from '@/lib/db/types';

/**
 * Get website backups
 */
export async function getWebsiteBackupsAction(websiteId: string) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const website = await getWebsiteById(websiteId);

    if (!website || website.user_id !== user.id) {
      return { error: 'Website not found' };
    }

    const backups = await getWebsiteBackups(websiteId);
    return { success: true, backups };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error fetching backups';
    return { error: msg };
  }
}

/**
 * Create manual backup
 */
export async function createManualBackupAction(websiteId: string) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Check retention policy
    const canCreate = await RetentionPolicy.canCreateManualBackup(user.id);
    if (!canCreate) {
      return { error: 'Your plan does not allow manual backups' };
    }

    const hasReachedLimit = await RetentionPolicy.hasReachedBackupLimit(
      user.id,
      websiteId
    );

    if (hasReachedLimit) {
      return { error: 'You have reached the maximum number of backups for your plan' };
    }

    // Create backup record
    const backup = await createBackup(websiteId, user.id, 'manual', 30);

    if (!backup) {
      return { error: 'Failed to create backup record' };
    }

    // Enqueue backup job
    const queueJobId = await enqueueBackupJob(backup.id, websiteId, user.id, 'manual');

    if (!queueJobId) {
      return { error: 'Failed to queue backup job' };
    }

    return { success: true, backup };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error creating backup';
    return { error: msg };
  }
}

/**
 * Get website exports
 */
export async function getWebsiteExportsAction(websiteId: string) {
  try {
    const exports = await getWebsiteExports(websiteId);
    return { success: true, exports };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error fetching exports';
    return { error: msg };
  }
}

/**
 * Create website export
 */
export async function createExportAction(
  websiteId: string,
  exportType: ExportRow['export_type']
) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Check retention policy
    const canExport = await RetentionPolicy.canCreateExport(user.id);
    if (!canExport) {
      return { error: 'Your plan does not allow website exports' };
    }

    // Create export record
    const export_record = await createExport(
      websiteId,
      user.id,
      null,
      exportType,
      'zip'
    );

    if (!export_record) {
      return { error: 'Failed to create export record' };
    }

    // Enqueue export job
    const queueJobId = await enqueueBackupJob(
      export_record.id,
      websiteId,
      user.id,
      'export'
    );

    if (!queueJobId) {
      return { error: 'Failed to queue export job' };
    }

    return { success: true, export: export_record };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error creating export';
    return { error: msg };
  }
}

/**
 * Get export download info
 */
export async function getExportDownloadAction(exportId: string) {
  try {
    const export_record = await getExport(exportId);

    if (!export_record) {
      return { error: 'Export not found' };
    }

    const status = ExportEngine.getExportStatus(export_record);

    if (!status.isReady) {
      return {
        error: 'Export is not ready for download',
        status: export_record.status,
      };
    }

    return {
      success: true,
      downloadUrl: status.downloadUrl,
      expiresIn: status.expiresIn,
      size: export_record.size_bytes,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error fetching export';
    return { error: msg };
  }
}

/**
 * Get website restores
 */
export async function getWebsiteRestoresAction(websiteId: string) {
  try {
    const restores = await getWebsiteRestores(websiteId);
    return { success: true, restores };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error fetching restores';
    return { error: msg };
  }
}

/**
 * Initiate restore from backup
 */
export async function initiateRestoreAction(
  backupId: string,
  websiteId: string,
  restoreType: RestoreRow['restore_type']
) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const backup = await getBackup(backupId);
    if (!backup || backup.website_id !== websiteId || backup.user_id !== user.id) {
      return { error: 'Backup not found' };
    }

    // Create restore record
    const restore = await createRestore(backupId, websiteId, user.id, restoreType);

    if (!restore) {
      return { error: 'Failed to create restore record' };
    }

    // Enqueue restore job
    const queueJobId = await enqueueRestoreJob(restore.id, backupId, websiteId, user.id);

    if (!queueJobId) {
      return { error: 'Failed to queue restore job' };
    }

    return { success: true, restore };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error initiating restore';
    return { error: msg };
  }
}

/**
 * Get restore progress
 */
export async function getRestoreProgressAction(restoreId: string) {
  try {
    const restore = await getRestore(restoreId);
    if (!restore) {
      return { error: 'Restore not found' };
    }

    const progress = await RestoreEngine.getRestoreProgress(restoreId);
    const logs = await getRestoreLogs(restoreId, 20);

    return {
      success: true,
      restore,
      progress,
      logs,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error fetching restore progress';
    return { error: msg };
  }
}

/**
 * Get backup retention info
 */
export async function getBackupRetentionInfoAction(websiteId: string) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const info = await RetentionPolicy.getBackupRetentionInfo(user.id, websiteId);
    const canCreateManual = await RetentionPolicy.canCreateManualBackup(user.id);
    const canCreatePreDeploy = await RetentionPolicy.canCreatePreDeployBackup(user.id);
    const canCreateExport = await RetentionPolicy.canCreateExport(user.id);

    return {
      success: true,
      retentionInfo: info,
      capabilities: {
        canCreateManual,
        canCreatePreDeploy,
        canCreateExport,
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error fetching retention info';
    return { error: msg };
  }
}
