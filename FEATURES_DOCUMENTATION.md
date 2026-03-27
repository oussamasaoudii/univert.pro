# شامل الميزات - Univert Pro

دليل شامل لجميع الميزات المضافة إلى النظام

## 1. نظام الإشعارات (Notifications System)

### الميزات:
- إشعارات في الوقت الفعلي عبر Pusher
- تفضيلات إشعارات قابلة للتخصيص
- دعم قنوات متعددة (في التطبيق، البريد، Push)
- تتبع حالة الإشعارات

### الجداول:
- `notifications` - الإشعارات الرئيسية
- `notification_preferences` - تفضيلات المستخدم
- `notification_logs` - سجلات الإرسال

### الاستخدام:
```typescript
import { createNotification, getUserNotifications } from '@/lib/notifications/db';

// إنشاء إشعار
await createNotification(userId, 'subscription', 'Welcome', 'Welcome to our platform!', {}, 'in_app');

// الحصول على إشعارات المستخدم
const notifications = await getUserNotifications(userId);
```

---

## 2. نظام تذاكر الدعم (Support Tickets System)

### الميزات:
- إنشاء وإدارة التذاكر
- ترتيب حسب الأولوية (منخفضة، متوسطة، عالية، عاجلة)
- ردود على التذاكر
- تتبع حالة التذاكر

### الجداول:
- `support_tickets` - التذاكر الرئيسية
- `support_ticket_replies` - الردود
- `support_categories` - الفئات

### الاستخدام:
```typescript
import { createTicket, getUserTickets } from '@/lib/support/db';

const ticket = await createTicket(userId, 'Title', 'Description', 'billing', 'high');
const tickets = await getUserTickets(userId);
```

---

## 3. نظام التحليلات (Analytics System)

### الميزات:
- تتبع الأحداث والجلسات
- إحصائيات يومية
- تحليل سلوك المستخدمين
- معلومات جغرافية والأجهزة

### الجداول:
- `analytics_events` - الأحداث المتتبعة
- `analytics_sessions` - جلسات المستخدمين
- `analytics_daily_stats` - الإحصائيات اليومية

---

## 4. نظام الأدوار والصلاحيات (RBAC System)

### الميزات:
- أدوار مخصصة قابلة للإنشاء
- صلاحيات دقيقة
- تعيين الأدوار للمستخدمين
- سجلات التدقيق (Audit Logs)

### الجداول:
- `roles` - الأدوار
- `permissions` - الصلاحيات
- `role_permissions` - علاقة الأدوار بالصلاحيات
- `user_roles` - تعيين الأدوار للمستخدمين
- `audit_logs` - سجلات التدقيق

---

## 5. نظام الخصومات والكوبونات (Discounts & Coupons)

### الميزات:
- إنشاء كوبونات خصم
- خصم نسبة مئوية أو مبلغ ثابت
- حد أقصى للاستخدام
- تواريخ انتهاء الصلاحية
- شروط الحد الأدنى والأقصى

### الجداول:
- `coupons` - الكوبونات
- `coupon_usage` - استخدام الكوبونات

### الاستخدام:
```typescript
import { validateCoupon, applyCoupon } from '@/lib/coupons/db';

const { valid, discount } = await validateCoupon(code, userId, amount);
if (valid) {
  await applyCoupon(couponId, userId, subscriptionId, discount);
}
```

---

## 6. نظام الولاء والنقاط (Loyalty Points System)

### الميزات:
- تجميع النقاط من الاشتراكات
- مستويات الولاء (Bronze, Silver, Gold, Platinum)
- استبدال النقاط بالمكافآت
- سجل المعاملات

### الجداول:
- `loyalty_points` - نقاط المستخدمين
- `loyalty_transactions` - معاملات النقاط
- `loyalty_rewards` - المكافآت المتاحة

### الاستخدام:
```typescript
import { getUserPoints, addPoints, redeemPoints } from '@/lib/loyalty/db';

await addPoints(userId, 100, 'Monthly subscription renewal');
const points = await getUserPoints(userId);
```

---

## 7. نظام مفاتيح API و Webhooks (API Keys & Webhooks)

### الميزات:
- إنشاء مفاتيح API آمنة
- نطاقات الصلاحيات (Scopes)
- حدود المعدل (Rate Limiting)
- Webhooks للتكامل الخارجي
- سجلات API

### الجداول:
- `api_keys` - مفاتيح API
- `webhooks` - الـ Webhooks
- `webhook_events` - أحداث الـ Webhooks
- `api_logs` - سجلات الاستخدام

### الاستخدام:
```typescript
import { createAPIKey, validateAPIKey } from '@/lib/api-keys/db';

const { key, apiKey } = await createAPIKey(userId, 'My Key', ['read', 'write']);
const validated = await validateAPIKey(key);
```

---

## 8. نظام تصدير البيانات (Data Export System)

سيتم بناؤه قريباً ويتضمن:
- تصدير إلى CSV و PDF
- تقارير مخصصة
- جداول ممتدة
- تحميل الملفات

---

## قاعدة بيانات MySQL

### معايير:
- استخدام BIGINT UNSIGNED للمفاتيح الأساسية
- مؤشرات على الأعمدة المستخدمة بكثرة
- علاقات الجداول المناسبة
- تواريخ timestamps تلقائية

### خطوات الإعداد:
```bash
# تشغيل الترحيلات بالترتيب
mysql -u root -p database < scripts/040_notifications_system.sql
mysql -u root -p database < scripts/041_support_tickets_system.sql
mysql -u root -p database < scripts/042_analytics_system.sql
mysql -u root -p database < scripts/043_rbac_system.sql
mysql -u root -p database < scripts/044_discounts_coupons.sql
mysql -u root -p database < scripts/045_loyalty_points.sql
mysql -u root -p database < scripts/046_api_keys_webhooks.sql
```

---

## API Endpoints (قريباً)

- GET `/api/notifications` - الحصول على الإشعارات
- POST `/api/support/tickets` - إنشاء تذكرة
- GET `/api/analytics/stats` - إحصائيات التحليلات
- GET `/api/api-keys` - إدارة مفاتيح API
- POST `/api/coupons/validate` - التحقق من الكوبون

---

## الأمان والأفضليات

1. **حماية المفاتيح**: تخزين hash SHA-256 لمفاتيح API
2. **التحقق من الصلاحيات**: استخدام RBAC في كل endpoint
3. **معدلات محدودة**: تطبيق rate limiting على API
4. **سجلات التدقيق**: تتبع جميع التغييرات الحساسة
5. **التشفير**: تشفير البيانات الحساسة

---

## الخطوات التالية

1. إنشاء API routes لكل نظام
2. بناء واجهات مستخدم في الـ Admin Dashboard
3. إضافة اختبارات شاملة
4. توثيق الـ API
5. نشر إلى الإنتاج
