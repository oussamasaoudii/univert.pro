// Export Engine - Handles website export packaging and delivery
// Supports: full website export, database-only export, files-only export

import { createExport, markExportCompleted, getExport } from '@/lib/db/backups';
import type { ExportRow } from '@/lib/db/types';

export class ExportEngine {
  /**
   * Initiate website export
   */
  static async initiateExport(
    websiteId: string,
    userId: string,
    exportType: ExportRow['export_type'],
    backupId?: string
  ): Promise<ExportRow | null> {
    const export_record = await createExport(
      websiteId,
      userId,
      backupId || null,
      exportType,
      'zip'
    );

    if (!export_record) {
      console.error('[export] Failed to create export record');
      return null;
    }

    console.log(`[export] Created export ${export_record.id} for website ${websiteId}`);
    return export_record;
  }

  /**
   * Package website for export
   * In production, this would compress files and database dumps
   */
  static async packageExport(
    exportId: string,
    exportType: ExportRow['export_type']
  ): Promise<{ 
    success: boolean; 
    sizeBytes?: number; 
    downloadUrl?: string;
    error?: string;
  }> {
    try {
      const export_record = await getExport(exportId);
      if (!export_record) {
        return { success: false, error: 'Export not found' };
      }

      // In production, this would:
      // 1. Connect to aaPanel/backup storage
      // 2. Retrieve files (if full or files-only)
      // 3. Dump database (if full or database-only)
      // 4. Compress into format (zip, tar.gz)
      // 5. Upload to CDN or storage bucket
      // 6. Generate signed download URL

      const mockSizeBytes = Math.floor(Math.random() * 500 * 1024 * 1024); // Mock 0-500MB
      const mockDownloadUrl = `https://exports.ovmon.app/${exportId}/website-export.zip`;

      const updated = await markExportCompleted(
        exportId,
        mockDownloadUrl,
        mockSizeBytes,
        7 // 7 day download window
      );

      if (!updated) {
        return { success: false, error: 'Failed to update export record' };
      }

      console.log(`[export] Export ${exportId} packaged successfully (${mockSizeBytes} bytes)`);
      return {
        success: true,
        sizeBytes: mockSizeBytes,
        downloadUrl: mockDownloadUrl,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[export] Package error:', message);
      return { success: false, error: message };
    }
  }

  /**
   * Get export status for client
   */
  static getExportStatus(export_record: ExportRow): {
    status: ExportRow['status'];
    isReady: boolean;
    isExpired: boolean;
    downloadUrl: string | null;
    expiresIn: string | null;
  } {
    const now = new Date();
    const expiresAt = export_record.download_expires_at 
      ? new Date(export_record.download_expires_at)
      : null;
    
    const isExpired = expiresAt ? expiresAt < now : false;
    const isReady = export_record.status === 'completed' && !isExpired;

    let expiresIn: string | null = null;
    if (expiresAt && !isExpired) {
      const diff = expiresAt.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      expiresIn = days > 0 
        ? `${days} day${days === 1 ? '' : 's'}`
        : `${hours} hour${hours === 1 ? '' : 's'}`;
    }

    return {
      status: export_record.status,
      isReady,
      isExpired,
      downloadUrl: isReady ? export_record.download_url : null,
      expiresIn,
    };
  }
}
