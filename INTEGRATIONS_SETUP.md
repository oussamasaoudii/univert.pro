# Integration Setup Guide

This document provides setup instructions for all integrations added to univert.pro.

## Table of Contents

1. [Vercel Blob Storage](#vercel-blob-storage)
2. [Resend Email Service](#resend-email-service)
3. [Stripe Payments](#stripe-payments)
4. [OAuth Providers](#oauth-providers)
5. [AI/LLM Features](#aillm-features)
6. [Database Migrations](#database-migrations)

---

## Vercel Blob Storage

### Overview
Vercel Blob Storage is used for storing user avatars and website assets.

### Setup

1. **Already integrated** - Blob storage is connected via Vercel integration
2. **Verify token** - Check that `BLOB_READ_WRITE_TOKEN` is set in environment variables
3. **API endpoints available**:
   - `POST /api/storage/upload` - Upload files
   - `GET /api/storage/file?pathname=...` - Retrieve files
   - `DELETE /api/storage/delete` - Delete files

### Usage Example

```typescript
// Upload avatar
const formData = new FormData();
formData.append('file', avatarFile);

const response = await fetch('/api/storage/upload', {
  method: 'POST',
  body: formData,
});

const { pathname } = await response.json();
```

---

## Resend Email Service

### Overview
Resend is configured for transactional emails (welcome, password reset, billing, trial warnings).

### Setup

1. **Get API Key**:
   - Visit https://resend.com
   - Create an account or sign in
   - Go to Settings → API Keys
   - Copy your API key

2. **Set Environment Variables**:
   ```
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

3. **Verify email domain** (production):
   - Add your domain to Resend
   - Add DNS records as provided
   - Once verified, you can send from any address on that domain

### Email Templates

Available templates in `lib/email/templates/`:
- `welcome.ts` - New user welcome email
- `subscription-confirmation.ts` - Subscription confirmation
- `trial-ending.ts` - Trial expiration warning
- `invoice.ts` - Invoice email
- `password-reset.ts` - Password reset link (in `password-reset.ts`)

### API Usage

```typescript
import { sendEmail } from '@/lib/email/send';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'welcome',
  data: {
    firstName: 'John',
    email: 'john@example.com',
  },
});
```

---

## Stripe Payments

### Overview
Stripe handles all payment processing, subscriptions, and billing portal.

### Setup

1. **Get Stripe Keys**:
   - Visit https://dashboard.stripe.com
   - Go to Settings → API Keys
   - Copy both publishable and secret keys

2. **Set Environment Variables**:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

3. **Create webhook endpoint**:
   - In Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhooks`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

4. **Configure pricing plans**:
   - Plans are defined in `lib/stripe/products.ts`
   - Update product prices and features as needed
   - Product IDs must match between frontend and Stripe dashboard

### Available Endpoints

- `POST /api/stripe/checkout` - Create checkout session
- `GET /api/stripe/portal` - Redirect to billing portal
- `POST /api/stripe/webhooks` - Webhook handler (Stripe notifications)

### Usage Example

```typescript
// Create checkout session
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  body: JSON.stringify({
    userId: user.id,
    productId: 'pro-plan',
    successUrl: '/dashboard/billing?success=true',
    cancelUrl: '/pricing',
  }),
});

const { checkoutUrl } = await response.json();
window.location.href = checkoutUrl;
```

---

## OAuth Providers

### Overview
OAuth allows users to sign in with Google or GitHub accounts.

### Google OAuth Setup

1. **Create OAuth credentials**:
   - Visit https://console.cloud.google.com
   - Create a new project
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/oauth/google/callback` (development)
     - `https://yourdomain.com/api/auth/oauth/google/callback` (production)

2. **Set Environment Variables**:
   ```
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

### GitHub OAuth Setup

1. **Create OAuth app**:
   - Visit https://github.com/settings/developers
   - New OAuth App
   - Application name: "UniVert"
   - Homepage URL: `http://localhost:3000` or your domain
   - Authorization callback URL: `http://localhost:3000/api/auth/oauth/github/callback`

2. **Set Environment Variables**:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

### How It Works

1. User clicks "Sign in with Google/GitHub"
2. Redirects to `/api/auth/oauth/[provider]`
3. OAuth callback handler at `/api/auth/oauth/[provider]/callback` receives code
4. System creates or links user account
5. Sets session and redirects to dashboard

### Database

OAuth accounts are stored in `oauth_accounts` table with:
- `user_id` - User ID
- `provider` - "google" or "github"
- `provider_user_id` - External provider's user ID
- `email` - Email from provider
- `name` - Full name from provider
- `avatar_url` - Profile picture URL
- `access_token` - OAuth access token (encrypted)
- `refresh_token` - OAuth refresh token (encrypted)
- `created_at`, `updated_at` - Timestamps

---

## AI/LLM Features

### Overview
AI features use Vercel's AI Gateway with OpenAI models for:
- Chat support widget
- Content generation
- Plan/template recommendations

### Configuration

The AI Gateway works out-of-the-box with Vercel AI SDK. No additional setup required for default models (OpenAI).

### Available Endpoints

- `POST /api/ai/chat` - Chat completions with streaming
- `POST /api/ai/generate` - Generate website content
- `POST /api/ai/recommend` - Get plan recommendations

### Features

#### 1. Chat Widget
- Floating chat window in dashboard
- Streams responses in real-time
- Accessible via `<ChatWidget />` component

#### 2. Content Generator
- Generate website descriptions
- Create page titles and meta descriptions
- Available in website editor

#### 3. Plan Recommender
- Suggests best plan based on user needs
- Uses conversational flow
- Integrated in pricing/signup flow

### API Usage

```typescript
// Chat API
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'How do I set up my website?' }],
  }),
});

// Stream response
const reader = response.body?.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = new TextDecoder().decode(value);
  // Handle streamed text
}
```

---

## Database Migrations

### Required Tables

Run the following SQL migration scripts on your MySQL database:

1. **File Storage** (`scripts/020_file_storage.sql`):
   - Adds `avatar_url` column to users table
   - Creates `uploaded_files` table for tracking uploads

2. **Stripe Integration** (`scripts/021_stripe_integration.sql`):
   - Creates `stripe_customers` table
   - Creates `stripe_events` table for webhook logging
   - Adds `stripe_customer_id` to users

3. **OAuth Accounts** (`scripts/022_oauth_accounts.sql`):
   - Creates `oauth_accounts` table
   - Links OAuth accounts to users

### Running Migrations

```bash
# Using mysql CLI
mysql -u root -p database_name < scripts/020_file_storage.sql
mysql -u root -p database_name < scripts/021_stripe_integration.sql
mysql -u root -p database_name < scripts/022_oauth_accounts.sql
```

---

## Environment Variables Summary

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `BLOB_READ_WRITE_TOKEN` | File storage | Yes | `eyJ...` |
| `RESEND_API_KEY` | Email service | Yes | `re_...` |
| `RESEND_FROM_EMAIL` | Email sender | Yes | `noreply@univert.pro` |
| `STRIPE_SECRET_KEY` | Payment processing | Yes | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook validation | Yes | `whsec_...` |
| `GOOGLE_CLIENT_ID` | Google OAuth | No | `123...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | No | `GOCSPX...` |
| `GITHUB_CLIENT_ID` | GitHub OAuth | No | `abc123def456` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth | No | `ghp_...` |

---

## Testing

### Local Development

1. Start with `.env.local` template
2. Fill in test API keys from Stripe/Google/GitHub/Resend
3. Use Stripe test mode (always use `sk_test_*` keys)
4. Test OAuth with localhost redirects

### Stripe Testing

Use Stripe test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Require auth: `4000 0025 0000 3155`

---

## Troubleshooting

### Email not sending?
- Check `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set
- Verify domain is added to Resend (production)
- Check email logs in Resend dashboard

### OAuth not working?
- Verify callback URLs match exactly (including protocol)
- Check client ID/secret are correct
- Ensure redirect to `/dashboard` after login is allowed

### Stripe webhooks not triggering?
- Verify webhook URL is accessible from internet
- Check webhook secret is correctly set
- Monitor logs in Stripe Dashboard → Webhooks

### File uploads failing?
- Verify `BLOB_READ_WRITE_TOKEN` is set
- Check file size limits (adjust as needed)
- Ensure user is authenticated for private uploads

---

## Next Steps

1. Add environment variables to Vercel project settings
2. Run database migrations
3. Test each integration in development
4. Deploy to staging for testing
5. Update webhook URLs for production
6. Go live!
