import test from "node:test";
import assert from "node:assert/strict";
import { assertStrongPassword, validatePasswordStrength } from "./password-policy.ts";

test("validatePasswordStrength rejects weak passwords", () => {
  const result = validatePasswordStrength("weakpass");

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((entry) => entry.includes("12 characters")));
  assert.ok(result.errors.some((entry) => entry.includes("uppercase")));
  assert.ok(result.errors.some((entry) => entry.includes("number")));
  assert.ok(result.errors.some((entry) => entry.includes("special")));
});

test("assertStrongPassword accepts strong passwords", () => {
  assert.doesNotThrow(() => assertStrongPassword("CorrectHorse!123"));
});

test("assertStrongPassword throws the weak_password validation code", () => {
  assert.throws(() => assertStrongPassword("Short1!"), {
    message: "weak_password",
  });
});
