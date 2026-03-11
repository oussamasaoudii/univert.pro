// Real-time Provisioning Status Hook
// Polls provisioning job status and logs via API route

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ProvisioningJobRow } from '@/lib/db/types';
import type { JobLogEntry } from '@/lib/provisioning/types';

interface ProvisioningStatus {
  job: ProvisioningJobRow | null;
  logs: JobLogEntry[];
  isLoading: boolean;
  error: string | null;
  isComplete: boolean;
  isFailed: boolean;
  lastUpdate: Date | null;
  queueStatus: {
    id: string;
    status: string;
    attemptCount: number;
    maxAttempts: number;
  } | null;
}

/**
 * Hook for real-time provisioning status updates
 * Polls API route at configurable interval until job completes
 */
export function useProvisioningStatus(
  jobId: string | null,
  pollIntervalMs: number = 2000
): ProvisioningStatus {
  const [status, setStatus] = useState<ProvisioningStatus>({
    job: null,
    logs: [],
    isLoading: false,
    error: null,
    isComplete: false,
    isFailed: false,
    lastUpdate: null,
    queueStatus: null,
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));

      // Call API route instead of server action for real-time updates
      const response = await fetch(`/api/provisioning/${jobId}`);
      const result = await response.json();

      if (!isMountedRef.current) return;

      if (!response.ok || result.error) {
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Failed to fetch status',
        }));
        return;
      }

      const isComplete = result.job?.status === 'completed';
      const isFailed = result.job?.status === 'failed' || result.job?.status === 'canceled';

      setStatus(prev => ({
        ...prev,
        job: result.job as ProvisioningJobRow,
        logs: result.logs || [],
        isLoading: false,
        isComplete,
        isFailed,
        lastUpdate: new Date(),
        queueStatus: result.queue,
      }));

      // Stop polling once job is complete or failed
      if (isComplete || isFailed) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    } catch (error) {
      if (!isMountedRef.current) return;

      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch provisioning status';
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [jobId]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!jobId) return;

    // Fetch immediately
    fetchStatus();

    // Setup polling
    pollIntervalRef.current = setInterval(fetchStatus, pollIntervalMs);

    return () => {
      isMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [jobId, pollIntervalMs, fetchStatus]);

  return status;
}

/**
 * Hook for real-time log streaming
 * Separates logs into categories for filtering
 */
export function useProvisioningLogs(logs: JobLogEntry[]) {
  const [filteredLogs, setFilteredLogs] = useState<JobLogEntry[]>(logs);
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');

  useEffect(() => {
    if (filterLevel === 'all') {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter(log => log.level === filterLevel));
    }
  }, [logs, filterLevel]);

  const getLogStats = useCallback(() => {
    return {
      total: logs.length,
      info: logs.filter(l => l.level === 'info').length,
      warning: logs.filter(l => l.level === 'warning').length,
      error: logs.filter(l => l.level === 'error').length,
      success: logs.filter(l => l.level === 'success').length,
    };
  }, [logs]);

  return {
    logs: filteredLogs,
    filterLevel,
    setFilterLevel,
    stats: getLogStats(),
  };
}

/**
 * Hook for progress bar animation
 */
export function useProvisioningProgress(currentProgress: number, isComplete: boolean) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    // Smooth progress animation
    if (currentProgress > displayProgress) {
      const timer = setTimeout(() => {
        setDisplayProgress(prev => Math.min(prev + 1, currentProgress));
      }, 50);
      return () => clearTimeout(timer);
    }

    if (isComplete && displayProgress < 100) {
      setDisplayProgress(100);
    }
  }, [currentProgress, displayProgress, isComplete]);

  return displayProgress;
}
