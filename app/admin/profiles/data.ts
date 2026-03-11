export type ProvisioningProfile = {
  id: string;
  name: string;
  stack: string;
  method: string;
  server: string;
  database: string;
  domain: string;
  ssl: string;
  status: "active" | "disabled";
  websites: number;
  created: string;
};

export const CUSTOM_PROFILES_STORAGE_KEY = "ovmon_custom_profiles";

export const provisioningProfiles: ProvisioningProfile[] = [
  {
    id: "prf-nextjs-premium",
    name: "Next.js Premium",
    stack: "Next.js",
    method: "Docker",
    server: "US East Primary",
    database: "Managed",
    domain: "Auto",
    ssl: "Let's Encrypt",
    status: "active",
    websites: 456,
    created: "2024-01-15",
  },
  {
    id: "prf-laravel-standard",
    name: "Laravel Standard",
    stack: "Laravel",
    method: "Traditional",
    server: "EU West Primary",
    database: "Server",
    domain: "Manual",
    ssl: "Let's Encrypt",
    status: "active",
    websites: 234,
    created: "2024-01-10",
  },
  {
    id: "prf-wordpress-basic",
    name: "WordPress Basic",
    stack: "WordPress",
    method: "Traditional",
    server: "AP South Secondary",
    database: "Managed",
    domain: "Auto",
    ssl: "Let's Encrypt",
    status: "disabled",
    websites: 123,
    created: "2024-01-05",
  },
  {
    id: "prf-nextjs-enterprise",
    name: "Next.js Enterprise",
    stack: "Next.js",
    method: "Docker",
    server: "US East Primary",
    database: "External",
    domain: "Manual",
    ssl: "Custom",
    status: "active",
    websites: 89,
    created: "2024-01-20",
  },
];

export function isProvisioningProfile(value: unknown): value is ProvisioningProfile {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.stack === "string" &&
    typeof candidate.method === "string" &&
    typeof candidate.server === "string" &&
    typeof candidate.database === "string" &&
    typeof candidate.domain === "string" &&
    typeof candidate.ssl === "string" &&
    (candidate.status === "active" || candidate.status === "disabled") &&
    typeof candidate.websites === "number" &&
    typeof candidate.created === "string"
  );
}

export function parseCustomProvisioningProfiles(
  serializedProfiles: string | null,
): ProvisioningProfile[] {
  if (!serializedProfiles) return [];

  try {
    const parsed = JSON.parse(serializedProfiles);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isProvisioningProfile);
  } catch {
    return [];
  }
}

export function mergeProvisioningProfiles(
  customProfiles: ProvisioningProfile[],
): ProvisioningProfile[] {
  const seenIds = new Set<string>();
  const merged: ProvisioningProfile[] = [];

  for (const profile of [...provisioningProfiles, ...customProfiles]) {
    if (!seenIds.has(profile.id)) {
      merged.push(profile);
      seenIds.add(profile.id);
    }
  }

  return merged;
}

export function getProvisioningProfileById(profileId: string) {
  return provisioningProfiles.find((profile) => profile.id === profileId) ?? null;
}
