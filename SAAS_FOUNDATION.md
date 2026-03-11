# Ovmon SaaS Foundation Implementation Guide

This document describes the complete SaaS architecture built into Ovmon, designed for seamless integration with real services and databases.

## Architecture Overview

Ovmon is structured into distinct layers, each replaceable with production implementations:

```
┌─────────────────────────────────────────────────┐
│         UI Components & Pages                    │
│  (Premium design, fully functional UI)           │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│      Business Logic & State Management           │
│  - Auth Context (login/signup/logout)            │
│  - Billing Logic (subscription states)           │
│  - Website Status Logic (provisioning)           │
│  - User Lifecycle Components                     │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│     Server Actions & Repository Layer            │
│  - User/Website/Subscription repositories        │
│  - Server actions for auth & operations          │
│  - Type-safe data access                         │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│   Database / API Layer (TO BE IMPLEMENTED)       │
│  - Supabase / Neon / PostgreSQL                  │
│  - Stripe (billing)                              │
│  - Email service (SendGrid, Resend)              │
│  - Provisioning queue (Bull, RabbitMQ)           │
└─────────────────────────────────────────────────┘
```

## 1. Authentication System

### Current State
- Context-based client-side auth with localStorage
- Mock user creation on signup/signin
- Session expiry tracking
- Role-based access control (user/admin)

### Files
- `lib/auth-types.ts` - Auth type definitions
- `contexts/auth-context.tsx` - Auth state management
- `components/auth/protected-route.tsx` - Protected route wrapper

### Integration Steps

#### Step 1: Choose Auth Provider
Pick one:
- **NextAuth.js** - Full-featured, supports multiple providers
- **Clerk** - Managed auth with built-in UI
- **Auth0** - Enterprise option
- **Supabase Auth** - Built-in with database

#### Step 2: Install Provider
```bash
npm install next-auth  # or your chosen provider
```

#### Step 3: Configure Environment
```env
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
AUTH_PROVIDER_KEY=your_provider_key
```

#### Step 4: Update App Layout
Replace `AuthProvider` in `app/layout.tsx` with your auth provider's wrapper.

#### Step 5: Update Server Actions
Modify `app/actions/user-actions.ts` to use provider's session instead of localStorage.

#### Step 6: Update Components
Replace `useAuth()` hook calls with provider's hook (e.g., `useSession()` for NextAuth.js).

### Authentication Flow
1. User signs up → Mock user created with trial subscription
2. User signs in → Session stored in localStorage
3. Protected routes checked via `ProtectedRoute` component
4. Session expires after 7 days (configurable)

## 2. Database Integration

### Current State
- Mock data in `lib/mock-data.ts`
- Repository pattern in `lib/repositories/`
- All functions have TODO comments showing where to add real queries

### Files
- `lib/repositories/user-repository.ts` - User data access
- `lib/repositories/website-repository.ts` - Website data access
- `lib/repositories/subscription-repository.ts` - Subscription data access

### Database Schema (Required Tables)

```sql
-- Users
CREATE TABLE users (
  id STRING PRIMARY KEY,
  email STRING UNIQUE NOT NULL,
  name STRING NOT NULL,
  password_hash STRING NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  avatar_url STRING,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- Subscriptions
CREATE TABLE subscriptions (
  id STRING PRIMARY KEY,
  user_id STRING NOT NULL REFERENCES users(id),
  plan_id STRING NOT NULL,
  status ENUM('trialing', 'active', 'past_due', 'canceled'),
  stripe_subscription_id STRING,
  current_period_end TIMESTAMP,
  trial_ends_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Websites
CREATE TABLE websites (
  id STRING PRIMARY KEY,
  user_id STRING NOT NULL REFERENCES users(id),
  project_name STRING NOT NULL,
  template_id STRING NOT NULL,
  status ENUM('pending', 'provisioning', 'ready', 'suspended', 'failed'),
  subdomain STRING UNIQUE NOT NULL,
  custom_domain STRING,
  live_url STRING,
  dashboard_url STRING,
  renewal_date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Domains
CREATE TABLE domains (
  id STRING PRIMARY KEY,
  website_id STRING NOT NULL REFERENCES websites(id),
  custom_domain STRING,
  verification_status ENUM('pending', 'verified', 'failed'),
  ssl_status ENUM('pending', 'active', 'expired'),
  is_primary BOOLEAN DEFAULT FALSE
);

-- Invoices
CREATE TABLE invoices (
  id STRING PRIMARY KEY,
  user_id STRING NOT NULL REFERENCES users(id),
  amount DECIMAL NOT NULL,
  status ENUM('paid', 'pending', 'failed', 'refunded'),
  stripe_invoice_id STRING,
  created_at TIMESTAMP
);
```

