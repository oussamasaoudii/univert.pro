import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { createSignedJwt, verifySignedJwt } from "./jwt.ts";

test("createSignedJwt produces a verifiable HS256 token", () => {
  const token = createSignedJwt(
    {
      sub: "user-1",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 60,
    },
    "secret",
  );

  const verified = verifySignedJwt<{ sub: string; role: string; exp: number }>(token, "secret");

  assert.ok(verified);
  assert.equal(verified?.sub, "user-1");
  assert.equal(verified?.role, "admin");
});

test("verifySignedJwt accepts the legacy two-part session token format during migration", () => {
  const payload = Buffer.from(
    JSON.stringify({
      sub: "legacy-user",
      exp: Math.floor(Date.now() / 1000) + 60,
    }),
  ).toString("base64url");

  const signature = crypto.createHmac("sha256", "secret").update(payload).digest("base64url");
  const token = `${payload}.${signature}`;

  const verified = verifySignedJwt<{ sub: string; exp: number }>(token, "secret");
  assert.ok(verified);
  assert.equal(verified?.sub, "legacy-user");
});
