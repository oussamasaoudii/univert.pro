import { AuthorizationError } from "@/lib/utils/errors";

export const ADMIN_STEP_UP_WINDOW_MS = 10 * 60 * 1000;
export const ADMIN_MFA_MANAGEMENT_WINDOW_MS = 5 * 60 * 1000;

function parseDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function hasRecentStepUp(
  stepUpVerifiedAt: string | null | undefined,
  windowMs: number = ADMIN_STEP_UP_WINDOW_MS,
) {
  const verifiedAt = parseDate(stepUpVerifiedAt);
  if (!verifiedAt) {
    return false;
  }

  return Date.now() - verifiedAt.getTime() <= windowMs;
}

export function assertRecentAdminStepUp(
  stepUpVerifiedAt: string | null | undefined,
  windowMs: number = ADMIN_STEP_UP_WINDOW_MS,
) {
  if (!hasRecentStepUp(stepUpVerifiedAt, windowMs)) {
    throw new AuthorizationError("step_up_required", {
      stepUpRequired: true,
      windowMs,
    });
  }
}
