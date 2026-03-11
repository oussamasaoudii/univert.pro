# Security Audit

Date: 2026-03-09

Scope:
- Next.js app routes under `app/`
- API routes under `app/api/`
- Authentication, sessions, cookies, admin access, queue/internal APIs
- MySQL persistence helpers under `lib/mysql/`
- Domain, provisioning, aaPanel, and settings flows
- Middleware / proxy security headers and request guards

## Entry Points

Primary entry points reviewed:
- Public pages: `/`, `/home`, `/templates`, `/pricing`, `/docs`, `/blog`, `/contact`
- Auth pages: `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`, `/admin/login`
- User pages: `/dashboard/*`
- Admin pages: `/admin/*`
- API namespaces:
  - `/api/auth/*`
  - `/api/dashboard/*`
  - `/api/admin/*`
  - `/api/queue/*`
  - `/api/monitoring/*`
  - `/api/provisioning/*`
  - `/api/websites/launch`
  - `/api/templates/*`
  - `/api/plans`
  - `/api/health`

File upload review:
- No dedicated backend file-upload endpoint is currently exposed in `app/api`.
- The current risk surface is mainly domain/provisioning/settings/auth/admin APIs.

## Secrets / Hardcoded Credentials Review

Reviewed for:
- hardcoded passwords
- hardcoded JWT/session secrets
- admin bootstrap fallbacks
- internal bearer secrets
- plaintext third-party secrets in responses

Critical findings that were fixed:
- Hardcoded local admin fallback credentials were present in code.
- Session secrets could fall back to unsafe values.
- Admin settings API returned stored secrets in plaintext.
- Sensitive settings were stored in plaintext at rest.

Remaining operational note:
- Existing production secrets should be rotated after deployment if they were ever shared outside the server.

## Findings And Remediation

### Critical

1. Hardcoded admin fallback credentials
- Risk:
  Local admin login could succeed with known static credentials if env was missing.
- Fixed:
  Local admin fallback now requires explicit `LOCAL_ADMIN_EMAIL` and `LOCAL_ADMIN_PASSWORD`.
  No default admin identity or password remains in code.

2. Insecure session secret fallback
- Risk:
  User/admin tokens could be signed with weak or predictable secrets.
- Fixed:
  User and admin session code now requires explicit strong secrets.
  Added generated production secrets for:
  - `AUTH_SECRET`
  - `ADMIN_AUTH_SECRET`
  - `CRON_SECRET`

3. Long-lived stateless sessions with weak revocation
- Risk:
  Stolen cookies stayed valid too long and could not be reliably revoked.
- Fixed:
  Added server-side `user_sessions` table.
  Added session id and session version checks.
  Sessions are revoked on logout, password reset, and privilege-sensitive changes.
  User session lifetime reduced to 24 hours.
  Local admin fallback session lifetime reduced to 4 hours.

4. Admin settings leaked secrets
- Risk:
  S3 keys, email keys, and Turnstile secret could be exposed to admin UI/network logs.
- Fixed:
  Settings GET now returns masked secrets only.
  Sensitive settings are encrypted at rest using `ENCRYPTION_KEY`.

5. Queue / worker internal APIs were insufficiently isolated
- Risk:
  Internal worker endpoints could be abused or probed from the public surface.
- Fixed:
  Internal write endpoints now require trusted bearer secrets.
  Added route-specific rate limiting and safer error handling.

### High

6. Login / admin login / signup lacked brute-force protection
- Risk:
  Password guessing and account stuffing.
- Fixed:
  Added DB-backed rate limiting, progressive delay, and audit logging.
  Admin login uses stricter limits than user login.
  Repeated failed login bursts and IP-based rate-limit hits are now audited on both user and admin login paths.

7. Weak password policy
- Risk:
  Easy credential compromise.
- Fixed:
  Enforced strong password policy:
  - minimum 12 chars
  - uppercase
  - lowercase
  - number
  - special character

8. No secure password reset backend flow
- Risk:
  Unsafe or non-existent recovery path.
- Fixed:
  Implemented one-time, short-lived password reset tokens stored hashed in MySQL.
  Reset tokens are invalidated on use.
  Response does not reveal whether email exists.

9. Missing same-origin protection on sensitive cookie-authenticated APIs
- Risk:
  CSRF against dashboard/admin endpoints.
- Fixed:
  Added same-origin enforcement in proxy middleware for mutating `/api/*` requests.
  Internal bearer-authenticated routes are exempted intentionally.

10. Inconsistent backend validation and mass-assignment exposure
- Risk:
  Unexpected fields, malformed payloads, unsafe updates.
- Fixed:
  Added strict Zod validation and bounded body sizes to sensitive routes:
  - auth
  - domains
  - billing update
  - launch
  - admin settings
  - admin user access changes
  - worker endpoints

11. Dashboard read routes exposed more internal fields than the UI needed
- Risk:
  User-facing dashboard responses could carry internal identifiers and operational fields such as owner metadata or provisioning internals that were not required by the frontend.
