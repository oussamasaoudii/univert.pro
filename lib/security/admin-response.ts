import type {
  QueueJobRecord,
  ServerRecord,
  WebhookConfigRecord,
} from "@/lib/mysql/operations";
import type {
  SupportTicketMessageRecord,
  SupportTicketRecord,
} from "@/lib/mysql/support";
import { maskSecret } from "@/lib/security/crypto";

const SECRET_TEXT_PATTERNS: RegExp[] = [
  /\b(Bearer\s+)[A-Za-z0-9._\-+/=]+/gi,
  /\b(token|secret|password|api[_-]?key|authorization|cookie)=([^&\s]+)/gi,
  /\b(token|secret|password|api[_-]?key|authorization|cookie)\s*:\s*([^\s,;]+)/gi,
];

export function sanitizeDiagnosticText(
  value: string | null | undefined,
  maxLength: number = 220,
): string | null {
  if (!value) {
    return null;
  }

  let sanitized = value;
  for (const pattern of SECRET_TEXT_PATTERNS) {
    sanitized = sanitized.replace(pattern, (_match, prefixOrKey, rawValue) => {
      if (typeof rawValue === "string") {
        return `${prefixOrKey}${maskSecret(rawValue)}`;
      }
      return `${prefixOrKey}[REDACTED]`;
    });
  }

  sanitized = sanitized.replace(/\s+/g, " ").trim();
  if (sanitized.length <= maxLength) {
    return sanitized;
  }

  return `${sanitized.slice(0, maxLength - 1)}…`;
}

export function maskWebhookUrl(
  value: string | null | undefined,
): string {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    const origin = `${url.protocol}//${url.host}`;
    const path =
      url.pathname && url.pathname !== "/"
        ? `${url.pathname.slice(0, 10)}${url.pathname.length > 10 ? "…" : ""}`
        : "";
    const query = url.search ? "?••••" : "";
    return `${origin}${path}${query}`;
  } catch {
    return maskSecret(value);
  }
}

export function isMaskedWebhookUrl(value: string | undefined): boolean {
  return typeof value === "string" && value.includes("•");
}

export function sanitizeWebhookConfigForClient(
  webhook: WebhookConfigRecord,
): WebhookConfigRecord & { hasUrl: boolean } {
  return {
    ...webhook,
    url: webhook.url ? maskWebhookUrl(webhook.url) : null,
    hasUrl: Boolean(webhook.url),
  };
}

export function sanitizeQueueJobForAdmin(job: QueueJobRecord & {
  latestLog?: string | null;
  latestLogLevel?: string | null;
}) {
  return {
    ...job,
    error: sanitizeDiagnosticText(job.error),
    latestLog: sanitizeDiagnosticText(job.latestLog),
  };
}

export function sanitizeServerSummaryForAdmin(server: ServerRecord) {
  return {
    id: server.id,
    name: server.name,
    region: server.region,
    provider: server.provider,
    status: server.status,
    cpuUsage: server.cpuUsage,
    ramUsage: server.ramUsage,
    diskUsage: server.diskUsage,
    websitesCount: server.websitesCount,
    lastSyncAt: server.lastSyncAt,
    provisioningEnabled: server.provisioningEnabled,
    createdAt: server.createdAt,
    updatedAt: server.updatedAt,
  };
}

export function sanitizeSupportTicketSummaryForAdmin(ticket: SupportTicketRecord) {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    userEmail: ticket.userEmail,
    userName: ticket.userName,
    subject: ticket.subject,
    description: ticket.description,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    assignedAdminEmail: ticket.assignedAdminEmail,
    responsesCount: ticket.responsesCount,
    lastReplyAt: ticket.lastReplyAt,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

export function sanitizeSupportTicketMessageForAdmin(
  message: SupportTicketMessageRecord,
) {
  return {
    id: message.id,
    ticketId: message.ticketId,
    senderRole: message.senderRole,
    message: message.message,
    createdAt: message.createdAt,
  };
}
