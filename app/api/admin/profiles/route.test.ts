import test from "node:test";
import assert from "node:assert/strict";
import { parseJsonBody } from "@/lib/security/request";
import { handleAdminProfilesPost } from "./route";

test("handleAdminProfilesPost rejects invalid schema with a safe 400 response and audit event", async () => {
  const auditCalls: Array<Record<string, unknown>> = [];

  const response = await handleAdminProfilesPost(
    new Request("https://univert.pro/api/admin/profiles", {
      method: "POST",
      headers: {
        origin: "https://univert.pro",
      },
      body: JSON.stringify({
        name: 123,
        status: "active",
      }),
    }),
    {
      createProvisioningProfile: async () => {
        throw new Error("profile creation should not run");
      },
      listProvisioningProfiles: async () => [],
      parseJsonBody,
      requireAdminRouteAccess: async () =>
        ({
          adminUser: { id: "admin-1" },
          ipAddress: "203.0.113.10",
          userAgent: "test-agent",
        }) as any,
      securityAuditLog: async (_request, input) => {
        auditCalls.push(input as unknown as Record<string, unknown>);
      },
    },
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "invalid_request_body",
    code: "VALIDATION_ERROR",
  });
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0]?.action, "security.invalid_schema_rejected");
  assert.equal(auditCalls[0]?.actorId, "admin-1");
  assert.equal(auditCalls[0]?.resourceId, "/api/admin/profiles");
});
