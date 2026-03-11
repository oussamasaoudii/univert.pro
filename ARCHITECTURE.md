# Ovmon Product Architecture

## Overview
Ovmon is a SaaS platform for hosting and managing websites with templates, provisioning automation, domain management, and enterprise infrastructure controls.

## Project Structure

```
ovmon/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages (landing, legal)
│   ├── auth/                     # Authentication flows
│   ├── dashboard/                # User dashboard
│   │   ├── page.tsx             # Dashboard home
│   │   ├── websites/            # Website management
│   │   ├── domains/             # Domain management
│   │   ├── provisioning/        # Deployment tracking
│   │   ├── billing/             # Subscription & invoices
│   │   └── support/             # Support tickets
│   ├── admin/                    # Admin dashboard (infrastructure)
│   │   ├── servers/             # Server management
│   │   ├── provisioning-queue/  # Deployment queue
│   │   ├── profiles/            # Provisioning profiles
│   │   ├── backups/             # Backup management
│   │   ├── monitoring/          # Infrastructure metrics
│   │   └── alerts/              # Alerts & automation
│   └── templates/               # Template browsing & selection
│
├── components/                  # Reusable React components
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/               # Dashboard components
│   ├── provisioning/            # Deployment visualization
│   ├── domains/                 # Domain management UI
│   ├── admin/                   # Admin components
│   ├── marketing/               # Landing page components
│   ├── states/                  # Loading/Empty/Error states
│   └── legal/                   # Legal page layouts
│
├── lib/                         # Core utilities & services
│   ├── types.ts                # TypeScript interfaces & types
│   ├── mock-data.ts            # Mock data (user content)
│   ├── admin-data.ts           # Mock admin analytics data
│   ├── api-service.ts          # Service layer (data fetching)
│   ├── utils.ts                # Utility functions
│   └── constants.ts            # App constants (if added)
│
└── hooks/                       # Custom React hooks
    ├── use-mobile.ts           # Mobile detection
    └── use-toast.ts            # Toast notifications
```

## Data Layer Architecture

### Types (lib/types.ts)
Complete TypeScript interfaces for all domain models:
- **User/Auth**: User, TeamMember
- **Products**: Template, TemplateCategory, TemplateStack
- **Websites**: Website, WebsiteStatus, ProvisioningProgress, ProvisioningStep
- **Domains**: Domain, DnsRecord, DomainVerification, SSLStatus
- **Billing**: Plan, Subscription, Invoice, PaymentMethod
- **Support**: Ticket, TicketMessage, TicketPriority, TicketStatus
- **Infrastructure**: Server, ProvisioningProfile, Job, Backup, Alert, AdminStats
- **Analytics**: Activity, Notification, AdminStats

### Mock Data (lib/mock-data.ts & lib/admin-data.ts)
Realistic data in consistent format:
- **lib/mock-data.ts**: User websites, templates, domains, subscriptions, support tickets, team members, infrastructure data
- **lib/admin-data.ts**: Admin-view data for analytics, users, websites, provisioning jobs, tickets, invoices, revenue metrics

### Service Layer (lib/api-service.ts)
Mock API functions organized by domain with simulated network delay:
```typescript
export const api = {
  user: userApi,        // Profile, subscription stats
  website: websiteApi,  // CRUD, filtering, stats
  template: templateApi,// Browse, search, filter
  domain: domainApi,    // DNS, SSL, verification
  provisioning: provisioningApi, // Deployment tracking
  billing: billingApi,  // Invoices, plans, usage
  support: supportApi,  // Tickets, messages
  infrastructure: infrastructureApi, // Servers, jobs, alerts
  analytics: analyticsApi, // Admin metrics, revenue
};
```

## Component Architecture

### Layout Structure
- **Root Layout** (app/layout.tsx) - Global styles, fonts, providers
- **Dashboard Layout** (app/dashboard/layout.tsx) - Sidebar, navigation
- **Admin Layout** (app/admin/layout.tsx) - Admin navigation, header
- **Marketing Layout** (app/(marketing)/layout.tsx) - Public pages

### Component Organization
- **UI Components** - Shadcn components (Button, Card, Dialog, etc.)
- **Page Components** - Full-page layouts (dashboard sections, admin pages)
- **Feature Components** - Domain-specific UI (DeploymentTimeline, DnsVerification, etc.)
- **State Components** - LoadingState, EmptyState, ErrorState, SuccessState
- **Admin Components** - Sidebar, header navigation for admin dashboard

