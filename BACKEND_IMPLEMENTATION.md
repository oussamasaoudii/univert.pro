# Ovmon Backend Implementation Guide

This document describes the production-ready backend foundation built for Ovmon using Supabase and Next.js server actions.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│              (UI Components, Server Components)              │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  Server Actions & Routes                     │
│  (app/actions/ - Launch website, admin actions, etc)         │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│              Database Access Layer (lib/db/)                 │
│  (users, websites, templates, subscriptions, etc)            │
│              - Type-safe queries                             │
│              - RLS-protected                                 │
│              - Consistent error handling                      │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│            Supabase (PostgreSQL + Auth)                      │
│  - Real-time database with RLS policies                      │
│  - Built-in JWT authentication                              │
│  - Row-level security for data isolation                    │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

The application uses 8 main tables:

### 1. `profiles` (extends auth.users)
User profile data with role-based access.
- Auto-created via trigger on user signup
- RLS policies: users see own, admins see all

### 2. `subscriptions`
Tracks user subscription status and trial period.
- Status: trialing, active, past_due, canceled, ended
- Trial auto-expires after 14 days
- Stripe integration ready

### 3. `templates`
Available website templates for users to choose from.
- Public templates visible to all users
- Admin can create/update via `upsertTemplate`
- Categories: SaaS, Portfolio, E-commerce, etc.
- Stacks: Next.js, Laravel, WordPress

### 4. `websites`
User websites created from templates.
- Status flow: pending → provisioning → ready
- Each website gets a subdomain + live_url
- Custom domains supported via domains table
- Provisioning progress tracked 0-100%

### 5. `provisioning_jobs`
Tracks the deployment progress of each website.
- Status: pending → running → completed/failed
- Progress 0-100% with current_step
- Admin processes jobs from provisioning queue
- Job completion updates website status

### 6. `domains`
Custom domains connected to websites.
- Tracks DNS verification status
- SSL certificate status
- Primary domain marked for routing
- Multiple domains per website supported

### 7. `support_tickets`
Customer support request management.
- Priority: low, medium, high, urgent
- Status: open, in_progress, closed, waiting_customer
- User-specific access via RLS

### 8. `invoices`
Billing records tied to subscriptions.
- Status: draft, open, paid, void, uncollectible
- Stripe integration ready
- Payment date tracking

## File Structure

```
lib/
├── supabase/
│   ├── client.ts           # Browser-side Supabase client
│   ├── server.ts           # Server-side Supabase client
│   └── middleware.ts       # Token refresh logic
├── db/
│   ├── types.ts            # Database row types
│   ├── users.ts            # User queries
│   ├── websites.ts         # Website CRUD
│   ├── templates.ts        # Template queries
│   ├── subscriptions.ts    # Subscription state
│   ├── provisioning.ts     # Job management
│   ├── domains.ts          # Domain management
│   ├── support.ts          # Ticket management
│   ├── invoices.ts         # Billing queries
│   └── dashboard-loaders.ts # Data loading utilities
├── auth-guard.ts           # Route protection (requireAuth, requireAdmin)
└── middleware-config.ts    # Route protection configuration

app/
├── auth/
│   ├── login/page.tsx      # Supabase login
│   ├── signup/page.tsx     # Supabase signup
│   └── error/page.tsx      # Auth errors
├── dashboard/layout.tsx    # Protected: requireAuth()
├── admin/layout.tsx        # Protected: requireAdmin()
└── actions/
    ├── launch-website.ts   # User: launch website flow
    ├── admin-actions.ts    # Admin: manage provisioning
    └── website-actions.ts  # User: manage own websites

scripts/
├── 001_create_profiles.sql
├── 002_create_subscriptions.sql
├── 003_create_templates.sql
├── 004_create_websites.sql
├── 005_create_provisioning.sql
└── 006_create_support.sql

middleware.ts              # Route middleware (token refresh)
```

## Key Features Implemented

### 1. Authentication with Supabase
- Email/password signup with email confirmation
- Session management with automatic refresh
- User metadata for roles (user, admin)
- Protected routes via middleware

### 2. Role-Based Access Control
- `requireAuth()` - Redirect to login if not authenticated
- `requireAdmin()` - Redirect to dashboard if not admin
- RLS policies on all tables for data isolation
- Admin can see all users' data, users see only their own

