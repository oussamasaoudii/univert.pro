// User monitoring actions for health dashboards

'use server';

import { getAuthenticatedRequestUser } from '@/lib/api-auth';
import { getWebsiteById } from '@/lib/db/websites';
import {
  acknowledgeAlert,
  getAlertsByWebsite,
  getLatestHealthChecks,
  getUserUnacknowledgedAlerts as getUnacknowledgedAlerts,
  getWebsiteHealthSummary,
  getWebsiteIncidents,
} from '@/lib/db/monitoring';
import type { WebsiteHealthSummaryRow, IncidentRow, HealthCheckRow, AlertRow } from '@/lib/db/types';

export async function getUserWebsiteHealth(websiteId: string): Promise<WebsiteHealthSummaryRow | null> {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const website = await getWebsiteById(websiteId);
    if (!website || website.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    // Get health summary
    const healthSummary = await getWebsiteHealthSummary(websiteId);
    return healthSummary;
  } catch (error) {
    console.error('[user-monitoring] Error fetching website health:', error);
    throw error;
  }
}

export async function getUserWebsiteHealthDetails(websiteId: string): Promise<{
  healthSummary: WebsiteHealthSummaryRow | null;
  recentIncidents: IncidentRow[];
  recentAlerts: AlertRow[];
  recentHealthChecks: HealthCheckRow[];
}> {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const website = await getWebsiteById(websiteId);
    if (!website || website.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    const healthSummary = await getWebsiteHealthSummary(websiteId);
    const recentIncidents = await getWebsiteIncidents(websiteId, undefined, 10);
    const recentAlerts = await getAlertsByWebsite(websiteId, 10);

    const recentHealthChecks = await getLatestHealthChecks(websiteId, 10);

    return {
      healthSummary,
      recentIncidents,
      recentAlerts,
      recentHealthChecks,
    };
  } catch (error) {
    console.error('[user-monitoring] Error fetching website health details:', error);
    throw error;
  }
}

export async function getUserUnacknowledgedAlerts(): Promise<AlertRow[]> {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    return await getUnacknowledgedAlerts(user.id);
  } catch (error) {
    console.error('[user-monitoring] Error fetching unacknowledged alerts:', error);
    throw error;
  }
}

export async function acknowledgeUserAlert(alertId: string): Promise<boolean> {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const alerts = await getUnacknowledgedAlerts(user.id);
    const alert = alerts.find((item) => item.id === alertId);
    if (!alert) {
      throw new Error('Unauthorized');
    }

    return Boolean(await acknowledgeAlert(alertId, user.id));
  } catch (error) {
    console.error('[user-monitoring] Error acknowledging alert:', error);
    throw error;
  }
}

export async function getWebsiteHealthTrend(
  websiteId: string,
  hoursBack: number = 24
): Promise<{
  timestamp: string;
  status: string;
  responseTimeMs: number | null;
}[]> {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const website = await getWebsiteById(websiteId);
    if (!website || website.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    const checks = await getLatestHealthChecks(websiteId, Math.max(10, hoursBack * 6));
    const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;

    return checks
      .filter((check) => check.check_type === 'website_reachability')
      .filter((check) => new Date(check.checked_at).getTime() >= cutoff)
      .sort((left, right) => new Date(left.checked_at).getTime() - new Date(right.checked_at).getTime())
      .map((check) => ({
        timestamp: check.checked_at,
        status: check.status,
        responseTimeMs: check.response_time_ms,
      }));
  } catch (error) {
    console.error('[user-monitoring] Error fetching health trend:', error);
    throw error;
  }
}
