# Complete Environment Setup Guide

## Overview

This document covers all environment variables required for the Ovmon (univert.pro) platform. The configuration supports both development and production environments.

## Application Configuration

```env
APP_ENV=local                    # Development environment
APP_NAME=Ovmon                  # Application name
APP_MODE=live                   # Application mode
APP_DEBUG=false                 # Debug mode
APP_TIMEZONE=Africa/Algiers     # Server timezone
NEXT_PUBLIC_APP_URL=https://univert.pro  # Public application URL
NODE_ENV=development            # Node environment
```

## Database Configuration (MySQL)

```env
DB_CONNECTION=mysql
DB_HOST=localhost               # Database host
DB_PORT=3306                    # MySQL port
DB_DATABASE=univert_pro         # Database name
DB_USERNAME=root                # Database user
DB_PASSWORD=                    # Database password (empty for local)
DATABASE_URL=mysql://user:password@localhost:3306/univert_pro
```

**Setup:**
```bash
# Create database
mysql -u root -e "CREATE DATABASE univert_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
mysql -u root univert_pro < scripts/030_countries_and_pricing.sql
mysql -u root univert_pro < scripts/999_seed_test_data.sql
```

## Logging

```env
LOG_CHANNEL=stack               # Logging channel
LOG_LEVEL=debug                 # Log level (debug, info, warning, error)
```

## Cache Configuration (Redis)

```env
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=                 # Empty if no password
```

**Setup:**
```bash
# Install Redis
brew install redis              # macOS
sudo apt-get install redis-server  # Ubuntu/Debian
docker run -d -p 6379:6379 redis  # Docker

# Start Redis
redis-server
```

## Session Configuration (Redis)

```env
SESSION_DRIVER=redis
SESSION_DOMAIN=.univert.pro     # Cookie domain
SESSION_LIFETIME=120            # Session timeout in minutes
MEMCACHED_HOST=127.0.0.1
```

## Real-time Messaging (Pusher)

```env
# Server-side
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_pusher_app_id
PUSHER_APP_KEY=your_pusher_app_key
PUSHER_APP_SECRET=your_pusher_app_secret
PUSHER_HOST=api-eu.pusher.com
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=eu

# Client-side (public)
NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_app_key
NEXT_PUBLIC_PUSHER_HOST=api-eu.pusher.com
NEXT_PUBLIC_PUSHER_PORT=443
NEXT_PUBLIC_PUSHER_SCHEME=https
NEXT_PUBLIC_PUSHER_APP_CLUSTER=eu
```

**Setup:**
1. Create account at https://pusher.com
2. Get credentials from your app dashboard
3. Update the environment variables

## Email Service (Resend)

```env
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Setup:**
1. Sign up at https://resend.com
2. Generate API key from dashboard
3. Verify your sender domain

## Stripe Configuration

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_URL=https://yourdomain.com/api/stripe/webhooks
```

**Setup:**
1. Create account at https://stripe.com
2. Get test keys from dashboard
3. Configure webhook endpoint

## OAuth Providers

### Google OAuth

```env
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
```

**Setup:**
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Set authorized redirect URIs: `https://yourdomain.com/api/auth/oauth/google/callback`

### GitHub OAuth

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**Setup:**
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth app
3. Set Authorization callback URL: `https://yourdomain.com/api/auth/oauth/github/callback`

## AWS S3 Storage

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your_bucket_name
AWS_USE_PATH_STYLE_ENDPOINT=false
# AWS_ENDPOINT=https://s3.amazonaws.com  # Optional for S3-compatible services
```

**Setup:**
1. Create AWS account at https://aws.amazon.com
2. Create IAM user with S3 permissions
3. Create S3 bucket
4. Get access keys from IAM dashboard

## Authentication

```env
JWT_SECRET=your_jwt_secret_key_min_32_characters_long
SESSION_SECRET=your_session_secret_key_min_32_characters_long
```

**Generate secure keys:**
```bash
# Generate a random 32-character string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Filesystem & Queue

```env
FILESYSTEM_DISK=local           # Local or S3
QUEUE_CONNECTION=database       # Database-based queue
```

## Vercel Blob Storage (Optional)

```env
BLOB_READ_WRITE_TOKEN=your_blob_token_here
```

## AI/LLM Configuration (Optional)

```env
# AI_GATEWAY_API_KEY=your_ai_gateway_key_here  # For non-default providers
```

The Vercel AI Gateway is available by default with OpenAI, Anthropic, Google, AWS Bedrock, and Fireworks AI.

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Use production domain for `NEXT_PUBLIC_APP_URL`
- [ ] Configure all OAuth redirect URIs to production domain
- [ ] Use production Stripe keys (not test keys)
- [ ] Enable HTTPS for all external services
- [ ] Set strong JWT and SESSION secrets (32+ characters)
- [ ] Configure database with proper backups
- [ ] Enable Redis persistence
- [ ] Set up monitoring and logging
- [ ] Review security headers and CORS settings
- [ ] Test all integrations in production environment

## Testing Credentials

Test user accounts created during setup:

**Regular User:**
- Email: `user@test.com`
- Password: `Test@123456`

**Admin User:**
- Email: `admin@test.com`
- Password: `Admin@123456`

## Troubleshooting

### Database Connection Failed
- Ensure MySQL is running
- Check `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`
- Verify database exists: `mysql -u root -e "SHOW DATABASES;"`

### Redis Connection Failed
- Ensure Redis is running: `redis-cli ping` (should return PONG)
- Check `REDIS_HOST` and `REDIS_PORT`

### Pusher Not Working
- Verify credentials in Pusher dashboard
- Check cluster name matches your app
- Ensure `PUSHER_HOST` includes correct region

### Email Not Sending
- Verify `RESEND_API_KEY` is correct
- Check sender domain is verified
- Review email templates for HTML issues

### OAuth Redirect URI Mismatch
- Ensure redirect URI exactly matches OAuth app settings
- Includes protocol (https://)
- Includes full path (/api/auth/oauth/[provider]/callback)
