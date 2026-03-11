import { z } from "zod";
import {
  createDeploymentRule,
  createScheduledJob,
  deleteDeploymentRule,
  deleteScheduledJob,
  getAutomationSnapshot,
  getWebhookConfig,
  updateDeploymentRule,
  updateScheduledJob,
  updateWebhookConfig,
  type JobStatus,
} from "@/lib/mysql/operations";
import { createAdminNotification } from "@/lib/mysql/platform";
import {
  adminJson,
  parseSearchParams,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";
import {
  assertTrustedOrigin,
  parseJsonBody,
} from "@/lib/security/request";
import {
  isMaskedWebhookUrl,
  sanitizeWebhookConfigForClient,
} from "@/lib/security/admin-response";
import { ValidationError } from "@/lib/utils/errors";

const VALID_JOB_STATUSES: JobStatus[] = [
  "pending",
  "running",
  "completed",
  "failed",
];
const JOB_STATUS_ENUM_VALUES = VALID_JOB_STATUSES as [JobStatus, ...JobStatus[]];

const webhookUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .superRefine((value, ctx) => {
    if (!value) {
      return;
    }

    if (isMaskedWebhookUrl(value)) {
      return;
    }

    try {
      const url = new URL(value);
      const isLoopbackHost =
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname === "::1";
      const isHttps = url.protocol === "https:";
      const isLocalHttp = isLoopbackHost && url.protocol === "http:";
      if (!isHttps && !isLocalHttp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "webhook_url_must_use_https",
        });
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "invalid_webhook_url",
      });
    }
  });

const ruleCreateSchema = z
  .object({
    entity: z.literal("rule"),
    name: z.string().trim().min(1).max(191),
    condition: z.string().trim().min(1).max(1000),
    action: z.string().trim().min(1).max(1000),
    enabled: z.boolean().optional(),
    priority: z.number().int().min(1).max(100).optional(),
  })
  .strict();

const jobCreateSchema = z
  .object({
    entity: z.literal("job"),
    name: z.string().trim().min(1).max(191),
    schedule: z.string().trim().min(1).max(191),
    type: z.string().trim().min(1).max(80),
    status: z.enum(JOB_STATUS_ENUM_VALUES).optional(),
    enabled: z.boolean().optional(),
  })
  .strict();

const rulePatchSchema = z
  .object({
    entity: z.literal("rule"),
    id: z.string().uuid(),
    name: z.string().trim().min(1).max(191).optional(),
    condition: z.string().trim().min(1).max(1000).optional(),
    action: z.string().trim().min(1).max(1000).optional(),
    enabled: z.boolean().optional(),
    priority: z.number().int().min(1).max(100).optional(),
  })
  .strict();

const jobPatchSchema = z
  .object({
    entity: z.literal("job"),
    id: z.string().uuid(),
    name: z.string().trim().min(1).max(191).optional(),
    schedule: z.string().trim().min(1).max(191).optional(),
    type: z.string().trim().min(1).max(80).optional(),
    status: z.enum(JOB_STATUS_ENUM_VALUES).optional(),
    enabled: z.boolean().optional(),
  })
  .strict();

const webhookPatchSchema = z
  .object({
    entity: z.literal("webhook"),
    url: webhookUrlSchema.nullable().optional(),
    events: z.array(z.string().trim().min(1).max(80)).max(10).optional(),
    enabled: z.boolean().optional(),
  })
  .strict();

const deleteQuerySchema = z
  .object({
    entity: z.enum(["rule", "job"]),
    id: z.string().uuid(),
  })
  .strict();

export async function GET(request: Request) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-alerts-read",
      limit: 50,
    });

    const snapshot = await getAutomationSnapshot();
    return adminJson({
      rules: snapshot.rules,
      jobs: snapshot.jobs,
      webhook: sanitizeWebhookConfigForClient(snapshot.webhook),
    });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.alerts.read" });
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const { adminUser } = await requireAdminRouteAccess(request, {
      scope: "admin-alerts-write",
      limit: 20,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });

    const rawBody = await request.clone().json().catch(() => ({}));
    const entity = typeof rawBody.entity === "string" ? rawBody.entity : "";

    if (entity === "rule") {
      const body = await parseJsonBody(request, ruleCreateSchema, { maxBytes: 16 * 1024 });
      const rule = await createDeploymentRule({
        name: body.name,
        condition: body.condition,
        action: body.action,
        enabled: body.enabled !== false,
        priority: body.priority,
      });

      await createAdminNotification(
        {
          title: "Deployment rule created",
          message: `${adminUser.email} created rule "${rule.name}".`,
          category: "admin.alerts",
        },
        {
          excludeAdminIds: [adminUser.id],
        },
      );

      return adminJson({ ok: true, rule }, { status: 201 });
    }

    if (entity === "job") {
      const body = await parseJsonBody(request, jobCreateSchema, { maxBytes: 16 * 1024 });
      const job = await createScheduledJob({
        name: body.name,
        schedule: body.schedule,
        type: body.type,
        status: body.status,
        enabled: body.enabled !== false,
      });

      await createAdminNotification(
        {
          title: "Scheduled job created",
          message: `${adminUser.email} created job "${job.name}".`,
          category: "admin.alerts",
        },
        {
          excludeAdminIds: [adminUser.id],
        },
      );

      return adminJson({ ok: true, job }, { status: 201 });
    }

    throw new ValidationError("invalid_entity");
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.alerts.create" });
  }
}

