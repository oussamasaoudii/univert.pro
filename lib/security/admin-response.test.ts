import test from "node:test";
import assert from "node:assert/strict";
import {
  maskWebhookUrl,
  sanitizeDiagnosticText,
  sanitizeQueueJobForAdmin,
  sanitizeServerSummaryForAdmin,
  sanitizeSupportTicketMessageForAdmin,
  sanitizeSupportTicketSummaryForAdmin,
} from "./admin-response.ts";

test("maskWebhookUrl preserves origin while masking path and query detail", () => {
  const masked = maskWebhookUrl("https://hooks.example.com/very/secret/path?token=value");

  assert.match(masked, /^https:\/\/hooks\.example\.com/);
  assert.match(masked, /\?••••$/);
  assert.equal(masked.includes("token=value"), false);
});

test("sanitizeDiagnosticText redacts obvious credentials", () => {
  const sanitized = sanitizeDiagnosticText(
    "Bearer super-secret-token api_key=abcdef password: hunter2",
  );

  assert.ok(sanitized);
  assert.equal(sanitized?.includes("super-secret-token"), false);
  assert.equal(sanitized?.includes("abcdef"), false);
  assert.equal(sanitized?.includes("hunter2"), false);
});

test("sanitizeQueueJobForAdmin redacts queue diagnostics", () => {
  const sanitized = sanitizeQueueJobForAdmin({
    id: "job-1",
    website: "demo",
    status: "failed",
    progress: 20,
    step: "deploy",
    server: "srv-1",
    created: "2026-03-09T00:00:00Z",
    eta: null,
    error: "token=abc123",
    retries: 1,
    latestLog: "Bearer internal-secret",
    latestLogLevel: "error",
  });

  assert.equal(sanitized.error?.includes("abc123"), false);
  assert.equal(sanitized.latestLog?.includes("internal-secret"), false);
});

test("sanitizeServerSummaryForAdmin strips direct infrastructure identifiers from list payloads", () => {
  const sanitized = sanitizeServerSummaryForAdmin({
    id: "srv-ab12cd34",
    name: "Primary",
    region: "eu-west-1",
    provider: "Hetzner",
    ipAddress: "72.60.90.147",
    operatingSystem: "Ubuntu 24.04",
    stackSupport: ["Next.js", "Laravel"],
    status: "healthy",
    cpuUsage: 10,
    ramUsage: 20,
    diskUsage: 30,
    websitesCount: 4,
    lastSyncAt: "2026-03-09T00:00:00Z",
    provisioningEnabled: true,
    createdAt: "2026-03-08T00:00:00Z",
    updatedAt: "2026-03-09T00:00:00Z",
  });

  assert.deepEqual(Object.keys(sanitized).sort(), [
    "cpuUsage",
    "createdAt",
    "diskUsage",
    "id",
    "lastSyncAt",
    "name",
    "provider",
    "provisioningEnabled",
    "ramUsage",
    "region",
    "status",
    "updatedAt",
    "websitesCount",
  ]);
});

test("support ticket sanitizers remove user ids from admin payloads", () => {
  const ticket = sanitizeSupportTicketSummaryForAdmin({
    id: "ticket-1",
    ticketNumber: "TKT-123",
    userId: "user-1",
    userEmail: "user@example.com",
    userName: "User One",
    subject: "Need help",
    description: "Ticket body",
    category: "technical",
    priority: "high",
    status: "open",
    assignedAdminId: "admin-1",
    assignedAdminEmail: "admin@example.com",
    responsesCount: 1,
    lastReplyAt: null,
    createdAt: "2026-03-09T00:00:00Z",
    updatedAt: "2026-03-09T00:00:00Z",
  });
  const message = sanitizeSupportTicketMessageForAdmin({
    id: "msg-1",
    ticketId: "ticket-1",
    senderUserId: "admin-1",
    senderRole: "admin",
    message: "Working on it",
    createdAt: "2026-03-09T00:00:00Z",
  });

  assert.equal("userId" in ticket, false);
  assert.equal("assignedAdminId" in ticket, false);
  assert.equal("senderUserId" in message, false);
});