### Migration Steps

#### Step 1: Choose Database Provider
- **Supabase** - PostgreSQL with built-in auth & realtime
- **Neon** - Serverless PostgreSQL
- **PlanetScale** - MySQL serverless
- **AWS Aurora** - Enterprise option

#### Step 2: Create Tables
Execute the SQL schema above in your database.

#### Step 3: Install Database Client
```bash
npm install @supabase/supabase-js  # for Supabase
# or
npm install @neondatabase/serverless  # for Neon
# or
npm install postgres  # for direct PostgreSQL
```

#### Step 4: Update Repositories
Example for Supabase:
```typescript
// lib/repositories/user-repository.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export const userRepository = {
  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },
  // ... other methods
};
```

#### Step 5: Update Server Actions
Replace mock data calls with repository methods (already done in structure).

## 3. Billing & Subscription

### Current State
- Subscription state logic in `lib/billing-logic.ts`
- Subscription types in `lib/types.ts`
- Mock subscription data in mock-data.ts
- Trial/active/past_due/canceled states

### Files
- `lib/billing-logic.ts` - Business logic
- `lib/repositories/subscription-repository.ts` - Data access
- `components/user-lifecycle/trial-warnings.tsx` - UI components

### Integration Steps

#### Step 1: Set Up Stripe
```bash
npm install stripe @stripe/stripe-js
```

#### Step 2: Configure Environment
```env
STRIPE_PUBLIC_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Step 3: Create Webhook Handler
```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === 'customer.subscription.updated') {
    // Update subscription in database
  }
  
  return new Response('ok');
}
```

#### Step 4: Update Subscription Repository
Replace mock with Stripe API calls.

#### Step 5: Handle Plan Upgrades
Add checkout session creation in server actions.

## 4. Website Provisioning

### Current State
- Provisioning status in `lib/types.ts`
- Website lifecycle logic in `lib/website-status-logic.ts`
- Mock provisioning data with step tracking
- Status visualization in provisioning pages

### Files
- `lib/website-status-logic.ts` - Status management
- `app/dashboard/provisioning/` - Provisioning UI
- `app/admin/provisioning-queue/` - Admin queue

### Integration Steps

#### Step 1: Set Up Job Queue
```bash
npm install bull  # or use RabbitMQ, etc.
```

#### Step 2: Create Provisioning Worker
```typescript
// lib/workers/provisioning-worker.ts
import Queue from 'bull';

const provisioningQueue = new Queue('website-provisioning', {
  redis: { url: process.env.REDIS_URL }
});

provisioningQueue.process(async (job) => {
  const { websiteId, templateId } = job.data;
  
  // Run provisioning steps
  // 1. Copy template files
  // 2. Create database
  // 3. Configure environment
  // 4. Deploy to server
  // 5. Setup domain
  // 6. Issue SSL cert
});
```

#### Step 3: Trigger Jobs on Website Creation
In `app/actions/website-actions.ts`, call provisioning queue.

## 5. Email Notifications

### Services
- **SendGrid** - High volume, reliable
- **Resend** - React email templates
- **Mailgun** - Developer-friendly

### Integration Example (Resend)
```bash
npm install resend
```

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTrialEndingEmail(email: string) {
  await resend.emails.send({
    from: 'noreply@ovmon.com',
    to: email,
    subject: 'Your trial is ending soon',
    html: '<h1>Upgrade to keep your websites live</h1>'
  });
}
```

## 6. User Lifecycle Management

### Current State
- User states: No websites, Active, Trial ending, Subscription expired
- Website states: Pending, Provisioning, Ready, Suspended, Failed
- Trial warning components showing time remaining
- Onboarding flow for new users

### Components
- `components/user-lifecycle/onboarding-flow.tsx`
- `components/user-lifecycle/trial-warnings.tsx`

### States to Handle

**New User (Post-Signup)**
```
1. Show onboarding flow
2. Prompt template selection
3. Launch first website
4. Redirect to provisioning status
```

