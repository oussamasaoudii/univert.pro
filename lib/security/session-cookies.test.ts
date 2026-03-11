import test from "node:test";
import assert from "node:assert/strict";
import { getAdminMfaChallengeCookieOptions } from "@/lib/auth/admin-mfa-challenge";
import { getLocalAdminCookieOptions } from "@/lib/local-admin-auth";
import { getUserSessionCookieOptions } from "@/lib/mysql/session";

test("session cookies use secure flags in production", () => {
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  try {
    const userCookie = getUserSessionCookieOptions();
    const localAdminCookie = getLocalAdminCookieOptions();
    const adminChallengeCookie = getAdminMfaChallengeCookieOptions();

    assert.equal(userCookie.httpOnly, true);
    assert.equal(userCookie.sameSite, "lax");
    assert.equal(userCookie.secure, true);

    assert.equal(localAdminCookie.httpOnly, true);
    assert.equal(localAdminCookie.sameSite, "strict");
    assert.equal(localAdminCookie.secure, true);

    assert.equal(adminChallengeCookie.httpOnly, true);
    assert.equal(adminChallengeCookie.sameSite, "strict");
    assert.equal(adminChallengeCookie.secure, true);
  } finally {
    process.env.NODE_ENV = previousEnv;
  }
});
