# Ovmon Production Deployment - Go-Live Checklist

This checklist ensures Ovmon is ready for production deployment. Complete all items before launching to production.

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.production.template` to `.env.local` (NEVER commit secrets)
- [ ] Fill in all required environment variables from the template
- [ ] Validate all secrets are at least 32 characters long
- [ ] Encrypt sensitive values if stored in version control (use Vercel Secrets)
- [ ] Test environment loading: `npm run test:env`

### 2. Database & Storage
- [ ] PostgreSQL database provisioned and tested
- [ ] Database connection string validated
- [ ] All database migrations have been run
- [ ] Run: `npm run db:migrate`
- [ ] Backup automated: Schedule daily backups to S3/GCS
- [ ] Storage bucket created and permissions configured
- [ ] Test object upload/download to storage provider

### 3. Authentication & Security
- [ ] Supabase project created and configured
- [ ] Authentication enabled with email/password
- [ ] (Optional) Social auth configured (Google, GitHub)
- [ ] SUPABASE_SERVICE_ROLE_KEY stored securely
- [ ] JWT tokens configured with secure expiry (15 minutes)
- [ ] Refresh token expiry set (7-30 days)
- [ ] MFA considered for admin accounts
- [ ] ENCRYPTION_KEY (32+ characters) generated and stored securely
- [ ] WEBHOOK_SECRET generated and stored securely

### 4. Billing & Payments
- [ ] Stripe account created and in Live mode
- [ ] STRIPE_SECRET_KEY (sk_live_*) configured
- [ ] STRIPE_PUBLISHABLE_KEY (pk_live_*) configured
- [ ] STRIPE_WEBHOOK_SECRET configured for webhook verification
- [ ] Webhook endpoint registered at Stripe: https://yourdomain.com/api/webhooks/stripe
- [ ] All 5 billing plans created in Stripe
- [ ] Test transaction completed end-to-end
- [ ] Refund process tested
- [ ] Email receipts configured

### 5. aaPanel Provider
- [ ] aaPanel server provisioned and configured
- [ ] AAPANEL_HOST set to server IP/domain
- [ ] AAPANEL_PORT configured (default: 8888)
- [ ] AAPANEL_API_TOKEN created with required permissions
- [ ] aaPanel security hardened:
  - [ ] Change default admin password
  - [ ] Enable SSL for aaPanel dashboard
  - [ ] Configure firewall rules
  - [ ] Disable unnecessary services
- [ ] Test provisioning: Deploy a test website
- [ ] Verify website is accessible at test domain

### 6. Domain Management
- [ ] DNS provider account created (Cloudflare recommended)
- [ ] CLOUDFLARE_API_TOKEN or equivalent generated
- [ ] CLOUDFLARE_ZONE_ID configured
- [ ] DNS provider API tested for creating/updating records
- [ ] Platform subdomain configured: `*.yourdomain.com` → aaPanel server
- [ ] SSL/TLS in Cloudflare set to "Full (strict)"
- [ ] DNSSEC enabled (optional but recommended)

### 7. SSL/TLS Certificates
- [ ] Let's Encrypt account configured
- [ ] LETSENCRYPT_EMAIL set to contact email
- [ ] LETSENCRYPT_API_ENDPOINT pointing to production
- [ ] Test SSL certificate request and renewal
- [ ] Verify certificate auto-renewal is working
- [ ] Certificate expiry alerts configured

### 8. Queue & Workers
- [ ] Redis provisioned (Upstash for serverless)
- [ ] REDIS_URL or UPSTASH_REDIS_REST_URL configured
- [ ] Redis tested: `npm run test:queue`
- [ ] Queue worker cron job enabled in vercel.json
- [ ] Monitor queue health: `/api/queue/status`
- [ ] Configure queue retry policies (max 3 attempts)
- [ ] Dead-letter queue reviewed and monitored

### 9. Email & Notifications
- [ ] Email provider configured (SendGrid or Resend)
- [ ] SENDGRID_API_KEY or RESEND_API_KEY configured
- [ ] Test email sent successfully
- [ ] Email templates reviewed:
  - [ ] Welcome email
  - [ ] Billing confirmations
  - [ ] Alert notifications
  - [ ] Support tickets
- [ ] Unsubscribe links working
- [ ] Email spam score tested

### 10. Monitoring & Observability
- [ ] Sentry configured (SENTRY_DSN)
- [ ] Error tracking tested
- [ ] Alerting rules configured:
  - [ ] High error rate (>5%)
  - [ ] Database errors
  - [ ] Payment failures
  - [ ] Queue failures
- [ ] Health check endpoint verified: `/api/health`
- [ ] Monitoring dashboard created
- [ ] Log aggregation configured (if needed)

### 11. Feature Flags
- [ ] All required features enabled:
  - [ ] FEATURE_ENABLE_CUSTOM_DOMAINS=true
  - [ ] FEATURE_ENABLE_SSL_AUTO_RENEWAL=true
  - [ ] FEATURE_ENABLE_BACKUPS=true
  - [ ] FEATURE_ENABLE_EXPORTS=true
  - [ ] FEATURE_ENABLE_MONITORING=true
  - [ ] FEATURE_ENABLE_MANUAL_PROVISIONING=false (for safety)

### 12. Rate Limiting & Security
- [ ] Rate limiting configured:
  - [ ] RATE_LIMIT_REQUESTS_PER_MINUTE=100
  - [ ] RATE_LIMIT_BURST_SIZE=10
- [ ] Admin routes protected with role verification
- [ ] Input validation enabled on all endpoints
- [ ] CORS configured correctly for your domain
- [ ] CSRF protection enabled
- [ ] Security headers configured:
  - [ ] Content-Security-Policy
  - [ ] X-Frame-Options
  - [ ] X-Content-Type-Options
  - [ ] Strict-Transport-Security

### 13. Deployment Infrastructure
- [ ] Vercel deployment configured
- [ ] Environment variables set in Vercel dashboard
- [ ] Database SSL connection required
- [ ] All secrets stored in Vercel Secrets, not in .env
- [ ] Build size checked (< 250MB recommended)
- [ ] Cold start time monitored
- [ ] Auto-scaling configured if needed
- [ ] CDN enabled for static assets

### 14. Performance & Optimization
- [ ] Database indexes created for frequent queries
- [ ] API response time monitored
- [ ] Cache headers configured
- [ ] Image optimization enabled
- [ ] Database connection pooling configured
- [ ] Load testing performed (simulate 100+ concurrent users)

### 15. Backup & Disaster Recovery
- [ ] Automated backups enabled (daily)
- [ ] Backup retention policy set (30+ days)
- [ ] Restore process tested
- [ ] Backup encryption enabled
- [ ] Disaster recovery runbook created
- [ ] RTO (Recovery Time Objective): 1 hour
- [ ] RPO (Recovery Point Objective): 1 day

### 16. Admin & Support
- [ ] Admin user created with strong password
- [ ] Admin dashboard tested
- [ ] Support contact information configured
- [ ] SLA (Service Level Agreement) documented
- [ ] On-call rotation established
- [ ] Incident response process documented

### 17. Legal & Compliance
- [ ] Terms of Service finalized
- [ ] Privacy Policy compliant with GDPR/CCPA
- [ ] Data processing agreement reviewed
- [ ] Payment Card Industry (PCI) compliance verified
- [ ] Audit logging enabled
- [ ] Data retention policies configured

### 18. Documentation
- [ ] README updated with production deployment instructions
- [ ] Architecture diagram created
- [ ] API documentation complete
- [ ] Database schema documented
- [ ] Team runbooks created:
  - [ ] How to scale
  - [ ] How to handle incidents
  - [ ] How to roll back changes
  - [ ] How to add admins

### 19. Final Testing
- [ ] User registration & login tested
- [ ] Website provisioning end-to-end tested
- [ ] Domain registration tested
- [ ] SSL certificate generation tested
- [ ] Billing & payment tested
- [ ] Admin operations tested
- [ ] Backup & restore tested
- [ ] Queue workers functioning
- [ ] Health checks passing
- [ ] Smoke tests run: `npm run test:smoke`

### 20. Go-Live
- [ ] Maintenance mode set up for emergency shutdowns
- [ ] Status page created (https://status.yourdomain.com)
- [ ] Runbooks distributed to team
- [ ] On-call notifications tested
- [ ] Customer communication plan ready
- [ ] Gradual rollout plan (start with 10% of users)
- [ ] Monitoring dashboard live and being watched

---

## Post-Deployment Monitoring

After going live, monitor these metrics:

- [ ] Error rate (target: < 0.1%)
- [ ] API response time (target: < 500ms p95)
- [ ] Database connection pool utilization (target: < 70%)
- [ ] Queue processing latency (target: < 60s)
- [ ] Payment success rate (target: > 99%)
- [ ] Website uptime (target: 99.9%)
- [ ] SSL certificate renewal (auto)

## Critical Incident Response

If critical issues occur:

1. Enable maintenance mode: Call `enableMaintenanceMode()`
2. Investigate root cause
3. Prepare hotfix
4. Deploy with feature flag if possible
5. Disable maintenance mode
6. Post-mortem within 48 hours

---

## Support & Escalation

- **Page on-call**: [your escalation process]
- **Security issues**: [your security team contact]
- **Billing issues**: [your billing team contact]
- **Vendor support**: [list vendors with SLAs]

---

**Last Updated**: 2026-03-07
**Status**: Ready for Review
