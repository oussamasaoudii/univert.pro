# Security Setup

Date: 2026-03-09

This document describes the security controls implemented in code and the remaining production setup required outside the app.

## Implemented In Code

- Strong password policy enforcement
- DB-backed login rate limiting
- Progressive delay on failed login attempts
- One-time password reset tokens with expiration
- Session revocation on logout and password change
- Session version invalidation on privilege-sensitive changes
- Strict validation for sensitive API routes
- Same-origin protection for mutating cookie-authenticated APIs
- Internal bearer protection for queue/worker/monitoring write endpoints
- Secret masking in admin settings responses
- Encryption at rest for sensitive settings values
- Security headers and no-store caching for sensitive pages/routes
- Audit logging for admin and auth-sensitive actions
- Admin TOTP MFA with hashed recovery codes
- QR-based admin MFA enrollment on the secure `/admin/mfa` challenge flow
- Admin step-up authentication for privileged changes
- Hardened admin read routes with stricter validation
- Hardened remaining lower-priority admin `servers` and `tickets` routes with no-store + sanitized response payloads
- Dashboard read-route response sanitization for website/domain/activity/notification payloads
- Website launch abuse checks for plan limits and duplicate replay attempts
- Direct self-service plan-tier changes blocked pending real checkout/billing enforcement

## Required Environment Variables

Security-critical:
- `AUTH_SECRET`
- `ADMIN_AUTH_SECRET`
- `CRON_SECRET`
- `WEBHOOK_SECRET`
- `ENCRYPTION_KEY`
- `NEXT_PUBLIC_APP_URL`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

Optional local admin bootstrap identity:
- `LOCAL_ADMIN_EMAIL`
- `LOCAL_ADMIN_PASSWORD`

Recommendation:
- These values should only be used to seed or repair an admin identity in MySQL.
- Runtime request authentication no longer trusts local-admin fallback sessions.
- If not needed, leave both `LOCAL_ADMIN_*` variables unset.

Password reset email:
- `EMAIL_PROVIDER`
- `RESEND_API_KEY`
- or `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL` when using SendGrid

Provisioning / internal workers:
- `AAPANEL_*`
- `WEBHOOK_SECRET`
- `CRON_SECRET`

Observability:
- `SENTRY_DSN` if Sentry is used
- `LOG_LEVEL`
- `LOG_SERVICE`

## Session / Cookie Defaults

Current secure defaults:
- User session cookie:
  - `HttpOnly`
  - `Secure` in production
  - `SameSite=lax`
  - 24h lifetime
- Local admin fallback cookie:
  - `HttpOnly`
  - `Secure` in production
  - `SameSite=strict`
  - 4h lifetime
- Admin MFA challenge cookie:
  - `HttpOnly`
  - `Secure` in production
  - `SameSite=strict`
  - 15m lifetime
- Admin sessions:
  - `sessionType=admin`
  - server-side session row
  - MFA timestamp required
  - recent step-up timestamp required for sensitive actions

## Password Reset Setup

The backend reset flow is implemented.

To make it production-ready:
1. Configure a real email provider.
2. Ensure `NEXT_PUBLIC_APP_URL` points to the real domain.
3. Confirm mail delivery works for:
   - forgot password request
   - reset password completion

Security properties:
- generic response on forgot-password
- one-time token
- short-lived token
- all sessions revoked after reset

## Admin Protection

Currently enforced:
- admin routes require backend auth
- stricter rate limits on admin login
- audit logs for admin login/logout and privilege changes
- prevention of self-demotion and removing the last active admin
- TOTP MFA required for admin sessions
- hashed one-time recovery codes
- recent step-up re-auth required before:
  - admin settings changes
  - admin user privilege/status changes
  - MFA disable
  - recovery-code regeneration

Admin MFA flow:
1. Admin signs in on `/admin/login`
2. Server issues a short-lived admin MFA challenge
3. Admin completes:
   - enrollment if MFA is not enabled yet
   - verification if MFA is already enabled
   - enrollment now supports QR scanning and manual secret entry
4. Server creates an `admin` session only after valid MFA

Operational rule:
- Recovery codes are displayed once only and should be stored offline.
- Disabling MFA must be treated as a privileged and audited action.
- QR enrollment is only available during the short-lived MFA challenge window.

## Logging And Audit Trail

Security-relevant events currently logged:
- login success
- repeated failed login detection on user and admin auth flows
- login rate-limit hits
- password reset requested
- password reset completed
- admin login/logout
- admin privilege/status changes
- cross-tenant resource access rejected on hardened dashboard and provisioning routes
- malformed JSON rejected on hardened auth/internal/admin routes
- invalid request schema or duplicate query parameters rejected on hardened routes
- unauthorized admin API probes on routes using centralized admin guards
- unauthorized internal API probes on queue/monitoring routes
- admin MFA enrollment
- admin MFA verification failures
- admin recovery-code use
- admin MFA disable attempts
- admin MFA disable success
- admin step-up verification

