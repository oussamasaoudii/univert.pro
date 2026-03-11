'use client';

import { useEffect, useState } from 'react';

export type DnsPropagationResolverResult = {
  name: string;
  location: string;
  ip: string;
  status: 'resolved' | 'failed';
  result: string;
  matchesExpected: boolean | null;
};

export type DnsPropagationSnapshot = {
  domain: string;
  recordType: string;
  expectedValue: string | null;
  expectedAnswers: string[];
  results: DnsPropagationResolverResult[];
  propagationPercentage: number;
  resolvedCount: number;
  matchedCount: number;
  mismatchedCount: number;
  failedCount: number;
};

type UseDnsPropagationInput = {
  domain?: string | null;
  recordType?: string;
  expectedValue?: string | null;
  enabled?: boolean;
  pollIntervalMs?: number;
};

export function useDnsPropagation({
  domain,
  recordType = 'A',
  expectedValue,
  enabled = true,
  pollIntervalMs = 30000,
}: UseDnsPropagationInput) {
  const [snapshot, setSnapshot] = useState<DnsPropagationSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedDomain = domain?.trim().toLowerCase() || '';
  const normalizedRecordType = recordType.trim().toUpperCase();
  const normalizedExpectedValue = expectedValue?.trim() || '';

  async function loadSnapshot(silent = false) {
    if (!enabled || !normalizedDomain) {
      setSnapshot(null);
      setError(null);
      return null;
    }

    if (!silent) {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        domain: normalizedDomain,
        recordType: normalizedRecordType,
      });

      if (normalizedExpectedValue) {
        params.set('expectedValue', normalizedExpectedValue);
      }

      const response = await fetch(`/api/dashboard/domains/dns-check?${params.toString()}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_dns_propagation'));
      }

      setSnapshot(result as DnsPropagationSnapshot);
      setError(null);
      return result as DnsPropagationSnapshot;
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'failed_to_load_dns_propagation');
      return null;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadSnapshot(false);
  }, [normalizedDomain, normalizedRecordType, normalizedExpectedValue, enabled]);

  useEffect(() => {
    if (!enabled || !normalizedDomain || pollIntervalMs <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      void loadSnapshot(true);
    }, pollIntervalMs);

    return () => window.clearInterval(timer);
  }, [normalizedDomain, normalizedRecordType, normalizedExpectedValue, enabled, pollIntervalMs]);

  return {
    snapshot,
    loading,
    error,
    refresh: () => loadSnapshot(false),
  };
}
