import { securityConfig, appConfig } from '@/lib/config/environment';
import { getMySQLPool } from '@/lib/mysql/pool';
import { findUserById } from '@/lib/mysql/users';
import { logger } from './errors';

/**
 * Input validation utilities for production safety
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validateDomain(domain: string): boolean {
  // RFC 1123 compliant domain validation
  const domainRegex = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
  return domainRegex.test(domain) && domain.length <= 253;
}

export function validateSubdomain(subdomain: string): boolean {
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
  return subdomainRegex.test(subdomain) && subdomain.length <= 63;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain special characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');

  // Trim to max length
  sanitized = sanitized.substring(0, maxLength);

  return sanitized.trim();
}

export function validateId(id: string): boolean {
  // UUID v4 or custom format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id) || (id.length > 0 && id.length <= 50);
}

/**
 * Admin role verification
 */
export async function verifyAdminRole(userId: string): Promise<boolean> {
  try {
    const user = await findUserById(userId);
    return user?.role === 'admin';
  } catch (error) {
    logger.error('Error verifying admin role', error, { userId });
    return false;
  }
}

/**
 * Rate limiting with simple in-memory store
 * In production, this should use Redis
 */
class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();

  isLimited(key: string): boolean {
    const config = securityConfig();
    const now = Date.now();

    const entry = this.store.get(key);

    if (!entry || now >= entry.resetTime) {
      // New window
      this.store.set(key, {
        count: 1,
        resetTime: now + 60 * 1000, // 1 minute window
      });
      return false;
    }

    entry.count++;

    if (entry.count > config.rateLimitRequestsPerMinute) {
      logger.warn('Rate limit exceeded', { key, count: entry.count });
      return true;
    }

    return false;
  }

  reset(key: string) {
    this.store.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Verify user owns resource (for authorization checks)
 */
export async function verifyUserOwnsResource(
  userId: string,
  resourceId: string,
  resourceTable: string,
): Promise<boolean> {
  try {
    if (!/^[a-z_]+$/i.test(resourceTable)) {
      logger.warn('Rejected invalid resource table', { userId, resourceId, resourceTable });
      return false;
    }

    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT id
        FROM ${resourceTable}
        WHERE id = ?
          AND user_id = ?
        LIMIT 1
      `,
      [resourceId, userId],
    );

    return (rows as Array<{ id: string }>).length > 0;
  } catch (error) {
    logger.error('Error verifying resource ownership', error, { userId, resourceId });
    return false;
  }
}

/**
 * XSS protection - sanitize HTML
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * CSRF token generation and validation
 */
export function generateCsrfToken(): string {
  if (typeof window !== 'undefined') {
    // Client-side - get from document
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!token) {
      logger.warn('CSRF token not found in document');
    }
    return token || '';
  }

  // Server-side - generate new token
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Constant-time comparison for sensitive strings
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