Additional regression coverage added in stage 3:
- dashboard websites / overview payload sanitization coverage
- admin users read-route sanitization coverage
- website-launch business-logic coverage for plan limits and duplicate replay attempts
- dashboard billing abuse coverage blocking direct plan-tier escalation
- route-level malformed JSON / invalid-schema rejection on login, admin-login, and admin MFA verify
- route-level IP and account rate-limit coverage on login, admin-login, forgot-password, and admin MFA verify
- forgot-password enumeration-safe response coverage
- route-level admin settings step-up enforcement and secret-masking coverage
- duplicate admin query-parameter rejection
- admin response sanitization for queue diagnostics
- admin response sanitization for server summaries
- admin response sanitization for support tickets/messages
- route-level internal API blocking for unauthorized probes
- route-level monitoring worker blocking for missing/wrong bearer secrets
- route-level malformed JSON rejection on internal worker routes
- route-level invalid-schema rejection on hardened admin write routes
- tenant-isolation regression coverage for provisioning, dashboard domains, and support ticket resource routes
- middleware coverage for security headers, no-store caching, cross-origin blocking, and oversized request rejection
- session-cookie flag coverage for user, local-admin fallback, and admin MFA challenge cookies

## Live Edge Verification

Infra-only checks are intentionally kept outside `npm run test:security`.

Use:
- `npm run security:edge-smoke -- https://your-domain.example`
- `scripts/live-edge-smoke.sh https://your-domain.example`

Verify explicitly:
- `/api/queue/*` and `/api/monitoring/*` are not publicly callable
- edge headers match the intended CSP/HSTS/no-store policy
- rate limiting is visible at Cloudflare/Nginx, not only inside app code
- `/admin/*` and auth flows are challenged/throttled at the edge as configured
- the origin is not directly reachable around Cloudflare/WAF policy

Where to review:
- application logs
- Sentry, if configured
- MySQL `audit_logs` table used by the app

Operational rule:
- do not forward raw request headers or secrets into logs
- logger now redacts sensitive context keys automatically

## Recommended Nginx / Reverse Proxy Settings

These are not fully solvable inside app code.

Recommended:

1. Body size limit
```nginx
client_max_body_size 1m;
```

2. Timeouts
```nginx
proxy_connect_timeout 5s;
proxy_send_timeout 30s;
proxy_read_timeout 30s;
send_timeout 30s;
```

3. Forward real client IP
```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

4. Basic rate limiting
```nginx
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=api_limit:20m rate=60r/m;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
```

Example locations:
```nginx
location ~ ^/api/auth/(login|admin-login|forgot-password|reset-password|signup)$ {
    limit_req zone=auth_limit burst=20 nodelay;
    limit_conn conn_limit 20;
    proxy_pass http://127.0.0.1:3100;
}