- Fixed:
  Dashboard overview/websites responses are now sanitized to return only UI-needed fields.
  Added regression coverage to ensure website/domain/activity/notification payloads do not leak internal fields.

12. Ownership / authorization checks were incomplete in some server actions
- Risk:
  IDOR/BOLA or privilege confusion.
- Fixed:
  Sensitive user server actions now derive identity from backend auth only.
  Client-supplied `userId` is no longer trusted for sensitive operations.

### Moderate

13. Sensitive logs could contain unsafe context
- Risk:
  Tokens, passwords, secrets, or cookies ending up in logs.
- Fixed:
  Added log redaction for sensitive keys.
  Error stack logging is suppressed in production logger output.

14. Missing security headers
- Risk:
  Weaker browser-side defenses against XSS/clickjacking/content sniffing.
- Fixed:
  Added CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and no-store caching on sensitive routes.
  Disabled the `X-Powered-By` framework header.

15. Legacy helper modules remain weak or illustrative
- Risk:
  Future developers may mistakenly use legacy helpers instead of hardened ones.
- Fixed:
  The active secure paths now use:
  - `lib/security/request.ts`
  - `lib/mysql/security.ts`
  - `lib/api-auth.ts`

### Critical

16. Admin sessions still lacked a mandatory second factor
- Risk:
  Password reuse or compromise would still be enough to reach privileged admin actions.
- Fixed:
  Implemented TOTP-based MFA for admins with:
  - short-lived MFA challenge cookie
  - enforced MFA enrollment for admin accounts
  - recovery codes stored hashed
  - recovery codes displayed once only
  - session creation only after successful MFA

17. Sensitive admin actions lacked re-authentication
- Risk:
  A stolen or unattended admin session could modify security settings or user privileges.
- Fixed:
  Added admin step-up authentication requiring:
  - current password
  - valid TOTP or recovery code
  Step-up is now enforced for:
  - admin settings changes
  - admin user privilege/status changes
  - MFA disable
  - recovery-code regeneration

### High

18. Admin read routes used inconsistent validation and could leak internal fields
- Risk:
  Query abuse, field leakage, and inconsistent errors on high-value admin read endpoints.
- Fixed:
  Hardened:
  - `/api/admin/users`
  - `/api/admin/websites`
  - `/api/admin/domains`
  - `/api/admin/templates`
  - `/api/admin/overview`
  with:
  - strict query validation
  - rate limits
  - centralized safe error handling
  - sanitized user responses

19. Self-service billing changes allowed direct plan-tier escalation
- Risk:
  A logged-in user could switch plan tiers directly through the dashboard API without a real checkout or payment confirmation boundary.
- Fixed:
  Dashboard billing updates now allow billing-cycle changes only within the current plan.
  Direct plan-tier changes are rejected with a safe conflict response until a real checkout flow exists.

20. Website launch flow lacked abuse guards for plan limits and obvious duplicate replays
- Risk:
  Users could bypass plan website limits or replay the same launch request into duplicate provisioning attempts.
- Fixed:
  Launch workflow now enforces current plan website limits and rejects duplicate launches for the same owned subdomain/custom domain before side effects run.
21. Local-admin request fallback could reintroduce bypasses later
- Risk:
  Legacy fallback logic could accidentally bypass MFA-backed admin sessions.
- Fixed:
  Runtime request auth no longer honors local-admin fallback sessions.
  `getAdminRequestUser()` now requires a MySQL-backed admin session with `mfaVerifiedAt`.

22. Remaining lower-priority admin routes still used the older access pattern
- Risk:
  `servers` and `tickets` admin routes still relied on ad-hoc auth checks, broader payloads, and inconsistent query/body validation.
- Fixed:
  Hardened:
  - `/api/admin/servers`
  - `/api/admin/servers/[id]`
  - `/api/admin/tickets`
  - `/api/admin/tickets/[id]`
  with:
  - centralized admin route guards
  - strict `zod` validation for params/query/body
  - `no-store` response headers
  - tighter rate limits on write actions
  - reduced field exposure in list/message payloads

23. Admin MFA enrollment relied on manual secret copy only
- Risk:
  The security model was sound, but manual-only enrollment increased setup friction and made operational mistakes more likely.
- Fixed:
  Added QR-based TOTP enrollment inside `/admin/mfa` while keeping the same short-lived MFA challenge and without adding any new secret persistence.

## Legacy Risk Cleanup

Files that represented elevated risk and what was done:
- `lib/api-auth.ts`
  Removed runtime local-admin request fallback from the active auth path.
- `lib/auth-guard.ts`
  Rewritten to rely on hardened request-auth helpers only.
- `lib/utils/admin-middleware.ts`
  Replaced with a compatibility wrapper backed by `getAdminRequestUser()`.
- `app/actions/admin-actions.ts`
  Removed scattered `getCurrentUser()/isUserAdmin()` checks in favor of centralized admin auth.
- `app/actions/blog-admin.ts`
  Removed dependency on the legacy admin middleware helper.