export async function PATCH(request: Request) {
  try {
    assertTrustedOrigin(request);
    const { adminUser } = await requireAdminRouteAccess(request, {
      scope: "admin-alerts-write",
      limit: 20,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });

    const rawBody = await request.clone().json().catch(() => ({}));
    const entity = typeof rawBody.entity === "string" ? rawBody.entity : "";

    if (entity === "rule") {
      const body = await parseJsonBody(request, rulePatchSchema, { maxBytes: 16 * 1024 });
      const updates = {
        name: body.name,
        condition: body.condition,
        action: body.action,
        enabled: body.enabled,
        priority: body.priority,
      };

      if (Object.values(updates).every((value) => value === undefined)) {
        throw new ValidationError("no_updates");
      }

      const rule = await updateDeploymentRule(body.id, updates);
      if (!rule) {
        return adminJson({ error: "not_found" }, { status: 404 });
      }

      await createAdminNotification(
        {
          title: "Deployment rule updated",
          message: `${adminUser.email} updated rule "${rule.name}".`,
          category: "admin.alerts",
        },
        {
          excludeAdminIds: [adminUser.id],
        },
      );

      return adminJson({ ok: true, rule });
    }

    if (entity === "job") {
      const body = await parseJsonBody(request, jobPatchSchema, { maxBytes: 16 * 1024 });
      const updates = {
        name: body.name,
        schedule: body.schedule,
        type: body.type,
        status: body.status,
        enabled: body.enabled,
      };

      if (Object.values(updates).every((value) => value === undefined)) {
        throw new ValidationError("no_updates");
      }

      const job = await updateScheduledJob(body.id, updates);
      if (!job) {
        return adminJson({ error: "not_found" }, { status: 404 });
      }

      await createAdminNotification(
        {
          title: "Scheduled job updated",
          message: `${adminUser.email} updated job "${job.name}".`,
          category: "admin.alerts",
        },
        {
          excludeAdminIds: [adminUser.id],
        },
      );

      return adminJson({ ok: true, job });
    }

    if (entity === "webhook") {
      const body = await parseJsonBody(request, webhookPatchSchema, { maxBytes: 16 * 1024 });
      const currentWebhook = await getWebhookConfig();

      const nextUrl =
        typeof body.url === "string" && isMaskedWebhookUrl(body.url)
          ? currentWebhook.url
          : body.url === undefined
            ? undefined
            : body.url;

      const webhook = await updateWebhookConfig({
        url: nextUrl,
        events: body.events,
        enabled: body.enabled,
      });

      await createAdminNotification(
        {
          title: "Webhook updated",
          message: `${adminUser.email} updated the alerts webhook configuration.`,
          category: "admin.alerts",
        },
        {
          excludeAdminIds: [adminUser.id],
        },
      );

      return adminJson({
        ok: true,
        webhook: sanitizeWebhookConfigForClient(webhook),
      });
    }

    throw new ValidationError("invalid_entity");
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.alerts.update" });
  }
}

export async function DELETE(request: Request) {
  try {
    assertTrustedOrigin(request);
    const { adminUser } = await requireAdminRouteAccess(request, {
      scope: "admin-alerts-write",
      limit: 20,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    });

    const query = parseSearchParams(request, deleteQuerySchema);
    const deleted =
      query.entity === "rule"
        ? await deleteDeploymentRule(query.id)
        : await deleteScheduledJob(query.id);

    if (!deleted) {
      return adminJson({ error: "not_found" }, { status: 404 });
    }

    await createAdminNotification(
      {
        title:
          query.entity === "rule"
            ? "Deployment rule deleted"
            : "Scheduled job deleted",
        message: `${adminUser.email} deleted a ${query.entity}.`,
        category: "admin.alerts",
      },
      {
        excludeAdminIds: [adminUser.id],
      },
    );

    return adminJson({ ok: true });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.alerts.delete" });
  }
}
