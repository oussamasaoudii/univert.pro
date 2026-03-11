# Billing and Subscription System - Ovmon

Complete production-grade billing and subscription management system with real subscription lifecycle, feature gating, and usage tracking.

## Database Schema

### Billing Plans (billing_plans)
- 5 tier plans: Starter ($29.99/mo), Growth ($99.99/mo), Pro ($299.99/mo), Premium ($799.99/mo), Enterprise (custom)
- Stripe integration with product and price IDs
- Annual billing options with discount

### Plan Features (plan_features)
- max_websites: 1→5→25→unlimited→unlimited
- max_custom_domains: 1→5→25→unlimited→unlimited
- api_access: false→false→true→true→true
- advanced_analytics: false→true→true→true→true
- priority_support: false→false→false→true→true
- sso: false→false→false→true→true
- team_members: 1→5→25→unlimited→unlimited

### Subscriptions (extended)
- Status: trialing → active → past_due → canceled/ended
- Stripe customer and subscription IDs
- Billing cycle (monthly/annual) tracking
- Failed payment count and retry logic
- Metadata for custom attributes

### Subscription History (subscription_history)
- Immutable audit log of all changes
- Actions: created, upgraded, downgraded, renewed, canceled, payment_failed
- Amount, old/new plan IDs, and full metadata

### Feature Usage (feature_usage)
- Per-user usage tracking for quota-based features
- Limit values (null = unlimited)
- Reset timestamps for monthly/annual cycles

## Subscription Lifecycle State Machine

```
trialing ──→ active ──→ past_due ──┐
  │           │         │           ├→ canceled ──(terminal)
  └───────────┴─────────┘           │
                                     └→ ended ──(terminal)
```

Valid transitions enforced at application level. Each transition logged for audit.

## Feature Gating System

### Core Classes

**FeatureGate** - Access control and quota checking
- `userHasAccess(userId, featureKey)` - Check if user can access feature
- `canUserPerformAction(userId, actionKey, currentUsage)` - Check with quota
- `getFeatureInfo(userId, featureKey)` - Get metadata for UI display
- `planHasFeature(planId, featureKey)` - Check plan capabilities

**SubscriptionLifecycle** - State machine enforcement
- `transition(subscription, newStatus)` - Validate and execute state change
- `upgradePlan(subscription, newPlanId, proRationFactor)` - Pro-rated upgrade
- `downgradePlan(subscription, newPlanId)` - Downgrade with credit handling
- `renewSubscription(subscription)` - Automatic renewal
- `markPaymentFailed(subscription)` - Payment retry logic
- `cancelSubscription(subscription, reason)` - Graceful cancellation

## API Routes

### GET /api/billing/subscription
Fetch current subscription with plan details and feature list. Used by dashboard for real-time display.

### POST /api/billing/checkout
Stripe checkout session creation. Handles:
- Plan selection
- Billing cycle (monthly/annual)
- Pro-ration on upgrades
- Existing subscription management

## Server Actions

### getCurrentSubscription()
Get authenticated user's subscription with enriched plan data.

### upgradeToPlan(planName)
Upgrade user to higher tier with automatic pro-ration calculation.

### downgradeToPlan(planName)
Downgrade with credit handling for unused time.

### cancelSubscription(reason)
Graceful cancellation with optional reason tracking.

### getSubscriptionChangeHistory()
Audit trail of all subscription modifications.

### getUserBillingInvoices()
All invoices for user with payment status.

### checkFeatureAccess(featureKey)
Check if user has access to feature with remaining quota info.

### trackFeatureUsage(featureKey, amount)
Increment usage counter for quota tracking.

## Integration Points

### With Provisioning
- Access to provisioning jobs gated by subscription status (active/trialing only)
- Quota on max_websites enforced before creating new site
- Feature usage tracked when provisioning jobs complete

### With Domain Management
- Custom domains feature gated based on plan
- SSL certificates included on all plans
- Verification and renewal tracked in usage

### With Queue System
- Provisioning jobs queued only for active subscriptions
- Renewal jobs triggered before subscription period ends
- Failed payment retries with configurable backoff

## Feature Matrix

| Feature | Starter | Growth | Pro | Premium | Enterprise |
|---------|---------|--------|-----|---------|------------|
| Max Websites | 1 | 5 | 25 | Unlimited | Unlimited |
| Custom Domains | 1 | 5 | 25 | Unlimited | Unlimited |
| SSL Certificates | Free | Free | Free | Free | Free |
| Analytics | Yes | Yes | Yes | Yes | Yes |
| Advanced Analytics | - | Yes | Yes | Yes | Yes |
| API Access | - | - | Yes | Yes | Yes |
| Priority Support | - | - | - | 24/7 | 24/7 |
| SSO | - | - | - | Yes | Yes |
| Team Members | 1 | 5 | 25 | Unlimited | Unlimited |

## Database Queries Optimized

- subscription_history indexed on subscription_id and user_id for fast audit lookups
- feature_usage indexed on user_id for quick permission checks
- billing_plans cached by name (rarely changes)
- plan_features indexed for feature discovery

## Security

- Row Level Security (RLS) policies enforce user isolation
- Subscription status checked server-side before any paid features
- Feature usage incremented atomically to prevent race conditions
- All state transitions logged for compliance and auditing
- Payment retry logic prevents infinite charge loops
- Failed payment count limits auto-cancellation

## Monetization Ready

All 5 plan tiers defined with Stripe-compatible pricing. Can immediately connect Stripe webhooks for:
- Subscription creation on checkout
- Automatic renewal processing
- Failed payment handling
- Dunning email sequences
- Churn recovery flows

Current UI shows mock subscription data. Replace API calls to use real database queries for production.
