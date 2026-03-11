import test from "node:test";
import assert from "node:assert/strict";
import { appendAapanelSignature, buildAapanelSignature, md5 } from "./signing.ts";

test("buildAapanelSignature uses official md5 chain", () => {
  const signature = buildAapanelSignature({
    apiKey: "secret-key",
    requestTime: "1700000000",
  });

  assert.equal(signature.requestTime, "1700000000");
  assert.equal(signature.requestToken, md5(`1700000000${md5("secret-key")}`));
});

test("appendAapanelSignature writes request_time and request_token", () => {
  const params = new URLSearchParams();
  appendAapanelSignature(params, {
    apiKey: "secret-key",
    requestTime: "1700000001",
  });

  assert.equal(params.get("request_time"), "1700000001");
  assert.equal(
    params.get("request_token"),
    md5(`1700000001${md5("secret-key")}`),
  );
});
