import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { parseSearchParams } from "./admin-api.ts";

test("parseSearchParams rejects duplicate query parameters", () => {
  const request = new Request(
    "https://univert.pro/api/admin/tickets?status=open&status=closed",
  );

  assert.throws(
    () =>
      parseSearchParams(
        request,
        z
          .object({
            status: z.string().optional(),
          })
          .strict(),
      ),
    {
      message: "duplicate_query_parameter",
    },
  );
});

test("parseSearchParams coerces and validates expected query values", () => {
  const request = new Request(
    "https://univert.pro/api/admin/tickets?status=open&limit=25",
  );

  const parsed = parseSearchParams(
    request,
    z
      .object({
        status: z.enum(["open", "closed"]).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
      })
      .strict(),
  );

  assert.equal(parsed.status, "open");
  assert.equal(parsed.limit, 25);
});

test("parseSearchParams records an audit event for duplicate query parameters", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];
  const request = new Request(
    "https://univert.pro/api/admin/tickets?status=open&status=closed",
  );

  assert.throws(
    () =>
      parseSearchParams(
        request,
        z
          .object({
            status: z.string().optional(),
          })
          .strict(),
        {
          actorId: "admin-1",
          actorType: "admin",
          resourceId: "/api/admin/tickets",
          auditLog: async (_auditRequest, input) => {
            auditCalls.push(input as unknown as Record<string, unknown>);
          },
        },
      ),
    {
      message: "duplicate_query_parameter",
    },
  );

  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.action, "security.invalid_schema_rejected");
  assert.equal(auditCalls[0]?.resourceId, "/api/admin/tickets");
});
