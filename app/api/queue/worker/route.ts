import { z } from "zod";
import { NextResponse } from "next/server";
import { getAdminRequestUser } from "@/lib/api-auth";
import { runWorkerLoop, processNextJob } from "@/lib/queue/queue-manager";
import type { JobType } from "@/lib/queue/data-access";
import {
  queueSecurityRequestAuditLog,
  type SecurityAuditLogger,
} from "@/lib/security/audit";
import {
  enforceRouteRateLimit,
  getRequestIp,
  hasValidInternalBearer,
  parseJsonBody,
  toApiErrorResponse,
} from "@/lib/security/request";

function generateWorkerId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `worker-${timestamp}-${random}`;
}

const workerSchema = z
  .object({
    jobTypes: z
      .array(
        z.enum([
          "provisioning",
          "deployment_retry",
          "status_poll",
          "post_deploy",
          "cleanup",
          "notification",
        ]),
      )
      .max(6)
      .optional(),
    maxIterations: z.number().int().min(1).max(25).optional(),
    mode: z.enum(["single", "batch"]).optional(),
  })
  .strict();

type QueueWorkerRouteDeps = {
  enforceRouteRateLimit: typeof enforceRouteRateLimit;
  getAdminRequestUser: typeof getAdminRequestUser;
  hasValidInternalBearer: typeof hasValidInternalBearer;
  parseJsonBody: typeof parseJsonBody;
  processNextJob: typeof processNextJob;
  runWorkerLoop: typeof runWorkerLoop;
  securityAuditLog: SecurityAuditLogger;
};

const queueWorkerRouteDeps: QueueWorkerRouteDeps = {
  enforceRouteRateLimit,
  getAdminRequestUser,
  hasValidInternalBearer,
  parseJsonBody,
  processNextJob,
  runWorkerLoop,
  securityAuditLog: queueSecurityRequestAuditLog,
};

export async function handleQueueWorkerPost(
  request: Request,
  deps: QueueWorkerRouteDeps = queueWorkerRouteDeps,
) {
  const ipAddress = getRequestIp(request);
  if (!deps.hasValidInternalBearer(request)) {
    await Promise.resolve(
      deps.securityAuditLog(request, {
        action: "security.internal_api_unauthorized",
        resourceId: "/api/queue/worker",
        changes: {
          access: "write",
        },
      }),
    );
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const workerId = generateWorkerId();

  try {
    await deps.enforceRouteRateLimit({
      scope: "internal-queue-worker",
      key: ipAddress,
      limit: 30,
      windowMs: 5 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    });

    const body = await deps.parseJsonBody(request, workerSchema, {
      maxBytes: 8 * 1024,
      audit: {
        resourceId: "/api/queue/worker",
        log: deps.securityAuditLog,
      },
    });
    const jobTypes = (body.jobTypes || [
      "provisioning",
      "deployment_retry",
      "status_poll",
      "post_deploy",
    ]) as JobType[];
    const maxIterations = body.maxIterations ?? 10;
    const mode = body.mode ?? "batch";

    if (mode === "single") {
      const result = await deps.processNextJob(workerId, jobTypes);
      return NextResponse.json({
        workerId,
        mode: "single",
        ...result,
      });
    }

    const result = await deps.runWorkerLoop(workerId, {
      jobTypes,
      maxIterations,
      pollIntervalMs: 500,
      idleTimeoutMs: 5000,
    });

    return NextResponse.json({
      workerId,
      mode: "batch",
      ...result,
    });
  } catch (error) {
    const response = toApiErrorResponse(error, { action: "queue.worker", workerId });
    const payload = await response.json().catch(() => ({ error: "internal_error" }));

    return NextResponse.json(
      {
        ...payload,
        workerId,
      },
      { status: response.status },
    );
  }
}

export async function handleQueueWorkerGet(
  request: Request,
  deps: QueueWorkerRouteDeps = queueWorkerRouteDeps,
) {
  if (deps.hasValidInternalBearer(request)) {
    return NextResponse.json({
      status: "ready",
      timestamp: new Date().toISOString(),
    });
  }

  const adminUser = await deps.getAdminRequestUser();
  if (!adminUser) {
    await Promise.resolve(
      deps.securityAuditLog(request, {
        action: "security.internal_api_unauthorized",
        resourceId: "/api/queue/worker",
        changes: {
          access: "read",
        },
      }),
    );
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    status: "ready",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  return handleQueueWorkerPost(request);
}

export async function GET(request: Request) {
  return handleQueueWorkerGet(request);
}
