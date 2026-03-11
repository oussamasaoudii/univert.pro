import crypto from "node:crypto";

export function md5(value: string): string {
  return crypto.createHash("md5").update(value).digest("hex");
}

export function buildAapanelSignature(input: {
  apiKey: string;
  requestTime?: string;
}) {
  // aaPanel expects a Unix timestamp string, not milliseconds.
  const requestTime =
    input.requestTime ?? Math.floor(Date.now() / 1000).toString();
  const requestToken = md5(`${requestTime}${md5(input.apiKey)}`);

  return {
    requestTime,
    requestToken,
  };
}

export function appendAapanelSignature(
  params: URLSearchParams,
  input: {
    apiKey: string;
    requestTime?: string;
  },
) {
  const signature = buildAapanelSignature(input);
  params.set("request_time", signature.requestTime);
  params.set("request_token", signature.requestToken);
  return signature;
}
