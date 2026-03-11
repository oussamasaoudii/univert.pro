# Ovmon Domain Management System

Production-grade domain management with DNS verification and SSL automation for both platform subdomains and custom domains.

## Architecture Overview

### Database Schema (scripts/008_extend_domains_schema.sql)
- **domains** table: Extended with domain type, comprehensive status tracking (pending → verifying → verified → ssl_pending → active)
- **domain_logs**: Immutable audit trail for all domain operations
- **dns_verifications**: Tracks DNS ownership verification attempts and state
- **ssl_certificates**: SSL/TLS certificate lifecycle management with auto-renewal

### Components

#### DNS Verification Engine (lib/domain/dns-verification.ts)
- Generates DNS verification records (TXT, CNAME, A)
- Validates domain format and availability
- Performs DNS lookup with automatic retry logic
- Handles propagation delays with exponential backoff
- Tracks verification attempts and timestamps

#### SSL Automation Engine (lib/domain/ssl-automation.ts)
- Requests SSL certificates from Let's Encrypt
- Manages certificate lifecycle with auto-renewal
- Handles certificate expiry tracking and alerts
- Integrates with ACME protocol (ready for real implementation)
- Provides certificate validation and chain checking

#### Domain Lifecycle State Machine (lib/domain/domain-lifecycle.ts)
- Enforces valid state transitions through domain lifecycle
- Orchestrates DNS verification → SSL provisioning → domain activation
- Handles failures and retries with proper error context
- Tracks progress with percentage indicators
- Provides detailed status summaries for UI

### Data Access Layer (lib/db/domains.ts - Extended)
- Domain CRUD operations with audit logging
- DNS verification record management
- SSL certificate operations
- Domain logging for audit trails
- Certificate expiry queries for renewal automation

### User Actions (app/actions/domain-actions.ts)
- `addCustomDomain`: Users register custom domains
- `startDnsVerification`: Initiate DNS ownership verification
- `checkDnsVerificationStatus`: Poll verification progress
- `createPlatformSubdomain`: Admin creates managed subdomains
- `getDomainStatus`: Real-time status for dashboards
- `getWebsiteDomainsWithStatus`: Fetch all domains with enriched status

## Domain Lifecycle

### State Transitions
```
pending → verifying → verified → ssl_pending → active
                ↓         ↓          ↓            ↓
              failed    failed     failed       failed
                ↓         ↓          ↓            ↓
              (retry)   (retry)    (retry)     (retry)
```

### States
- **pending**: Domain record created, awaiting DNS verification start
- **verifying**: DNS records instructions displayed, checking for propagation
- **verified**: DNS ownership confirmed, ready for SSL provisioning
- **ssl_pending**: SSL certificate requested, awaiting issuance
- **active**: Domain fully operational with SSL active
- **failed**: Verification or SSL provisioning failed, available for retry

## DNS Verification Flow

1. User adds custom domain
2. System generates TXT verification record with unique token
3. User adds record to domain registrar's DNS
4. System performs DNS lookup with 30 retry attempts (2.5 minute window)
5. On success: DNS status → verified, initiates SSL provisioning
6. On failure: Domain → failed, user can retry

### DNS Record Example
```
Name: _acme-challenge.example.com
Type: TXT
Value: ovmon-verify_1234567890_abc12345
TTL: 300 (5 minutes)
```

## SSL Provisioning Flow

1. After DNS verification, system requests SSL certificate
2. Certificate validation via ACME challenges
3. Certificate issued by Let's Encrypt with 90-day validity
4. Domain status → active
5. Automatic renewal initiated 30 days before expiry

## Admin Queue Integration

The domain system integrates with the job queue for:
- Asynchronous DNS verification polling
- SSL certificate renewal background tasks
- Expiry monitoring and alerts
- Certificate renewal retry logic with backoff

## Error Handling

### DNS Errors
- **ENOTFOUND**: Domain doesn't exist, user guidance provided
- **ENODATA**: Record not yet propagated, retry with backoff
- **Timeout**: DNS propagation delay, continue polling
- **Mismatch**: Wrong value detected, display comparison

### SSL Errors
- **Invalid domain**: Validation before ACME request
- **Challenge failure**: Retry with new challenges
- **Rate limiting**: Exponential backoff and queue retry
- **Renewal failure**: Alert user 14 days before expiry

### State Errors
- **Invalid transition**: Prevent state machine violations
- **Unauthorized access**: RLS policies enforce ownership
- **Resource conflicts**: Domain already in use detection

## Production Considerations

- DNS verification uses Node.js `dns` module with promisification
- Ready for Let's Encrypt ACME integration (currently simulated)
- SSL certificates stored in database with expiry tracking
- Automatic renewal triggered 30 days before expiry
- Full audit trail via domain_logs table
- RLS policies enforce user/admin access control

## UI Integration Points

- Domain status dashboard showing real-time progress
- DNS verification instructions with manual entry
- SSL certificate details and renewal status
- Domain logs viewer for admin audit trails
- Health checks for certificate expiry
