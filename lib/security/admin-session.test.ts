import test from "node:test";
import assert from "node:assert/strict";
import { AuthorizationError } from "@/lib/utils/errors";
import { assertRecentAdminStepUp, hasRecentStepUp } from "./admin-session.ts";

test("hasRecentStepUp accepts a recent verification timestamp", () => {
  const verifiedAt = new Date(Date.now() - 60_000).toISOString();
  assert.equal(hasRecentStepUp(verifiedAt, 5 * 60 * 1000), true);
});

test("hasRecentStepUp rejects stale or invalid timestamps", () => {
  assert.equal(hasRecentStepUp(new Date(Date.now() - 20 * 60_000).toISOString(), 5 * 60 * 1000), false);
  assert.equal(hasRecentStepUp("not-a-date", 5 * 60 * 1000), false);
  assert.equal(hasRecentStepUp(null, 5 * 60 * 1000), false);
});

test("assertRecentAdminStepUp throws step_up_required for stale admin sessions", () => {
  assert.throws(
    () => assertRecentAdminStepUp(new Date(Date.now() - 20 * 60_000).toISOString(), 5 * 60 * 1000),
    (error: unknown) => {
      assert.equal(error instanceof AuthorizationError, true);
      assert.equal((error as AuthorizationError).message, "step_up_required");
      return true;
    },
  );
});
