# Monitoring, Alerts & Health Tracking System

## Overview

Comprehensive real-time monitoring and alerting system for Ovmon. Continuously checks website health, server health, provisioning status, domain/SSL configurations, and backup operations with incident creation and user/admin notifications.

## Database Schema

### Health Checks (`health_checks`)
- Records all health check operations with type, status, response time, and error details
- Check types: website_reachability, website_performance, database_connectivity, domain_dns, domain_ssl, provisioning_status, backup_success, restore_success, export_success, server_uptime
- Statuses: passing, warning, critical, unknown
- Automatically indexed by website, check type, and timestamp for fast queries

### Incidents (`incidents`)
- User-facing problems requiring attention
- States: open → investigating → resolved → closed
- Severities: info, warning, critical
- Immutable audit trail with timestamps and resolution notes
- Links to affected resources (domains, backups, etc.)

### Alerts (`alerts`)
- System notifications sent to users (in-app, email, webhook)
- States: info, warning, critical, resolved
- Tracks acknowledgment and who acknowledged
- Linked to incidents and websites
- Supports action URLs for direct navigation to details

### Website Health Summary (`website_health_summary`)
- Denormalized health status per website for performance
- Overall status: healthy, degraded, critical, unknown
- Individual statuses: reachability_status, ssl_status, dns_status
- Uptime percentage and incident counts
- Last check duration and timestamps

### Server Health (`server_health`)
- Infrastructure monitoring per server
- CPU, memory, disk percentages
- Active deployments and error rates
- Last heartbeat tracking

## Health Check Engines

### Website Reachability Check
- HTTP HEAD request to live URL with 10-second timeout
- Records response time and HTTP status
- Triggers critical alert if unreachable for >1 minute

### SSL Certificate Check
- Verifies certificate status and expiry date
- Warns if expiring within 30 days
- Critical alert if expired or issuance failed

### Domain DNS Check
- Verifies DNS records are set and resolving
- Returns DNS record details
- Alerts on verification failure

### Database Connectivity Check
- Simulated check (real implementation connects to website database)
- Validates database credentials and connectivity
- Critical alert on connection failure

## Alert Management & Notifications

### Notification Triggers

```
provisioning_failed    → Critical, immediate notification
ssl_issuance_failed    → Critical, 5-minute delay
domain_verification_failed → Critical, 10-minute delay
website_unreachable    → Critical, 1-minute delay (filters transients)
database_unreachable   → Critical, 1-minute delay
backup_failed          → Warning, 5-minute delay
restore_failed         → Critical, immediate
export_failed          → Warning, immediate
ssl_expiring_soon      → Warning, immediate
```

Delays prevent notification spam from transient issues.

### Alert States
- **info**: Non-urgent information
- **warning**: Something needs attention soon
- **critical**: Urgent action required
- **resolved**: Issue has been fixed

### Acknowledgment
- Users can acknowledge alerts to dismiss them
- Tracked with user ID and timestamp
- Unacknowledged alerts highlighted in dashboard

## Monitoring Worker

Cron job (`/api/monitoring/worker`) runs every 5 minutes:
1. Fetches all active websites (status: ready or provisioning)
2. Runs health checks in parallel batches (5 websites at a time)
3. Records check results in database
4. Creates incidents for critical failures
5. Updates health summary statistics

Returns detailed report of checks performed, successes, failures.

## Admin Monitoring Dashboard

**Server Actions:**
- `getAdminMonitoringDashboard()`: Overall statistics and server health
- `getIncidentDetails()`: Full incident context with related alerts and checks
- `getWebsiteMonitoringStatus()`: Per-website incidents, alerts, and recent checks

**Provides:**
- Total websites, health distribution (healthy/degraded/critical)
- Open incidents count
- Unacknowledged alerts count
- Server health across all infrastructure

## User Website Health API

**Server Actions:**
- `getUserWebsiteHealth()`: Current health summary for user's website
- `getUserWebsiteHealthDetails()`: Extended health info with recent incidents/alerts
- `getUserUnacknowledgedAlerts()`: All unread alerts for user
- `acknowledgeUserAlert()`: Mark specific alert as read
- `getWebsiteHealthTrend()`: 24-hour health check history for graphing

**All operations verify user ownership of website.**

## Data Access Layer

**Monitoring DB Functions:**
- `recordHealthCheck()`: Insert health check result
- `createIncident()`: Create new incident
- `updateIncidentStatus()`: Change incident state
- `createAlert()`: Create and send alert
- `acknowledgeAlert()`: Mark alert acknowledged
- `updateWebsiteHealthSummary()`: Update denormalized summary
- `recordServerHealth()`: Record server metrics

All functions include error handling and logging.

## RLS (Row-Level Security) Policies

- **health_checks**: Users see own website checks, admins see all
- **incidents**: Users see own incidents, admins see all
- **alerts**: Users see own alerts, admins see all
- **website_health_summary**: Users see own websites, admins see all
- **server_health**: Admins only

## Key Features

✅ Real-time health monitoring across all components
✅ Automatic incident creation on failures
✅ Alert state machine with customizable delays
✅ User and admin dashboards with live data
✅ Batch health assessment to prevent system overload
✅ Immutable audit trails for all operations
✅ Per-website and per-incident context tracking
✅ Automatic incident resolution on recovery
✅ Comprehensive error messages for debugging
✅ Scalable architecture with cron-based processing

## Monitoring Flow

1. **Cron Trigger** (every 5 min) → `/api/monitoring/worker`
2. **Fetch Active Websites** from database
3. **Run Parallel Health Checks** (batched, 5 at a time)
4. **Record Check Results** in health_checks table
5. **Calculate Overall Status** (healthy/degraded/critical)
6. **Create Incidents** for critical failures
7. **Create Alerts** linked to incidents
8. **Update Health Summary** for user dashboards
9. **Return Report** of operation results

## Future Enhancements

- Email/SMS notifications for critical alerts
- Webhook delivery to external monitoring systems
- Scheduled downtime/maintenance windows
- Custom alert routing rules per user
- Health check history visualization
- Anomaly detection for gradual degradation
- Integration with monitoring service (DataDog, New Relic)
