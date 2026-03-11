import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOtpAuthUri,
  createTotpCode,
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCode,
  isRecoveryCodeFormat,
  normalizeRecoveryCodeForDisplay,
  verifyTotpCode,
} from "./totp.ts";

test("verifyTotpCode accepts a freshly generated authenticator code", () => {
  const secret = generateTotpSecret();
  const now = Date.now();
  const code = createTotpCode(secret, now);

  assert.equal(verifyTotpCode(secret, code, { timeMs: now }), true);
});

test("verifyTotpCode accepts adjacent time windows and rejects stale codes outside the window", () => {
  const secret = generateTotpSecret();
  const baseTime = new Date("2026-03-09T05:00:00.000Z").getTime();
  const code = createTotpCode(secret, baseTime);

  assert.equal(verifyTotpCode(secret, code, { timeMs: baseTime + 30_000 }), true);
  assert.equal(verifyTotpCode(secret, code, { timeMs: baseTime + 90_000 }), false);
});

test("recovery codes are unique, normalized, and hashed deterministically", () => {
  const recoveryCodes = generateRecoveryCodes(10);

  assert.equal(new Set(recoveryCodes).size, recoveryCodes.length);
  for (const recoveryCode of recoveryCodes) {
    assert.equal(isRecoveryCodeFormat(recoveryCode), true);
  }

  const normalized = normalizeRecoveryCodeForDisplay(recoveryCodes[0]!.toLowerCase().replace("-", ""));
  assert.equal(normalized.length >= 10, true);
  assert.equal(
    hashRecoveryCode(recoveryCodes[0]!, "pepper-value"),
    hashRecoveryCode(normalized, "pepper-value"),
  );
});

test("buildOtpAuthUri includes issuer, label, and secret", () => {
  const uri = buildOtpAuthUri({
    secret: "JBSWY3DPEHPK3PXP",
    issuer: "Univert Admin",
    accountName: "admin@univert.pro",
  });

  assert.match(uri, /^otpauth:\/\/totp\//);
  assert.match(uri, /issuer=Univert\+Admin/);
  assert.match(uri, /secret=JBSWY3DPEHPK3PXP/);
});