## Data Flow Patterns

### User Dashboard (Server → Client → API Service)
1. Page component imports data from mock-data.ts or calls api.website.*
2. Components render based on real data types
3. Interactive elements use React hooks for state management

### Admin Dashboard
1. Admin page calls api.analytics.* for stats
2. Tables display data from admin-data.ts (adminUsers, adminWebsites, etc.)
3. Real-time metrics fetch from infrastructure API

## Integration Points for Real Backend

### Database Integration (Future)
When connecting to real database, replace:

1. **lib/mock-data.ts** → **Database queries** (Supabase, Neon, etc.)
2. **lib/admin-data.ts** → **Aggregated queries** (Views or service layer queries)
3. **lib/api-service.ts** → **Real API endpoints** or **ORM calls**

Example migration:
```typescript
// Current (mock)
export const websiteApi = {
  async getWebsites() {
    await delay(DELAY);
    return websites; // from mock-data.ts
  }
};

// Future (real API)
export const websiteApi = {
  async getWebsites() {
    return await fetch('/api/websites').then(r => r.json());
    // or with Supabase
    // return await supabase.from('websites').select('*');
  }
};
```

### Adding Real Endpoints
1. Create route handlers in `app/api/` folder
2. Keep api-service.ts as abstraction layer
3. Connect to database in route handlers

Example:
```typescript
// app/api/websites/route.ts
export async function GET() {
  const websites = await db.website.findMany();
  return Response.json(websites);
}
```

### Authentication
- Currently no auth implementation
- When adding auth (Auth.js, Supabase Auth, etc.):
  1. Create middleware for protected routes
  2. Update api-service.ts to include auth context
  3. Add user context throughout components

## Type Safety Strategy
- All data types defined in lib/types.ts
- Components are fully typed
- Mock data uses `as Type` for strict typing
- Easy to migrate from mock → real backend without changing component signatures

## Scalability Considerations

### Current Setup (Mock)
- Mock data for ~200 websites
- Admin data for ~100 users
- All data in memory (no persistence)

### For Production
1. **Database**: Choose PostgreSQL (Supabase, Neon, RDS) or alternative
2. **Caching**: Add Redis for frequently accessed data
3. **API Routes**: Create proper REST/GraphQL endpoints
4. **Authentication**: Implement session management
5. **Rate Limiting**: Add API rate limiting
6. **Monitoring**: Add logging and error tracking

## Development Workflow

### Adding a New Feature
1. Define types in lib/types.ts
2. Add mock data to lib/mock-data.ts or lib/admin-data.ts
3. Create service function in lib/api-service.ts
4. Build component/page using service
5. When ready, replace service with real API endpoint

### Key Files to Update
- **New type**: lib/types.ts
- **New mock data**: lib/mock-data.ts or lib/admin-data.ts
- **New service**: lib/api-service.ts
- **New component**: components/[domain]/[feature].tsx
- **New page**: app/[section]/[page]/page.tsx

## Performance Optimizations

### Current
- Simulated network delay (300ms) in api-service.ts
- Mock data loaded statically
- Client-side filtering/search

### Recommended for Production
- Server-side pagination
- Database indexing on commonly filtered columns
- ISR (Incremental Static Regeneration) for templates/plans
- Revalidation strategies for frequently changing data
- Streaming for large datasets

## Testing Considerations

### Unit Tests
- Components with mock data from api-service
- Types are validated automatically

### Integration Tests
- Mock api-service calls
- Test full page flows

### E2E Tests
- Test user journeys (login → template → provisioning)
- Admin workflows (user management, monitoring)

## Key Principles

1. **Type-first development** - Define types before implementing
2. **Service abstraction** - All data goes through api-service
3. **Mock-friendly** - Easy to swap mock data for real API
4. **Component isolation** - UI components don't know about data source
5. **Scalable structure** - Patterns extend naturally for production

## Future Roadmap

1. Add authentication (Auth.js)
2. Connect real database (Supabase/Neon)
3. Implement caching strategy
4. Add API endpoints
5. Set up error tracking (Sentry)
6. Add analytics (PostHog/Plausible)
7. Implement webhooks for real-time updates
