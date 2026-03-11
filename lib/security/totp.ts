import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const RECOVERY_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;

function base32Encode(buffer: Buffer) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(input: string) {
  const normalized = input.replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (const character of normalized) {
    const index = BASE32_ALPHABET.indexOf(character);
    if (index === -1) {
      throw new Error("invalid_base32_secret");
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

function hotp(secret: string, counter: number, digits: number = TOTP_DIGITS) {
  const secretBuffer = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", secretBuffer).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(binary % 10 ** digits).padStart(digits, "0");
}

function normalizeRecoveryCode(input: string) {
  return input.trim().toUpperCase().replace(/[^A-Z2-9]/g, "");
}

export function generateTotpSecret() {
  return base32Encode(randomBytes(20));
}

export function createTotpCode(secret: string, timeMs: number = Date.now()) {
  const counter = Math.floor(timeMs / 1000 / TOTP_PERIOD_SECONDS);
  return hotp(secret, counter);
}

export function verifyTotpCode(
  secret: string,
  code: string,
  options?: { window?: number; timeMs?: number },
) {
  const normalizedCode = code.trim();
  if (!/^\d{6}$/.test(normalizedCode)) {
    return false;
  }

  const counter = Math.floor((options?.timeMs || Date.now()) / 1000 / TOTP_PERIOD_SECONDS);
  const window = Math.max(0, Math.min(2, options?.window ?? 1));

  for (let offset = -window; offset <= window; offset += 1) {
    const expected = hotp(secret, counter + offset);
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(normalizedCode))) {
      return true;
    }
  }

  return false;
}

export function buildOtpAuthUri(input: {
  secret: string;
  accountName: string;
  issuer?: string;
}) {
  const issuer = input.issuer?.trim() || "Univert";
  const label = `${issuer}:${input.accountName.trim()}`;
  const params = new URLSearchParams({
    secret: input.secret,
    issuer,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD_SECONDS),
  });

  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

export function generateRecoveryCodes(count: number = 10) {
  const codes: string[] = [];

  while (codes.length < count) {
    const raw = randomBytes(8);
    let next = "";
    for (let index = 0; index < 10; index += 1) {
      next += RECOVERY_CODE_ALPHABET[raw[index % raw.length] % RECOVERY_CODE_ALPHABET.length];
    }

    const formatted = `${next.slice(0, 5)}-${next.slice(5)}`;
    if (!codes.includes(formatted)) {
      codes.push(formatted);
    }
  }

  return codes;
}

export function hashRecoveryCode(code: string, pepper: string) {
  return createHash("sha256")
    .update(`${pepper}:${normalizeRecoveryCode(code)}`)
    .digest("hex");
}

export function isRecoveryCodeFormat(code: string) {
  return /^[A-Z2-9-]{8,16}$/i.test(code.trim());
}

export function normalizeRecoveryCodeForDisplay(code: string) {
  const normalized = normalizeRecoveryCode(code);
  if (normalized.length <= 5) {
    return normalized;
  }

  return `${normalized.slice(0, 5)}-${normalized.slice(5, 10)}`;
}
