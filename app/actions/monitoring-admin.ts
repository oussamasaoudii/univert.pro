// Admin monitoring actions for dashboard

'use server';

import { getAdminRequestUser } from '@/lib/api-auth';
import { getWebsiteById } from '@/lib/db/websites';
import {
  getAlertsByWebsite,
  getAllServerHealth,
  getLatestHealthChecks,
  getUserUnacknowledgedAlerts,
  getWebsiteHealthSummary,
  getWebsiteIncidents,
} from '@/lib/db/monitoring';
import { listWebsitesForAdmin } from '@/lib/mysql/platform';
import type { IncidentRow, AlertRow, HealthCheckRow, ServerHealthRow } from '@/lib/db/types';

export async function getAdminMonitoringDashboard(): Promise<{
  totalWebsites: number;
  healthyWebsites: number;
  degradedWebsites: number;
  criticalWebsites: number;
  openIncidents: number;
  unacknowledgedAlerts: number;
  serverHealth: ServerHealthRow[];
}> {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      throw new Error('Not authenticated');
    }

    const websites = await listWebsitesForAdmin();
    const healthSummaries = await Promise.all(
      websites.map((website) => getWebsiteHealthSummary(website.id)),
    );
    const incidents = (await Promise.all(
      websites.map((website) => getWebsiteIncidents(website.id, 'open', 50)),
    )).flat();
    const alerts = (await Promise.all(
      websites.map((website) => getAlertsByWebsite(website.id, 50)),
    ))
      .flat()
      .filter((alert) => !alert.acknowledged_at);

    // Get server health
    const serverHealth = await getAllServerHealth();

    // Calculate statistics
    const summaries = healthSummaries.filter(Boolean);
    const totalWebsites = websites.length;
    const healthyCount = summaries.filter(h => h?.overall_status === 'healthy').length;
    const degradedCount = summaries.filter(h => h?.overall_status === 'degraded').length;
    const criticalCount = summaries.filter(h => h?.overall_status === 'critical').length;

    return {
      totalWebsites,
      healthyWebsites: healthyCount,
      degradedWebsites: degradedCount,
      criticalWebsites: criticalCount,
      openIncidents: incidents?.length || 0,
      unacknowledgedAlerts: alerts?.length || 0,
      serverHealth,
    };
  } catch (error) {
    console.error('[admin-monitoring] Error fetching dashboard data:', error);
    throw error;
  }
}

export async function getIncidentDetails(incidentId: string): Promise<{
  incident: IncidentRow | null;
  relatedAlerts: AlertRow[];
  relatedHealthChecks: HealthCheckRow[];
}> {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      throw new Error('Not authenticated');
    }

    const websites = await listWebsitesForAdmin();
    const incidents = (await Promise.all(
      websites.map((website) => getWebsiteIncidents(website.id, undefined, 100)),
    )).flat();
    const incident = incidents.find((item) => item.id === incidentId) || null;

    if (!incident) {
      return {
        incident: null,
        relatedAlerts: [],
        relatedHealthChecks: [],
      };
    }

    const alerts = (await getAlertsByWebsite(incident.website_id, 100)).filter(
      (alert) => alert.incident_id === incidentId,
    );
    const healthChecks = await getLatestHealthChecks(incident.website_id, 20);

    return {
      incident,
      relatedAlerts: alerts as AlertRow[],
      relatedHealthChecks: healthChecks as HealthCheckRow[],
    };
  } catch (error) {
    console.error('[admin-monitoring] Error fetching incident details:', error);
    throw error;
  }
}

export async function getWebsiteMonitoringStatus(websiteId: string): Promise<{
  incidents: IncidentRow[];
  alerts: AlertRow[];
  recentHealthChecks: HealthCheckRow[];
}> {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      throw new Error('Not authenticated');
    }

    const website = await getWebsiteById(websiteId);
    if (!website) {
      throw new Error('Website not found');
    }

    const incidents = await getWebsiteIncidents(websiteId, 'open');
    const alerts = await getAlertsByWebsite(websiteId);
    const recentHealthChecks = await getLatestHealthChecks(websiteId, 20);

    return {
      incidents,
      alerts,
      recentHealthChecks,
    };
  } catch (error) {
    console.error('[admin-monitoring] Error fetching website monitoring status:', error);
    throw error;
  }
}