- `lib/security/admin-api.ts`
  Added centralized admin route guards, duplicate-query rejection, and `no-store` response helpers.
- `lib/security/admin-response.ts`
  Centralized admin payload sanitization for diagnostics, queue jobs, server summaries, and support tickets.

## What Was Implemented In Code

Authentication and sessions:
- strong password policy enforcement
- DB-backed login throttling
- progressive delay on failed auth
- one-time reset password flow
- logout revocation
- session version invalidation
- short-lived cookies
- same-origin protection on mutating APIs
- admin TOTP MFA
- hashed recovery codes
- MFA challenge flow for admin login
- admin step-up verification windows for sensitive operations

Authorization:
- stricter admin/user split
- protection against self-demotion and removing the last active admin
- ownership checks on provisioning/domain/user actions
- internal worker endpoints restricted to bearer-authenticated server-to-server use
- admin access now requires MFA-verified server-side sessions
- lower-priority admin `servers` and `tickets` routes now use the same guard/validation/no-store pattern as previously hardened admin routes

API hardening:
- strict Zod validation on sensitive endpoints
- body size limits
- rate limiting on sensitive paths
- safer error responses
- safer queue/provisioning visibility rules
- hardened admin read routes with validated filters and search inputs
- sanitized admin user payloads to avoid field leakage
- duplicate query-parameter rejection for hardened admin list routes
- sanitized queue, server-summary, and support-ticket admin responses

Storage and secrets:
- encrypted-at-rest sensitive admin settings
- masked secrets in API responses
- removed hardcoded credential fallbacks

Browser security:
- CSP and related headers
- HSTS in production
- no-store for auth/admin/dashboard/API responses

Audit and monitoring:
- audit events for admin login/logout, privilege changes, password reset, and rate-limit hits
- audit events for malformed JSON, invalid request schema, duplicate query parameters, repeated failed login detection, unauthorized admin API probes, unauthorized internal API probes, and cross-tenant resource access rejections on hardened routes
- MFA enrollment, failures, recovery-code use, disable attempts, disable success, and step-up verification

Tests added or updated:
- JWT signing / verification
- aaPanel signing / payload builders
- password policy
- request origin / internal bearer / strict body parsing helpers
- TOTP helper and recovery-code coverage
- admin step-up verification window coverage
- admin query validation regression coverage
- admin response sanitization regression coverage
- admin user response sanitization regression coverage
- route-level internal probe blocking coverage
- route-level malformed JSON / invalid-schema rejection coverage
- route-level auth abuse coverage for login, admin-login, forgot-password, and admin MFA verify
- dashboard read-route sanitization coverage for websites and overview payloads
- admin read-route sanitization coverage for `/api/admin/users`
- business-logic coverage for website launch limits/replay rejection and dashboard billing plan-escalation blocking
- route-level admin settings secret-masking and step-up enforcement coverage
- route-level monitoring worker bearer-secret rejection coverage
- tenant-isolation regression coverage for provisioning, dashboard domains, and support ticket detail routes
- middleware coverage for security headers, no-store caching, cross-origin rejection, and oversized request rejection
- session-cookie flag coverage for user, local-admin fallback, and admin MFA challenge cookies

Infra-only validation kept outside code:
- live edge verification of Cloudflare/Nginx/origin behavior is documented and scriptable via `scripts/live-edge-smoke.sh`
- dependency/CVE automation is exposed separately through `npm run security:deps` and `npm run security:ci`

## Items That Still Need Infra / Production Setup

These cannot be fully solved inside app code alone:

1. Reverse proxy / CDN abuse protection
- Nginx or Cloudflare rate limiting
- WAF rules
- bot mitigation
- connection limiting
- edge path traversal blocking
- version banner suppression
- Fail2ban on origin logs for auth brute-force and scanner activity

2. Reverse proxy / CDN abuse protection
- Nginx or Cloudflare rate limiting
- WAF rules
- bot mitigation
- connection limiting
- optional low-confidence noisy query-string filtering only after evaluating false-positive risk

3. Secret rotation policy
- Rotate:
  - `AUTH_SECRET`
  - `ADMIN_AUTH_SECRET`
  - `CRON_SECRET`
  - provider/API keys

4. Email delivery for password reset
- Reset flow is implemented.
- Production still needs valid Resend or SendGrid credentials.

5. Database least privilege
- Use a DB user restricted to this application schema only.

6. Internal route network policy
- Implemented on 2026-03-09:
  - Nginx denies public access to `/api/queue/worker`, `/api/queue/maintenance`, `/api/monitoring/worker`
  - Cloudflare blocks the same public routes at the edge
  - Admin-triggered worker execution now targets loopback directly instead of the public hostname

## Residual Risks / Follow-Up

- `lib/utils/security.ts` and a few older utility layers should still be retired fully to reduce future drift.
- No backend file upload surface was found, so upload hardening was not implemented beyond audit confirmation.

## Dependency Review

Checked on 2026-03-09:
- `npm audit --omit=dev` returned no known production vulnerabilities.
