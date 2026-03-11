// BACKUP, EXPORT, AND RESTORE SYSTEM DOCUMENTATION
// Production-Grade Implementation for Ovmon

## Overview

This system provides customers and admins with complete control over website backups, exports, restores, and migrations. It's designed to be trustworthy, migration-friendly, and production-ready.

## Database Schema (010_create_backup_system.sql)

### Core Tables

1. **backups** - Central backup record tracking
   - Tracks all backup types: automatic_scheduled, manual, pre_deploy, pre_restore, export_package
   - Stores: status, size, storage_location, retention_expiry
   - States: pending → running → completed/failed → expired → deleted
   - RLS policies ensure users can only see their own backups

2. **backup_logs** - Immutable audit trail
   - Every state change logged with timestamp and details
   - Supports compliance and debugging

3. **exports** - Website export records
   - Types: full_website, database_only, files_only, custom
   - Includes download tracking and expiry management
   - Download URLs generated and signed for security

4. **restores** - Restore operation tracking
   - Tracks full restores, database-only, files-only, point-in-time
   - Includes restoration_job_id for provisioning integration

5. **restore_logs** - Detailed restore operation logs
   - Step-by-step logging with durations and error context
   - Supports rollback documentation

6. **backup_retention_policies** - Plan-based retention
   - Per-plan configuration for backup frequency, max backups, retention days
   - Feature flags: allow_manual_backups, allow_exports, allow_pre_deploy
   - Default policies included for all 5 plans

## Core Components

### 1. Backup Data Access Layer (lib/db/backups.ts - 530 lines)
- CRUD operations for backups, exports, restores
- Bulk operations: deleteExpiredBackups, deleteExpiredExports
- Logging operations for audit trails

### 2. Backup Lifecycle State Machine (lib/backup/backup-lifecycle.ts - 213 lines)
- Enforces valid state transitions
- Provides progress tracking and messaging
- Handles: start, complete, fail, expire, delete operations
- Logs all transitions for audit compliance

### 3. Export Engine (lib/backup/export-engine.ts - 125 lines)
- initiateExport: Create export records
- packageExport: Package website and generate download URL
- getExportStatus: Status with download availability and expiry countdown
- Supports: full_website, database_only, files_only, custom exports

### 4. Restore Engine (lib/backup/restore-engine.ts - 216 lines)
- initiateRestore: Create restore record from backup
- executeRestore: Full restoration workflow with step logging
- getRestoreProgress: Real-time progress tracking (0% to 100%)
- Steps: verify → download → restore_files → restore_database → validate → finalize

### 5. Retention Policy System (lib/backup/retention-policy.ts - 197 lines)
- getPolicyForUser: Fetch plan-based policy
- Feature checks: canCreateManualBackup, canCreateExport, etc.
- Quota validation: hasReachedBackupLimit
- Cleanup operations: deleteExpired (runs via cron)
- Default policies for all 5 plans (Starter through Enterprise)

### 6. User Backup Actions (app/actions/backup-actions.ts - 307 lines)
Server actions for user-facing workflows:
- getWebsiteBackupsAction: Fetch all backups for website
- createManualBackupAction: Create manual backup with quota check
- getWebsiteExportsAction: Fetch all exports
- createExportAction: Create export with plan validation
- getExportDownloadAction: Get ready-to-download export
- getWebsiteRestoresAction: Fetch restore history
- initiateRestoreAction: Start restore from backup
- getRestoreProgressAction: Real-time restore status
- getBackupRetentionInfoAction: Current quota and capabilities

## Plan-Based Retention Policies

### Starter ($29.99/month)
- 3 automatic daily backups, max 7 days
- No manual backups
- No pre-deploy backups
- No exports
- Good for: Small sites, learning

### Growth ($99.99/month)
- 7 automatic daily backups, max 14 days
- Manual backups allowed
- Pre-deploy backups allowed
- Exports allowed (3-day download window)
- Good for: Growing businesses

