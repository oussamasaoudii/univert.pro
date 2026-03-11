import { Resolver, resolve4, resolve6 } from "node:dns/promises";
import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import { getUserDomains } from "@/lib/db/domains";
import { enforceRouteRateLimit, getRequestIp, toApiErrorResponse } from "@/lib/security/request";

const DNS_SERVERS = [
  { name: "Google DNS", location: "US", ip: "8.8.8.8" },
  { name: "Cloudflare DNS", location: "US", ip: "1.1.1.1" },
  { name: "Quad9 DNS", location: "Global", ip: "9.9.9.9" },
  { name: "OpenDNS", location: "US", ip: "208.67.222.222" },
  { name: "Verisign DNS", location: "US", ip: "64.6.64.6" },
  { name: "Comodo DNS", location: "Global", ip: "8.26.56.26" },
  { name: "Level3 DNS", location: "US", ip: "209.244.0.3" },
  { name: "Neustar DNS", location: "US", ip: "156.154.70.1" },
] as const;

const VALID_RECORD_TYPES = new Set(["A", "AAAA", "MX", "CNAME", "TXT", "NS"]);

function sanitizeDomain(value: string) {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*/, "");
}

function normalizeDnsValue(value: string) {
  return value.trim().replace(/\.$/, "").toLowerCase();
}

function splitAnswer(rawAnswer: string) {
  return rawAnswer
    .split(",")
    .map((entry) => normalizeDnsValue(entry))
    .filter(Boolean);
}

function formatAnswer(rawAnswer: unknown): string {
  if (typeof rawAnswer === "string") {
    return rawAnswer;
  }

  if (Array.isArray(rawAnswer)) {
    const parts = rawAnswer
      .map((entry) => formatAnswer(entry))
      .filter((entry) => Boolean(entry));
    return parts.join(", ");
  }

  if (rawAnswer && typeof rawAnswer === "object") {
    const candidate = rawAnswer as Record<string, unknown>;

    if (typeof candidate.exchange === "string") {
      const priority =
        typeof candidate.priority === "number" ? `${candidate.priority} ` : "";
      return `${priority}${candidate.exchange}`;
    }

    if (typeof candidate.value === "string") {
      return candidate.value;
    }

    try {
      return JSON.stringify(candidate);
    } catch {
      return "";
    }
  }

  return "";
}

async function queryDnsServer(
  domain: string,
  recordType: string,
  serverIp: string,
) {
  const resolver = new Resolver();
  resolver.setServers([serverIp]);

  const result = await Promise.race([
    resolver.resolve(domain, recordType),
    new Promise<never>((_resolve, reject) => {
      setTimeout(() => reject(new Error("TIMEOUT")), 4500);
    }),
  ]);

  const formatted = formatAnswer(result);
  return formatted || "Resolved";
}

async function resolveExpectedAnswers(recordType: string, expectedValue: string) {
  const normalizedExpected = normalizeDnsValue(expectedValue);
  if (!normalizedExpected) {
    return [];
  }

  if (recordType === "A") {
    if (isIP(normalizedExpected) === 4) {
      return [normalizedExpected];
    }

    const addresses = await resolve4(normalizedExpected).catch(() => []);
    return addresses.map((address) => normalizeDnsValue(address));
  }

  if (recordType === "AAAA") {
    if (isIP(normalizedExpected) === 6) {
      return [normalizedExpected];
    }

    const addresses = await resolve6(normalizedExpected).catch(() => []);
    return addresses.map((address) => normalizeDnsValue(address));
  }

  return [normalizedExpected];
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback" || user.sessionType !== "user") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: "dashboard-domain-dns-check",
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 60,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    const { searchParams } = new URL(request.url);
    const domain = sanitizeDomain(searchParams.get("domain") || "");
    const recordTypeRaw = (searchParams.get("recordType") || "A").toUpperCase();
    const recordType = VALID_RECORD_TYPES.has(recordTypeRaw)
      ? recordTypeRaw
      : "A";
    const expectedValue = sanitizeDomain(searchParams.get("expectedValue") || "");

    if (!domain || !domain.includes(".")) {
      return NextResponse.json({ error: "invalid_domain" }, { status: 400 });
    }

    const ownedDomains = await getUserDomains(user.id);
    const isOwnedDomain = ownedDomains.some((entry) => entry.domain === domain);
    if (!isOwnedDomain) {
      return NextResponse.json({ error: "domain_not_found" }, { status: 404 });
    }

    const expectedAnswers = expectedValue
      ? await resolveExpectedAnswers(recordType, expectedValue)
      : [];

    const results = await Promise.all(
      DNS_SERVERS.map(async (server) => {
        try {
          const answer = await queryDnsServer(domain, recordType, server.ip);
          const normalizedAnswers = splitAnswer(answer);
          const matchesExpected =
            expectedAnswers.length > 0
              ? normalizedAnswers.some((entry) => expectedAnswers.includes(entry))
              : null;

          return {
            ...server,
            status: "resolved" as const,
            result: answer,
            matchesExpected,
          };
        } catch (error) {
          const message =
            error instanceof Error && error.message
              ? error.message
              : "UNRESOLVED";
          return {
            ...server,
            status: "failed" as const,
            result: message,
            matchesExpected: null,
          };
        }
      }),
    );

    const resolvedCount = results.filter((item) => item.status === "resolved").length;
    const matchedCount = results.filter((item) => item.matchesExpected === true).length;
    const mismatchedCount = results.filter((item) => item.matchesExpected === false).length;
    const propagationPercentage =
      results.length > 0
        ? Math.round(((expectedAnswers.length > 0 ? matchedCount : resolvedCount) / results.length) * 100)
        : 0;

    return NextResponse.json({
      domain,
      recordType,
      expectedValue: expectedValue || null,
      expectedAnswers,
      results,
      propagationPercentage,
      resolvedCount,
      matchedCount,
      mismatchedCount,
      failedCount: results.length - resolvedCount,
    });
  } catch (error) {
    return toApiErrorResponse(error, { action: "dashboard.domains.dns_check" });
  }
}