### 3. Website Launch Flow
```
User clicks "Launch Website"
  → Select template
  → Enter details (name, subdomain)
  → Submit via launchWebsite() server action
    → Create website record (status=pending)
    → Create provisioning_job (status=pending)
    → Return jobId to client
  → Show provisioning page
  → Job moves to provisioning queue
  → Admin approves and processes
    → Job status → running
    → Website status → provisioning
    → Update progress 10%, 25%, 50%, 75%, 90%
  → Job completes
    → Job status → completed
    → Website status → ready
    → User can access live_url
```

### 4. Admin Provisioning Management
- `getPendingProvisioningQueue()` - Get all pending jobs
- `approveWebsiteProvisioning()` - Start deployment
- `updateProvisioningProgress()` - Simulate progress
- `completeProvisioning()` - Mark as ready
- `failProvisioning()` - Handle errors

### 5. Data Access Layer
All database queries follow consistent patterns:

```typescript
// Server-side only (uses createClient from @/lib/supabase/server)
export async function getWebsiteById(websiteId: string): Promise<WebsiteRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("websites")
    .select("*")
    .eq("id", websiteId)
    .single();

  if (error) {
    console.error("[db] Error fetching website:", error);
    return null;
  }

  return data as WebsiteRow;
}
```

- Centralized error handling
- Type-safe with Zod (optional)
- No direct DB access from client
- All queries respect RLS policies

### 6. Server Actions for Mutations
```typescript
export async function launchWebsite(input: {...}): Promise<LaunchWebsiteResult> {
  // User action - creates website + provisioning job
}

export async function approveWebsiteProvisioning(jobId: string): Promise<{...}> {
  // Admin action - starts deployment
}
```

- Type-safe inputs/outputs
- Authentication checks built-in
- Error messages for clients
- Optimistic updates ready

## Integration Checklist

### Phase 1: Database Setup (TODAY)
- [ ] Copy SQL files from `/scripts` to Supabase SQL editor
- [ ] Execute migrations 001-006 in order
- [ ] Verify tables created with correct RLS policies
- [ ] Test auth signup creates profile via trigger

### Phase 2: Test Authentication
- [ ] Sign up at /auth/signup
- [ ] Verify email (check Supabase Auth)
- [ ] Login at /auth/login
- [ ] Should redirect to /dashboard
- [ ] Verify profile created in profiles table

### Phase 3: Test User Flows
- [ ] View templates at /templates
- [ ] Click "Launch Website" at /templates/[id]
- [ ] Fill out form (name, subdomain)
- [ ] Click launch button
- [ ] Check database: website + provisioning_job created
- [ ] Website status should be "pending"
- [ ] Job status should be "pending"

### Phase 4: Test Admin Actions
- [ ] Sign up admin user (manually set role='admin' in DB)
- [ ] Navigate to /admin/provisioning-queue
- [ ] See pending jobs
- [ ] Click "Approve" on a job
- [ ] Watch job progress update (calls updateProvisioningProgress)
- [ ] Job completes → website status = "ready"

### Phase 5: Test Dashboard Data
- [ ] Login to /dashboard
- [ ] Should show user's websites (real data from DB)
- [ ] Click website → see provisioning status
- [ ] Check /dashboard/billing → see invoices
- [ ] Check /dashboard/support → see tickets

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from Supabase Project Settings → API.

## Deployment

### Vercel
1. Connect GitHub repo
2. Add environment variables in Settings
3. Deploy - middleware runs automatically
4. Database stays on Supabase (managed separately)

### Supabase
1. Already deployed (no action needed)
2. Data is backed up automatically
3. Production database isolated from development

## Next Steps for Real Implementation

### Stripe Integration
Replace mock subscription creation with Stripe Checkout:
```typescript
// app/actions/create-checkout.ts
export async function createCheckoutSession(planId: string) {
  // Create Stripe session
  // Store session ID in DB
  // Redirect to checkout URL
}
```

### Background Jobs
Add Bull/Agenda for provisioning simulation:
```typescript
// jobs/provision-website.ts
export const provisionWebsiteJob = async (jobId: string) => {
  // Simulate provisioning with progress updates
  // Actually deploy website (Docker, Terraform, etc)
  // Update job status on completion
}
```

