# API Routes Guide - Univert Pro

دليل كامل لجميع API Routes المتاحة في النظام

## Authentication

جميع الـ API routes تتطلب المصادقة. يجب إرسال JWT token في header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Notifications API

### GET /api/notifications
الحصول على إشعارات المستخدم

**Query Parameters:**
- `limit` (int, default: 50) - عدد الإشعارات المراد جلبها
- `offset` (int, default: 0) - الإزاحة

**Response:**
```json
{
  "notifications": [
    {
      "id": "1",
      "user_id": "user123",
      "type": "subscription",
      "title": "Welcome",
      "message": "Welcome to our platform!",
      "read": false,
      "channel": "in_app",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### PATCH /api/notifications
تحديث حالة الإشعارات

**Body:**
```json
{
  "notificationId": "1"  // تحديد إشعار واحد
  // أو
  "markAllAsRead": true  // وضع علامة على جميع كـ مقروء
}
```

---

## 2. Support Tickets API

### GET /api/support/tickets
الحصول على تذاكر المستخدم

**Query Parameters:**
- `status` (optional) - تصفية حسب الحالة (open, in_progress, resolved, closed)

**Response:**
```json
{
  "tickets": [
    {
      "id": "1",
      "user_id": "user123",
      "title": "Billing Issue",
      "description": "I was charged twice",
      "status": "open",
      "priority": "high",
      "category": "billing",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/support/tickets
إنشاء تذكرة دعم جديدة

**Body:**
```json
{
  "title": "Billing Issue",
  "description": "I was charged twice for my subscription",
  "category": "billing",
  "priority": "high"
}
```

---

## 3. Analytics API

### GET /api/analytics/stats
الحصول على إحصائيات التحليلات

**Query Parameters:**
- `websiteId` (required) - معرّف الموقع
- `days` (int, default: 30) - عدد الأيام

**Response:**
```json
{
  "stats": [
    {
      "date": "2024-01-01",
      "page_views": 1500,
      "sessions": 250,
      "unique_visitors": 180,
      "bounce_rate": 35.5
    }
  ],
  "totals": {
    "totalPageViews": 45000,
    "totalSessions": 7500,
    "totalUniqueVisitors": 5000,
    "avgBounceRate": 32.5
  }
}
```

---

## 4. Coupons API

### POST /api/coupons/validate
التحقق من صحة الكوبون

**Body:**
```json
{
  "code": "SUMMER2024",
  "amount": 99.99
}
```

**Response:**
```json
{
  "valid": true,
  "discount": 24.99,
  "message": "Coupon valid"
}
```

---

## 5. Loyalty Points API

### GET /api/loyalty/points
الحصول على نقاط الولاء للمستخدم

**Response:**
```json
{
  "points": {
    "id": "1",
    "user_id": "user123",
    "total_points": 1250,
    "available_points": 950,
    "tier": "gold",
    "lifetime_points": 2500,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 6. API Keys API

### GET /api/api-keys
الحصول على جميع مفاتيح API للمستخدم

**Response:**
```json
{
  "apiKeys": [
    {
      "id": "1",
      "name": "Production API",
      "key_prefix": "ovmon_abc",
      "scopes": ["read", "write"],
      "rate_limit": 1000,
      "last_used_at": "2024-01-01T00:00:00Z",
      "expires_at": null,
      "is_active": true
    }
  ]
}
```

### POST /api/api-keys
إنشاء مفتاح API جديد

**Body:**
```json
{
  "name": "Production API",
  "scopes": ["read", "write"],
  "expiresAt": "2025-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "key": "ovmon_full_key_string_here",
  "apiKey": {
    "id": "1",
    "name": "Production API",
    "key_prefix": "ovmon_abc",
    "scopes": ["read", "write"],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## Admin Pages

جميع صفحات الـ Admin متاحة في `/admin` وتتطلب أدوار إدارية:

- `/admin/notifications` - إدارة الإشعارات
- `/admin/support` - إدارة تذاكر الدعم
- `/admin/analytics` - لوحة التحليلات
- `/admin/roles` - إدارة الأدوار والصلاحيات
- `/admin/coupons` - إدارة الكوبونات
- `/admin/loyalty` - برنامج الولاء
- `/admin/api-keys` - إدارة مفاتيح API

---

## Database Tables

### Notifications System
- `notifications` - الإشعارات الرئيسية
- `notification_preferences` - تفضيلات المستخدم
- `notification_logs` - سجلات الإرسال

### Support System
- `support_tickets` - التذاكر
- `support_ticket_replies` - الردود
- `support_categories` - الفئات

### Analytics System
- `analytics_events` - الأحداث
- `analytics_sessions` - الجلسات
- `analytics_daily_stats` - الإحصائيات اليومية

### RBAC System
- `roles` - الأدوار
- `permissions` - الصلاحيات
- `role_permissions` - علاقات الأدوار بالصلاحيات
- `user_roles` - تعيين الأدوار للمستخدمين
- `audit_logs` - سجلات التدقيق

### Coupons System
- `coupons` - الكوبونات
- `coupon_usage` - استخدام الكوبونات

### Loyalty System
- `loyalty_points` - نقاط المستخدمين
- `loyalty_transactions` - المعاملات
- `loyalty_rewards` - المكافآت

### API Keys System
- `api_keys` - مفاتيح API
- `webhooks` - Webhooks
- `webhook_events` - أحداث Webhooks
- `api_logs` - سجلات الاستخدام

---

## Error Handling

### Error Response Format
```json
{
  "error": "Error message here",
  "status": 400
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Rate Limiting

جميع API endpoints محمية برقابة المعدل:
- الحد الأقصى: 1000 طلب في الساعة (للمستخدمين العاديين)
- مفاتيح API لها حدود مخصصة حسب الخطة

---

## Testing API

### Using cURL
```bash
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. اضبط Authorization → Bearer Token
2. أدخل JWT token
3. اختبر الـ endpoints

---

## Webhook Integrations

يمكنك إعداد webhooks لاستقبال أحداث النظام:

```json
{
  "event": "subscription.created",
  "data": {
    "subscription_id": "123",
    "user_id": "user123",
    "plan": "pro"
  }
}
```

### Webhook Events
- `subscription.created`
- `subscription.canceled`
- `payment.succeeded`
- `payment.failed`
- `ticket.created`
- `ticket.updated`