**Trial Ending (3 days or less)**
```
1. Show trial warning banner
2. Prompt payment method setup
3. Offer plan selection
4. Guide to checkout
```

**Trial Expired**
```
1. Suspend websites
2. Show upgrade prompt
3. Lock dashboard except billing
4. Offer trial extension option
```

**Subscription Active**
```
1. Full dashboard access
2. Can launch unlimited (based on plan)
3. Show renewal date
4. Offer plan upgrades
```

**Subscription Past Due**
```
1. Show payment failed notice
2. Lock provisioning
3. Allow update payment method
4. Reminder emails daily
```

## 7. Admin Dashboard

### Current State
- Complete admin pages for infrastructure management
- Server monitoring with real-time metrics
- Provisioning queue management
- Backup and restore operations
- Alert system for infrastructure

### Files
- `app/admin/` - All admin pages
- `components/admin/` - Admin components

### Functionality
- View all users and their subscriptions
- Monitor servers and resource usage
- Manage provisioning queue
- Handle failed deployments
- View system alerts
- Generate revenue reports

## Migration Checklist

### Phase 1: Authentication (Week 1)
- [ ] Set up auth provider (Clerk/NextAuth/Auth0)
- [ ] Replace context with provider
- [ ] Set up password reset email
- [ ] Test login/signup flow
- [ ] Update protected routes

### Phase 2: Database (Week 2-3)
- [ ] Set up database (Supabase/Neon)
- [ ] Create tables from schema
- [ ] Update repositories with real queries
- [ ] Migrate mock data to database
- [ ] Add database error handling

### Phase 3: Billing (Week 4)
- [ ] Set up Stripe account
- [ ] Create webhook handler
- [ ] Implement checkout flow
- [ ] Handle subscription webhooks
- [ ] Add plan limit enforcement

### Phase 4: Provisioning (Week 5-6)
- [ ] Set up job queue (Bull/RabbitMQ)
- [ ] Create provisioning worker
- [ ] Integrate with cloud provider (DO/Linode/AWS)
- [ ] Add status tracking
- [ ] Implement retry logic

### Phase 5: Notifications (Week 7)
- [ ] Set up email service
- [ ] Add transactional emails
- [ ] Add SMS notifications (optional)
- [ ] Implement notification preferences

### Phase 6: Polish & Launch (Week 8)
- [ ] Security audit
- [ ] Performance optimization
- [ ] Staging environment testing
- [ ] Monitoring setup
- [ ] Launch!

## Environment Variables Needed

```env
# Database
DATABASE_URL=your_database_url

# Authentication
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
AUTH_PROVIDER_KEY=your_key

# Stripe
STRIPE_PUBLIC_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...
# or
SENDGRID_API_KEY=SG...

# Infrastructure/Cloud
DIGITALOCEAN_TOKEN=dop_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Queue
REDIS_URL=redis://...

# Notifications
SLACK_WEBHOOK_URL=https://...
```

## File Structure Reference

```
ovmon/
├── lib/
│   ├── auth-types.ts           # Auth type definitions
│   ├── types.ts                # Domain types
│   ├── billing-logic.ts        # Subscription logic
│   ├── website-status-logic.ts # Website state logic
│   ├── api-service.ts          # Mock API (reference)
│   ├── repositories/           # Data access layer
│   │   ├── user-repository.ts
│   │   ├── website-repository.ts
│   │   └── subscription-repository.ts
│   └── middleware-config.ts    # Auth middleware config
│
├── contexts/
│   └── auth-context.tsx        # Auth state management
│
├── components/
│   ├── auth/
│   │   └── protected-route.tsx
│   └── user-lifecycle/
│       ├── onboarding-flow.tsx
│       └── trial-warnings.tsx
│
├── app/
│   ├── actions/
│   │   ├── user-actions.ts
│   │   └── website-actions.ts
│   ├── auth/                   # Auth pages
│   ├── dashboard/              # User pages
│   └── admin/                  # Admin pages
│
└── public/                     # Static assets
```

## Support & Questions

For questions about implementation:
1. Check ARCHITECTURE.md for data flow
2. Review repository files for data access patterns
3. Check server actions for operation examples
4. Review components for UI patterns

This foundation is designed to be production-ready with minimal changes needed to integrate real services.