### Email Notifications
Add SendGrid/Resend for user updates:
```typescript
// lib/email.ts
export async function sendWebsiteReadyEmail(userId: string, websiteId: string) {
  // Send "Your website is ready!" email with live URL
}
```

### Webhooks
Add Stripe webhooks for subscription events:
```typescript
// app/api/webhooks/stripe.ts
export async function POST(req: Request) {
  // Handle payment_intent.succeeded
  // Update subscription status
  // Send email notification
}
```

## Data Flow Diagram

```
┌──────────────┐
│ User         │
└──────────────┘
       │
       │ 1. Click "Launch Website"
       ↓
┌─────────────────────────────────────┐
│ launchWebsite() server action        │
│  - Validate user authenticated       │
│  - Check subscription active         │
└─────────────────────────────────────┘
       │
       ├─→ 2. Create website (status=pending)
       │      ↓ DB: INSERT websites
       │
       └─→ 3. Create provisioning_job (status=pending)
              ↓ DB: INSERT provisioning_jobs
       
       ↓
┌─────────────────────────────────────┐
│ Admin Dashboard                      │
│ /admin/provisioning-queue           │
└─────────────────────────────────────┘
       │
       │ 4. Admin clicks "Approve"
       │
       ├─→ approveWebsiteProvisioning()
       │    - Job status → "running"
       │    - Progress → 10%
       │
       ├─→ updateProvisioningProgress()
       │    - Progress → 25%, 50%, 75%...
       │
       └─→ completeProvisioning()
            - Job status → "completed"
            - Website status → "ready"
            ↓ DB: UPDATE websites, provisioning_jobs
       
       ↓
┌──────────────────────────────────────┐
│ User Dashboard                       │
│ /dashboard/websites                 │
│ Website shows as "Live"              │
│ URL: https://subdomain.ovmon.app    │
└──────────────────────────────────────┘
```

## Security Notes

1. **Authentication**: All routes use middleware.ts for token validation
2. **RLS**: Every query respects Supabase RLS policies
3. **Authorization**: Admin actions check `isUserAdmin()` before execution
4. **Secrets**: API keys in environment variables, never in code
5. **SQL Injection**: Parameterized queries via Supabase SDK
6. **CORS**: Configured in Supabase settings
7. **Rate Limiting**: Ready to add via Upstash Redis

## Testing

### Manual Testing Checklist
- [ ] User signup → profile auto-created
- [ ] User login → redirects to dashboard
- [ ] Launch website flow → job created
- [ ] Admin approves job → status updates
- [ ] Website status = ready → accessible
- [ ] User can't access admin routes
- [ ] Admin can access all user data

### Automated Testing (Next Phase)
```typescript
// tests/website-launch.test.ts
describe("Website Launch Flow", () => {
  test("should create website and provisioning job", async () => {
    // Create test user
    // Call launchWebsite()
    // Assert website in DB
    // Assert job in DB
  });
});
```

## Troubleshooting

### "Not authenticated"
- Check middleware.ts runs correctly
- Verify NEXT_PUBLIC_SUPABASE_URL/KEY set
- Check user has confirmed email

### "Database connection failed"
- Verify Supabase URL correct
- Check anon key has RLS policies enabled
- Confirm tables created from migration scripts

### "RLS policy denied"
- Check auth.uid() = user_id in policies
- Verify user has session (check cookies)
- Admin role requires explicit policy

### "Job not found"
- Verify website_id passed correctly
- Check RLS allows access
- Job deleted after completion?

## Production Deployment Steps

1. **Database**: Backup production before each deploy
   ```
   pg_dump -U postgres > backup.sql
   ```

2. **Migrations**: Run in order, test on staging first
   ```
   psql < scripts/001_create_profiles.sql
   ```

3. **Environment**: Set NEXT_PUBLIC variables in Vercel
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

4. **Monitoring**: Set up alerts
   - DB connection errors
   - Auth failures
   - Provisioning job failures

5. **Backups**: Enable Supabase automated backups
   - Daily snapshots
   - 7-day retention
   - Test restore quarterly

## Support

For issues:
1. Check [Supabase Docs](https://supabase.com/docs)
2. Review RLS policies
3. Check server logs in Vercel dashboard
4. Test queries in Supabase SQL editor
