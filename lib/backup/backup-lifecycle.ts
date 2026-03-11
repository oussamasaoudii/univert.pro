// Backup Lifecycle State Machine
// Manages transitions between backup states and enforces valid state flows

import type { BackupRow } from '@/lib/db/types';
import { 
  updateBackupStatus, 
  logBackupAction, 
  markBackupCompleted, 
  markBackupFailed 
} from '@/lib/db/backups';

type BackupStatus = BackupRow['status'];

const VALID_TRANSITIONS: Record<BackupStatus, BackupStatus[]> = {
  'pending': ['running', 'failed', 'deleted'],
  'running': ['completed', 'failed'],
  'completed': ['expired', 'deleted'],
  'failed': ['pending', 'deleted'], // Allow retry
  'expired': ['deleted'],
  'deleted': [],
};

export class BackupLifecycle {
  /**
   * Validate if status transition is allowed
   */
  static canTransition(from: BackupStatus, to: BackupStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  /**
   * Start backup execution
   */
  static async startBackup(
    backup: BackupRow,
    userId: string
  ): Promise<BackupRow | null> {
    if (!this.canTransition(backup.status, 'running')) {
      console.error(`[backup] Invalid transition: ${backup.status} -> running`);
      return null;
    }

    const updated = await updateBackupStatus(backup.id, 'running', {
      started_at: new Date().toISOString(),
    });

    if (updated) {
      await logBackupAction(
        backup.id,
        backup.website_id,
        userId,
        'started',
        backup.status,
        'running',
        { timestamp: new Date().toISOString() }
      );
    }

    return updated;
  }

  /**
   * Mark backup as successfully completed
   */
  static async completeBackup(
    backupId: string,
    websiteId: string,
    userId: string,
    sizeBytes: number,
    storageLocation: string
  ): Promise<BackupRow | null> {
    const updated = await markBackupCompleted(backupId, sizeBytes, storageLocation);

    if (updated) {
      await logBackupAction(
        backupId,
        websiteId,
        userId,
        'completed',
        'running',
        'completed',
        {
          size_bytes: sizeBytes,
          storage_location: storageLocation,
          timestamp: new Date().toISOString(),
        }
      );
    }

    return updated;
  }

  /**
   * Mark backup as failed
   */
  static async failBackup(
    backupId: string,
    websiteId: string,
    userId: string,
    errorMessage: string
  ): Promise<BackupRow | null> {
    const updated = await markBackupFailed(backupId, errorMessage);

    if (updated) {
      await logBackupAction(
        backupId,
        websiteId,
        userId,
        'failed',
        'running',
        'failed',
        {
          error_message: errorMessage,
          timestamp: new Date().toISOString(),
        }
      );
    }

    return updated;
  }

  /**
   * Mark backup as expired
   */
  static async expireBackup(
    backupId: string,
    websiteId: string,
    userId: string
  ): Promise<BackupRow | null> {
    const updated = await updateBackupStatus(backupId, 'expired');

    if (updated) {
      await logBackupAction(
        backupId,
        websiteId,
        userId,
        'expired',
        'completed',
        'expired',
        { timestamp: new Date().toISOString() }
      );
    }

    return updated;
  }

  /**
   * Delete backup
   */
  static async deleteBackup(
    backupId: string,
    websiteId: string,
    userId: string,
    reason: string = 'user_request'
  ): Promise<BackupRow | null> {
    const updated = await updateBackupStatus(backupId, 'deleted', {
      deleted_at: new Date().toISOString(),
      deletion_reason: reason,
    });

    if (updated) {
      await logBackupAction(
        backupId,
        websiteId,
        userId,
        'deleted',
        'deleted',
        'deleted',
        { reason, timestamp: new Date().toISOString() }
      );
    }

    return updated;
  }

  /**
   * Get backup progress info
   */
  static getProgress(backup: BackupRow): {
    status: BackupStatus;
    percentage: number;
    message: string;
    isComplete: boolean;
    isFailed: boolean;
  } {
    const progressMap: Record<BackupStatus, number> = {
      'pending': 0,
      'running': 50,
      'completed': 100,
      'failed': 0,
      'expired': 100,
      'deleted': 100,
    };

    const messageMap: Record<BackupStatus, string> = {
      'pending': 'Backup queued and waiting to start',
      'running': 'Backup in progress',
      'completed': 'Backup completed successfully',
      'failed': 'Backup failed',
      'expired': 'Backup has expired and will be deleted',
      'deleted': 'Backup deleted',
    };

    return {
      status: backup.status,
      percentage: progressMap[backup.status],
      message: messageMap[backup.status],
      isComplete: backup.status === 'completed',
      isFailed: backup.status === 'failed',
    };
  }
}
