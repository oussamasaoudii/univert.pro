# Ovmon Production Deployment Guide

A comprehensive guide for deploying Ovmon to production with all required services, configurations, and safety checks.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Users (Web Browser)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│         Vercel Edge Network (CDN + Caching)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│      Next.js Application (App Router)                       │
│  ├─ API Routes (/api/*)                                     │
│  ├─ Server Actions (Server-side functions)                  │
│  ├─ Pages & Components (React)                              │
│  └─ Authentication (Supabase)                               │
└────┬──────────────────────────────┬──────────────────┬──────┘
     │                              │                  │
┌────▼──────────────┐  ┌────────────▼──────┐  ┌──────▼──────┐
│   Supabase        │  │   Stripe          │  │  Redis      │
│  (PostgreSQL      │  │   (Payments)      │  │  (Queue)    │
│   + Auth)         │  │                   │  │             │
└────┬──────────────┘  └────────────────────┘  └──────┬──────┘
     │                                                 │
     │  Cron Workers (every minute/5 min)            │
     └────────────┬────────────────────┬─────────────┘
                  │                    │
        ┌─────────▼────────┐  ┌────────▼─────────┐
        │ Queue Processor  │  │ Health Checker   │
        │ (provisioning)   │  │ (monitoring)     │
        └─────────┬────────┘  └──────────────────┘
                  │
        ┌─────────▼────────────────────────┐
        │  aaPanel Server (Website Hosting) │
        │  ├─ Nginx reverse proxy           │
        │  ├─ PHP-FPM                       │
        │  ├─ MySQL                         │
        │  └─ SSL certificates              │
        └──────────────────────────────────┘
```

## Step 1: Set Up External Services

### 1.1 Database (PostgreSQL via Supabase)

```bash
# Create Supabase project
1. Go to https://supabase.com
2. Click "New Project"
3. Enter project name: "ovmon-production"
4. Set password: [strong-password-32-chars+]
5. Select region closest to your users

# Get connection details from Supabase dashboard
6. Settings → Database → Connection String
7. Copy SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

# Run migrations
npm install
npm run db:migrate
```

### 1.2 Authentication Setup

```bash
# In Supabase Dashboard:
1. Authentication → Providers → Email
   - Enable email/password auth
   - Set JWT expiry: 3600 seconds (1 hour)
   - Set refresh token expiry: 604800 seconds (7 days)

2. Authentication → URL Configuration
   - Add Site URL: https://yourdomain.com
   - Add Redirect URL: https://yourdomain.com/auth/callback

3. Authentication → Email Templates
   - Customize confirmation email
   - Customize password reset email
```

### 1.3 Billing Setup (Stripe)

```bash
# Create Stripe Account
1. Go to https://stripe.com
2. Complete account setup
3. Switch to LIVE mode (top left)
4. Developers → API Keys
   - Copy Secret Key (sk_live_*)
   - Copy Publishable Key (pk_live_*)

# Create Products
5. Products → Add Products
   Create 5 plans:
   - Starter: $29.99/month
   - Growth: $99.99/month
   - Pro: $299.99/month
   - Premium: $799.99/month
   - Enterprise: Custom pricing

# Webhook Configuration
6. Developers → Webhooks → Add Endpoint
   - Endpoint URL: https://yourdomain.com/api/webhooks/stripe
   - Events to send: 
     * invoice.created
     * invoice.payment_succeeded
     * invoice.payment_failed
     * customer.subscription.created
     * customer.subscription.updated
     * customer.subscription.deleted
   - Copy webhook secret (whsec_*)
```

### 1.4 Queue System (Upstash Redis)

```bash
# Create Upstash Account
1. Go to https://upstash.com
2. Create Vercel app connection
3. Create Redis database: "ovmon-queue"
4. Copy REST URL and token

# Environment Variables
UPSTASH_REDIS_REST_URL=https://[region].upstash.io/...
UPSTASH_REDIS_REST_TOKEN=...
```

### 1.5 Storage (AWS S3 or Google Cloud Storage)

```bash
# AWS S3 Setup
1. Create S3 bucket: ovmon-backups
2. Enable versioning
3. Create IAM user with S3 permissions
4. Get Access Key ID and Secret Access Key

# OR Google Cloud Storage
1. Create GCS bucket: ovmon-backups
2. Create service account
3. Download JSON credentials

# Environment Variables
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=ovmon-backups
AWS_REGION=us-east-1
```

### 1.6 Email Service (SendGrid or Resend)

```bash
# SendGrid Setup
1. Go to https://sendgrid.com
2. Create account
3. Settings → API Keys → Create API Key
4. Choose "Full Access"
5. Copy API key

# OR Resend Setup
1. Go to https://resend.com
2. Create account
3. API Keys → Create API Key
4. Copy API key

# Environment Variables
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

## Step 2: Provision aaPanel Server

### 2.1 Server Setup

```bash
# Digital Ocean / AWS EC2 / Linode
1. Create Ubuntu 22.04 LTS server (minimum 2GB RAM, 40GB SSD)
2. Note server IP address
3. Create firewall rules:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 8888 (aaPanel)

# SSH into server
ssh root@server_ip

# Update system
apt update && apt upgrade -y

# Install aaPanel
wget -O install.sh http://www.aapanel.com/script/install_7.0_ubuntu.sh
bash install.sh

# Note the admin URL and login credentials
```

### 2.2 aaPanel Configuration

```bash
# Login to aaPanel dashboard at https://server_ip:8888

1. System Settings
   - Set panel port to 8888
   - Enable SSL for panel
   - Create backup user for API

2. Add Site
   - Domain: yourdomain.com
   - PHP version: 8.2 or later
   - MySQL: Yes
   - FTP: No

3. SSL Certificate
   - Use Let's Encrypt
   - Email: your@email.com

4. Create API Token
   - Users → API Tokens → Create
   - Note down the token
```

## Step 3: Configure DNS

### 3.1 Point Domain to aaPanel

```bash
# In your DNS provider (Cloudflare recommended):

1. Create A record
   - Name: yourdomain.com
   - Value: [aaPanel server IP]
   - TTL: 300
   - Proxy: Cloudflare
   - SSL: Full (strict)

2. Create wildcard subdomain
   - Name: *.yourdomain.com
   - Value: [aaPanel server IP]
   - TTL: 300
   - Proxy: Cloudflare

3. Wait for DNS propagation (5-15 minutes)
```

## Step 4: Deploy to Vercel

### 4.1 Connect GitHub Repository

```bash
# Push code to GitHub
git add .
git commit -m "Production deployment"
git push origin main

# Import to Vercel
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Configure project:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Install Command: npm install
```

### 4.2 Add Environment Variables

```bash
# In Vercel Dashboard → Settings → Environment Variables

# Database
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
DATABASE_URL=postgresql://[connection-string]

# Billing
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# aaPanel
AAPANEL_HOST=[server-ip]
AAPANEL_PORT=8888
AAPANEL_USERNAME=admin
AAPANEL_PASSWORD=[password]
AAPANEL_API_TOKEN=[token]

# DNS
DNS_PROVIDER=cloudflare
CLOUDFLARE_API_TOKEN=[api-token]
CLOUDFLARE_ZONE_ID=[zone-id]

# Queue
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=ovmon-backups
AWS_REGION=us-east-1

# Email
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Security
ENCRYPTION_KEY=[32-char-random-string]
WEBHOOK_SECRET=[32-char-random-string]

# Monitoring
SENTRY_DSN=https://[key@host]/[project-id]

# Feature Flags
FEATURE_ENABLE_CUSTOM_DOMAINS=true
FEATURE_ENABLE_SSL_AUTO_RENEWAL=true
FEATURE_ENABLE_BACKUPS=true
FEATURE_ENABLE_EXPORTS=true
FEATURE_ENABLE_MONITORING=true
FEATURE_ENABLE_MANUAL_PROVISIONING=false
```

### 4.3 Deploy

```bash
# Push to main branch
git push origin main

# Vercel will automatically deploy
# Monitor build in https://vercel.com/[team]/ovmon
```

## Step 5: Run Database Migrations

```bash
# After first deployment, run migrations
npm run db:migrate

# Verify migrations completed successfully
npm run db:status
```

## Step 6: Verify Deployment

### 6.1 Health Check

```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2026-03-07T12:00:00Z",
  "services": {
    "database": "healthy",
    "storage": "healthy",
    "queue": "healthy",
    "aapanel": "healthy",
    "dns": "healthy",
    "stripe": "healthy"
  }
}
```

### 6.2 Test Full Flow

```bash
# 1. Sign up as user
# 2. Create website
# 3. Verify provisioning in queue
# 4. Check website deployed to aaPanel
# 5. Add custom domain
# 6. Verify SSL certificate issued
# 7. Test admin panel
```

## Step 7: Set Up Monitoring

### 7.1 Sentry (Error Tracking)

```bash
# Go to https://sentry.io
# Create project for Ovmon
# Copy DSN to SENTRY_DSN environment variable
```

### 7.2 Uptime Monitoring

```bash
# Services to consider:
# - UptimeRobot (free)
# - Pingdom
# - Datadog

# Add monitoring endpoint:
https://yourdomain.com/api/health
```

### 7.3 Create Status Page

```bash
# Use https://www.statuspage.io
# Integrate with Sentry/monitoring tools
# Share status URL with customers
```

## Step 8: Enable Cron Jobs

### 8.1 Update vercel.json

```json
{
  "crons": [
    {
      "path": "/api/queue/worker",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/queue/maintenance",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/monitoring/worker",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Cron jobs will automatically start running after deployment.

## Step 9: Create Admin Users

```bash
# Use Supabase dashboard or API to create admin user:
INSERT INTO admin_users (user_id, email, role, created_at)
VALUES ('[user-id]', 'admin@yourdomain.com', 'owner', now());
```

## Step 10: Enable Backups

```bash
# Configure daily database backups
# In Supabase: Database → Backups
# - Enable daily backups
# - Set 30-day retention
```

## Post-Deployment

### Monitor these metrics:

- Error rate (Sentry dashboard)
- API latency (Vercel Analytics)
- Queue latency (API response times)
- Payment success rate (Stripe dashboard)
- Database load (Supabase dashboard)

### On-call rotation:

Set up on-call team for:
- Critical alerts
- Payment failures
- Infrastructure issues
- Customer escalations

See `PRODUCTION_CHECKLIST.md` for complete pre-launch checklist.