location ^~ /api/ {
    limit_req zone=api_limit burst=120 nodelay;
    limit_conn conn_limit 40;
    proxy_pass http://127.0.0.1:3100;
}
```

5. Lock down internal endpoints if possible
```nginx
location ~ ^/api/(queue|monitoring)/ {
    allow 127.0.0.1;
    allow <trusted-worker-ip>;
    deny all;
    proxy_pass http://127.0.0.1:3100;
}
```

Only use this if your workers run locally or behind trusted IPs.
If remote workers are required, keep bearer-secret auth and restrict by source IP where possible.

## Edge Controls For Production

Reference templates:
- `ops/nginx/security-hardening-snippets.conf`
- `ops/fail2ban/jail.d/nginx-app.local.example`
- `ops/fail2ban/filter.d/nginx-auth.conf`
- `ops/fail2ban/filter.d/nginx-scanners.conf`

Recommended origin additions:

1. Hide Nginx version
```nginx
server_tokens off;
```

2. Block common path traversal probes at the edge
```nginx
location ~* (\.\./|\.\.%2f|%2e%2e) {
    return 403;
}
```

3. Keep request body limits narrow by default
```nginx
client_max_body_size 1m;
```

Future upload example:
```nginx
location /api/upload {
    client_max_body_size 20m;
    proxy_pass http://127.0.0.1:3100;
}
```

Operational rule:
- do not increase the global body size unless the application actually adds an upload surface
- prefer route-specific overrides only

4. Optional noisy query-string filtering
```nginx
# Optional low-confidence rule. Do not treat this as your SQL injection defense.
# Prefer managed WAF rules or challenge/log-only mode first.
# False positives are possible.
#
# if ($query_string ~* "(union|select|insert|drop|--|%27)") {
#     return 403;
# }
```

5. Fail2ban on the origin host
- Use Fail2ban after Cloudflare and Nginx, not instead of them.
- Start with:
  - `/api/auth/login`
  - `/api/auth/admin-login`
  - `/admin/login`
  - `/admin/mfa`
  - repeated probes to `/api/queue/*`, `/api/monitoring/worker`, and known scanner paths
- Default templates assume `/var/log/nginx/access.log`.
- If your origin logs to journald or a custom file, adjust `logpath` only.

## Recommended Cloudflare / CDN / WAF Settings

Recommended:
- Proxy public app traffic through Cloudflare
- Enable:
  - WAF managed rules
  - Bot Fight Mode or equivalent
  - DDoS protection
  - Browser Integrity Check
- Rate-limit these paths:
  - `/api/auth/login`
  - `/api/auth/admin-login`
  - `/api/auth/forgot-password`
  - `/api/auth/signup`
  - `/api/queue/*`
  - `/api/monitoring/worker`
  - `/admin/*`

Suggested WAF rules:
- challenge high request rates on auth endpoints
- block non-browser abuse on admin paths
- restrict `/api/queue/*` to trusted IPs if applicable
- challenge `/admin/login` and `/admin/mfa` more aggressively than public user routes
- apply managed challenge to repeated `/api/auth/admin-mfa/*` failures

### Active Edge Hardening on `univert.pro`

Applied on 2026-03-09:
- `ssl = strict`
- `always_use_https = on`
- `automatic_https_rewrites = on`
- `browser_check = on`
- `security_level = under_attack`
- `min_tls_version = 1.2`
- `tls_1_3 = on`
- HSTS enabled at Cloudflare edge with preload + includeSubDomains
- Cloudflare Managed Free Ruleset active on `http_request_firewall_managed`
- Custom Cloudflare firewall rules active to:
  - block public access to `/api/queue/worker`, `/api/queue/maintenance`, `/api/monitoring/worker`
  - block sensitive file / dotfile probes such as `/.env`, `/.git/*`, `/composer.json`, `/package.json`, `/next.config.mjs`, `/storage/logs/*`
  - block common scanner exploit paths such as `/wp-*`, `/xmlrpc.php`, `/cgi-bin/*`, `/phpmyadmin*`, `/actuator/*`, `/vendor/phpunit/*`
  - managed-challenge `/admin/login` and `/admin/mfa`
  - block obvious SQLi / traversal probes in URI/query
- Cloudflare free-plan rate-limit rule active for auth surfaces + leaked credential probes

Note:
- `under_attack` is intentionally aggressive and will challenge normal visitors at the edge.
- If the attack window ends and lower friction is preferred, downgrade `security_level` from `under_attack` to `high`.

## Remaining Production Edge Requirements

Still recommended outside app code:
- keep Cloudflare proxied for the public app surface
- keep `/api/queue/*` and `/api/monitoring/*` denied publicly at Nginx and Cloudflare
- keep stricter challenge/rate-limit policies on:
  - `/admin/login`
  - `/admin/mfa`
  - `/api/auth/*`
- keep origin IP restricted wherever possible so traffic reaches the app through Cloudflare first

## Firewall / Host Recommendations

Recommended host-level controls:
- allow only ports 80/443 publicly
- restrict MySQL to localhost/private network
- restrict aaPanel panel port to trusted IPs only
- enable automatic security updates
- use Fail2ban for:
  - Nginx auth abuse
  - SSH
  - aaPanel login attempts

## Secrets Management

Rules:
- do not commit `.env.production`
- rotate secrets on staff/device compromise
- do not reuse the same secret across:
  - auth
  - admin auth
  - cron/webhook
  - encryption

Minimum secret guidance:
- `AUTH_SECRET`: 32+ random bytes
- `ADMIN_AUTH_SECRET`: 32+ random bytes
- `CRON_SECRET`: 32+ random bytes
- `WEBHOOK_SECRET`: 32+ random bytes
- `ENCRYPTION_KEY`: 32+ random bytes or longer

## Recommended Production Checklist

Before launch:
- [ ] `AUTH_SECRET` set
- [ ] `ADMIN_AUTH_SECRET` set
- [ ] `CRON_SECRET` set
- [ ] `WEBHOOK_SECRET` set
- [ ] `ENCRYPTION_KEY` set
- [ ] local admin fallback disabled unless intentionally needed
- [ ] real email provider configured
- [ ] app behind HTTPS only
- [ ] HSTS enabled
- [ ] reverse-proxy rate limits enabled
- [ ] WAF / CDN rules enabled
- [ ] aaPanel API IP allowlist enabled
- [ ] MySQL access restricted
- [ ] Sentry/log monitoring configured
- [ ] admin accounts reviewed
- [ ] every admin has completed MFA enrollment and saved recovery codes
- [ ] internal route IP allowlists enabled at proxy/firewall level
- [ ] `/admin/login` and `/admin/mfa` protected by stricter WAF/rate-limit rules
- [ ] Cloudflare remains orange-cloud proxied for public hostnames

## How To Run Security Verification

Build:
```bash
npm run build
```

Security-focused tests:
```bash
npm run test:security
```

Dependency audit:
```bash
npm run security:deps
```

CI-oriented combined check:
```bash
npm run security:ci
```

Live edge smoke verification:
```bash
npm run security:edge-smoke -- https://your-domain.example
```

## Known Limits

Still requires infra / operational enforcement:
- Network-layer DDoS protection
- Reverse-proxy IP allowlisting for internal endpoints
- Automated secret rotation workflow
- Staff runbook for admin MFA recovery / break-glass access

These must be enforced by infrastructure and operational policy.
