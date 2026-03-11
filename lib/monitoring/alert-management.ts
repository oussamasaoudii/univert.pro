// Alert Management and Notification Orchestration

import { createIncident, updateIncidentStatus, createAlert, acknowledgeAlert, getUserUnacknowledgedAlerts } from "@/lib/db/monitoring";
import { getWebsiteIncidents } from "@/lib/db/monitoring";
import {
  createAdminNotification,
  createUserNotification,
} from "@/lib/mysql/platform";
import type { IncidentRow, AlertRow } from "@/lib/db/types";

// ========== Alert State Machine ==========

export type AlertState = 'info' | 'warning' | 'critical' | 'resolved';

export const ALERT_PRIORITY: Record<AlertState, number> = {
  'info': 1,
  'warning': 2,
  'critical': 3,
  'resolved': 0,
};

export const INCIDENT_SEVERITY_TO_ALERT_STATE: Record<string, AlertState> = {
  'info': 'info',
  'warning': 'warning',
  'critical': 'critical',
};

// ========== Incident Management ==========

export async function createAndAlertIncident(
  websiteId: string,
  userId: string,
  incidentType: IncidentRow["incident_type"],
  severity: 'info' | 'warning' | 'critical',
  title: string,
  description: string | null = null,
  affectedResources: Record<string, any> = {}
): Promise<IncidentRow | null> {
  // Create incident
  const incident = await createIncident(
    websiteId,
    userId,
    incidentType,
    severity,
    title,
    description,
    affectedResources
  );

  if (!incident) {
    return null;
  }

  // Create alert automatically
  const alertState = INCIDENT_SEVERITY_TO_ALERT_STATE[severity] || 'warning';
  await createAlert(
    incident.id,
    websiteId,
    userId,
    incidentType,
    alertState,
    title,
    description,
    `/dashboard/websites/${websiteId}/incidents`,
    'View Details'
  );

  await Promise.all([
    createUserNotification(userId, {
      title,
      message: description || "A new monitoring incident requires your attention.",
    }),
    createAdminNotification({
      title: "Monitoring incident triggered",
      message: `${title} (${severity}) for website ${websiteId}.`,
      category: "monitoring.alert_created",
    }),
  ]);

  return incident;
}

export async function resolveIncident(
  incidentId: string,
  resolutionNotes: string
): Promise<IncidentRow | null> {
  const incident = await updateIncidentStatus(incidentId, 'resolved', resolutionNotes);

  if (incident) {
    // Create resolved alert
    await createAlert(
      incidentId,
      incident.website_id,
      incident.user_id,
      incident.incident_type,
      'resolved',
      `${incident.title} - Resolved`,
      resolutionNotes,
      `/dashboard/websites/${incident.website_id}/incidents`,
      'View Incident'
    );

    await Promise.all([
      createUserNotification(incident.user_id, {
        title: `${incident.title} resolved`,
        message: resolutionNotes,
      }),
      createAdminNotification({
        title: "Monitoring incident resolved",
        message: `${incident.title} was resolved for website ${incident.website_id}.`,
        category: "monitoring.alert_resolved",
      }),
    ]);
  }

  return incident;
}

// ========== Alert Acknowledgment ==========

export async function acknowledgeUserAlert(
  alertId: string,
  userId: string
): Promise<AlertRow | null> {
  return acknowledgeAlert(alertId, userId);
}

export async function acknowledgeAllUnacknowledgedAlerts(userId: string): Promise<number> {
  const alerts = await getUserUnacknowledgedAlerts(userId);
  
  let count = 0;
  for (const alert of alerts) {
    const result = await acknowledgeAlert(alert.id, userId);
    if (result) count++;
  }

  return count;
}

// ========== Notification Triggers ==========

export type NotificationTrigger = {
  type: string;
  severity: AlertState;
  shouldNotify: boolean;
  channels: ('in_app' | 'email' | 'webhook')[];
  delayMs?: number;
};

export const NOTIFICATION_TRIGGERS: Record<string, NotificationTrigger> = {
  'provisioning_failed': {
    type: 'provisioning_failed',
    severity: 'critical',
    shouldNotify: true,
    channels: ['in_app', 'email'],
    delayMs: 0,
  },
  'ssl_issuance_failed': {
    type: 'ssl_issuance_failed',
    severity: 'critical',
    shouldNotify: true,
    channels: ['in_app', 'email'],
    delayMs: 300000, // 5 minutes
  },
  'domain_verification_failed': {
    type: 'domain_verification_failed',
    severity: 'critical',
    shouldNotify: true,
    channels: ['in_app', 'email'],
    delayMs: 600000, // 10 minutes
  },
  'website_unreachable': {
    type: 'website_unreachable',
    severity: 'critical',
    shouldNotify: true,
    channels: ['in_app', 'email'],
    delayMs: 60000, // 1 minute (to filter out transient issues)
  },
  'database_unreachable': {
    type: 'database_unreachable',
    severity: 'critical',
    shouldNotify: true,
    channels: ['in_app', 'email'],
    delayMs: 60000, // 1 minute
  },
  'backup_failed': {
    type: 'backup_failed',
    severity: 'warning',
    shouldNotify: true,
    channels: ['in_app', 'email'],
    delayMs: 300000, // 5 minutes
  },
  'restore_failed': {
    type: 'restore_failed',
    severity: 'critical',
    shouldNotify: true,
    channels: ['in_app', 'email'],
    delayMs: 0,
  },
  'export_failed': {
    type: 'export_failed',
    severity: 'warning',
    shouldNotify: true,
    channels: ['in_app', 'email'],
    delayMs: 0,
  },
  'ssl_expiring_soon': {
    type: 'ssl_expiring_soon',
    severity: 'warning',
    shouldNotify: true,
    channels: ['in_app', 'email'],
    delayMs: 0,
  },
};

export async function shouldTriggerNotification(
  incidentType: string,
  websiteId: string
): Promise<boolean> {
  const trigger = NOTIFICATION_TRIGGERS[incidentType];

  if (!trigger || !trigger.shouldNotify) {
    return false;
  }

  // Check if there's already an unresolved incident of this type
  const existingIncidents = await getWebsiteIncidents(websiteId, 'open');
  const hasDuplicateIncident = existingIncidents.some(i => i.incident_type === incidentType);

  // Only notify if this is the first incident of this type
  return !hasDuplicateIncident;
}

export async function getTriggerNotificationDetails(incidentType: string): Promise<NotificationTrigger | null> {
  return NOTIFICATION_TRIGGERS[incidentType] || null;
}

// ========== Batch Alert Operations ==========

export async function resolveOldAlerts(minutesOld: number = 60): Promise<number> {
  // This would be called by a maintenance worker
  // For now, just return 0
  console.log(`[alerts] Checking for alerts older than ${minutesOld} minutes to resolve`);
  return 0;
}

export async function escalateUnacknowledgedAlerts(minutesOld: number = 30): Promise<number> {
  // This would escalate alerts that haven't been acknowledged
  // For now, just return 0
  console.log(`[alerts] Checking for unacknowledged alerts older than ${minutesOld} minutes`);
  return 0;
}
