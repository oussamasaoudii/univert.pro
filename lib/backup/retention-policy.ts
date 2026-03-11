// Retention Policy System - Plan-based backup and export retention management

import { getWebsiteBackups, deleteExpiredBackups, deleteExpiredExports } from '@/lib/db/backups';
import { getSubscription } from '@/lib/db/subscriptions';
import { getPlanById } from '@/lib/db/plans';
import type { BackupRetentionPolicyRow, SubscriptionRow, BillingPlanRow, BackupRow } from '@/lib/db/types';

export class RetentionPolicy {
  /**
   * Get retention policy for user plan
   */
  static async getPolicyForUser(userId: string): Promise<BackupRetentionPolicyRow | null> {
    try {
      const subscription = await getSubscription(userId);
      
      if (!subscription) {
        console.warn('[retention] No subscription found for user');
        return null;
      }

      const plan = await getPlanById(subscription.plan_id);
      const tier = plan?.name || 'starter';
      const defaults = DEFAULT_POLICIES[tier];
      if (!defaults) {
        return null;
      }

      return {
        id: `default-${tier}`,
        plan_id: subscription.plan_id,
        ...defaults,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[retention] Error fetching policy:', error);
      return null;
    }
  }

  /**
   * Check if user can create manual backup
   */
  static async canCreateManualBackup(userId: string): Promise<boolean> {
    const policy = await this.getPolicyForUser(userId);
    return policy?.allow_manual_backups ?? false;
  }

  /**
   * Check if user can create pre-deploy backup
   */
  static async canCreatePreDeployBackup(userId: string): Promise<boolean> {
    const policy = await this.getPolicyForUser(userId);
    return policy?.allow_pre_deploy_backups ?? false;
  }

  /**
   * Check if user can export
   */
  static async canCreateExport(userId: string): Promise<boolean> {
    const policy = await this.getPolicyForUser(userId);
    return policy?.allow_exports ?? false;
  }

  /**
   * Check if user has reached backup limit
   */
  static async hasReachedBackupLimit(userId: string, websiteId: string): Promise<boolean> {
    try {
      const policy = await this.getPolicyForUser(userId);
      if (!policy) return false;

      const backups = await getWebsiteBackups(websiteId);
      const completedBackups = backups.filter(b => b.status === 'completed');
      
      return completedBackups.length >= policy.max_backups_retained;
    } catch (error) {
      console.error('[retention] Error checking backup limit:', error);
      return false;
    }
  }

  /**
   * Get backup retention info
   */
  static async getBackupRetentionInfo(userId: string, websiteId: string): Promise<{
    maxBackupsRetained: number;
    maxBackupAgeDays: number;
    currentBackupCount: number;
    oldestBackupDate: Date | null;
    canAddMore: boolean;
  }> {
    try {
      const policy = await this.getPolicyForUser(userId);
      const backups = await getWebsiteBackups(websiteId);
      const completedBackups = backups.filter(b => b.status === 'completed');

      const oldestBackup = completedBackups[completedBackups.length - 1];
      const oldestDate = oldestBackup ? new Date(oldestBackup.created_at) : null;

      return {
        maxBackupsRetained: policy?.max_backups_retained ?? 7,
        maxBackupAgeDays: policy?.max_backup_age_days ?? 30,
        currentBackupCount: completedBackups.length,
        oldestBackupDate: oldestDate,
        canAddMore: completedBackups.length < (policy?.max_backups_retained ?? 7),
      };
    } catch (error) {
      console.error('[retention] Error getting retention info:', error);
      return {
        maxBackupsRetained: 0,
        maxBackupAgeDays: 0,
        currentBackupCount: 0,
        oldestBackupDate: null,
        canAddMore: false,
      };
    }
  }

  /**
   * Cleanup expired backups (runs via cron)
   */
  static async cleanupExpiredBackups(): Promise<number> {
    try {
      const deletedCount = await deleteExpiredBackups(30); // Delete backups older than 30 days
      console.log(`[retention] Deleted ${deletedCount} expired backups`);
      return deletedCount;
    } catch (error) {
      console.error('[retention] Error cleaning up backups:', error);
      return 0;
    }
  }

  /**
   * Cleanup expired exports (runs via cron)
   */
  static async cleanupExpiredExports(): Promise<number> {
    try {
      const deletedCount = await deleteExpiredExports(7); // Delete exports older than 7 days
      console.log(`[retention] Deleted ${deletedCount} expired exports`);
      return deletedCount;
    } catch (error) {
      console.error('[retention] Error cleaning up exports:', error);
      return 0;
    }
  }
}

// Default retention policies for each plan
export const DEFAULT_POLICIES = {
  starter: {
    backup_frequency: 'daily',
    max_backups_retained: 3,
    max_backup_age_days: 7,
    allow_manual_backups: false,
    allow_pre_deploy_backups: false,
    allow_exports: false,
    export_download_retention_days: 1,
  },
  growth: {
    backup_frequency: 'daily',
    max_backups_retained: 7,
    max_backup_age_days: 14,
    allow_manual_backups: true,
    allow_pre_deploy_backups: true,
    allow_exports: true,
    export_download_retention_days: 3,
  },
  pro: {
    backup_frequency: 'daily',
    max_backups_retained: 14,
    max_backup_age_days: 30,
    allow_manual_backups: true,
    allow_pre_deploy_backups: true,
    allow_exports: true,
    export_download_retention_days: 7,
  },
  premium: {
    backup_frequency: 'twice_daily',
    max_backups_retained: 30,
    max_backup_age_days: 60,
    allow_manual_backups: true,
    allow_pre_deploy_backups: true,
    allow_exports: true,
    export_download_retention_days: 14,
  },
  enterprise: {
    backup_frequency: 'hourly',
    max_backups_retained: 100,
    max_backup_age_days: 365,
    allow_manual_backups: true,
    allow_pre_deploy_backups: true,
    allow_exports: true,
    export_download_retention_days: 30,
  },
} as const;
