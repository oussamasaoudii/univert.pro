import crypto from "node:crypto";

type JwtPayload = Record<string, unknown> & {
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function createSignature(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function parseJwtHeader(tokenHeader: string) {
  try {
    const parsed = JSON.parse(base64UrlDecode(tokenHeader)) as {
      alg?: string;
      typ?: string;
    };

    return parsed;
  } catch {
    return null;
  }
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function createSignedJwt<T extends JwtPayload>(payload: T, secret: string) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${header}.${body}`;
  const signature = createSignature(unsigned, secret);
  return `${unsigned}.${signature}`;
}

export function verifySignedJwt<T extends JwtPayload>(
  token: string | null | undefined,
  secret: string,
): T | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length === 2) {
    const [legacyPayload, legacySignature] = parts;
    if (!legacyPayload || !legacySignature) {
      return null;
    }

    const expectedSignature = createSignature(legacyPayload, secret);
    if (!safeCompare(legacySignature, expectedSignature)) {
      return null;
    }

    try {
      const decoded = JSON.parse(base64UrlDecode(legacyPayload)) as T;
      return typeof decoded.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000)
        ? decoded
        : null;
    } catch {
      return null;
    }
  }

  if (parts.length !== 3) {
    return null;
  }

  const [header, payload, signature] = parts;
  if (!header || !payload || !signature) {
    return null;
  }

  const decodedHeader = parseJwtHeader(header);
  if (!decodedHeader || decodedHeader.alg !== "HS256") {
    return null;
  }

  const unsigned = `${header}.${payload}`;
  const expectedSignature = createSignature(unsigned, secret);
  if (!safeCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as T;
    return typeof decoded.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000)
      ? decoded
      : null;
  } catch {
    return null;
  }
}