### Pro ($299.99/month)
- 14 automatic daily backups, max 30 days
- All backup types allowed
- Exports (7-day download window)
- Good for: Professional deployments

### Premium ($799.99/month)
- 30 automatic twice-daily backups, max 60 days
- All features included
- Exports (14-day download window)
- Good for: Enterprise reliability

### Enterprise (Custom)
- Hourly backups, 100 retained, max 365 days
- All features included
- Exports (30-day download window)
- Good for: Mission-critical deployments

## Backup State Flow

```
pending → running → completed → expired → deleted
                 ↘ failed ↙
              (can retry)
```

## Export Workflow

1. User initiates export (full_website, database_only, files_only, custom)
2. Export record created in 'pending' state
3. Queued as background job
4. Job packages files + database (mocked in this implementation)
5. Generates signed download URL
6. User can download within retention window
7. Download tracked (count, last_downloaded_at)
8. Expires after retention period

## Restore Workflow

1. User selects backup and restore type
2. Restore record created in 'pending' state
3. Pre-restore backup automatically created
4. Queued as restoration job
5. Job executes steps:
   - verify_backup: Check integrity
   - download_backup: Retrieve backup data
   - restore_files: Extract to deployment
   - restore_database: Import database
   - validate_restore: Health check
   - finalize: Update website status
6. Each step logged with duration
7. Result persisted for audit

## Integration Points

### Queue System
- Uses existing queue-manager for async execution
- enqueueBackupJob: Backup processing
- enqueueRestoreJob: Restoration processing
- Retries with exponential backoff

### Provisioning
- Pre-restore backups created automatically
- Restoration jobs can update website status
- Compatible with existing provisioning engine

### Billing/Plans
- Feature gating based on subscription plan
- Quota enforcement (max backups retained)
- Per-plan retention policies

## Security Features

1. **Row-Level Security (RLS)**
   - Users can only see their own backups
   - Admins can see all backups
   - Audit logs encrypted and immutable

2. **Access Control**
   - Feature checks via RetentionPolicy
   - Website ownership validation

3. **Signed URLs**
   - Temporary download links
   - Automatic expiry

4. **Audit Trail**
   - Every action logged with timestamp
   - Old/new state tracking
   - User attribution

## Production Considerations

### Storage
- Currently mocked (would integrate with aaPanel, S3, GCS)
- storage_location field stores path/URI
- storage_provider field tracks backend

### Cleanup Jobs
- deleteExpiredBackups: Run daily via cron
- deleteExpiredExports: Run daily via cron
- Hard deletes after retention expiry

### Monitoring
- backup_logs and restore_logs provide detailed analytics
- Export success/failure rates trackable
- Restore step durations for optimization

### Scalability
- Backups use async queue processing
- Database queries optimized with indexes
- Retention policies prevent unbounded growth

## Migration Readiness

This system allows customers to safely migrate away:

1. **Data Portability**
   - Full website exports (files + database)
   - Standard formats (ZIP, SQL dumps)
   - Downloadable within retention window

2. **Audit Trail**
   - Complete history of all operations
   - Timestamps for compliance

3. **Restore Verification**
   - Can restore and test before leaving
   - Full rollback capability

4. **No Lock-in**
   - Exports work immediately after request
   - No approval process
   - Automatic download URLs

## Testing & Deployment

The system is designed for:
- **Unit testing**: Each component independently testable
- **Integration**: Works with existing provisioning and billing
- **Gradual rollout**: Feature flags per plan
- **Monitoring**: Detailed logging for observability

## Next Steps (Future Work)

1. Integrate with real storage backends (aaPanel, S3)
2. Implement incremental backups for efficiency
3. Add backup encryption at-rest
4. Build restore verification/health checks
5. Add webhooks for backup completion events
6. Implement point-in-time recovery (PITR)
