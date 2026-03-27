'use client';

import { useEffect, useRef, useState } from 'react';
import { AdminStepUpDialog } from '@/components/admin/admin-step-up-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

type SettingsState = {
  platformName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowNewSignups: boolean;
  requireEmailVerification: boolean;
  maintenanceMessage: string;
  s3Enabled: boolean;
  s3Endpoint: string;
  s3Region: string;
  s3Bucket: string;
  s3AccessKey: string;
  s3SecretKey: string;
  s3PublicUrl: string;
  s3UsePathStyle: boolean;
  turnstileEnabled: boolean;
  turnstileSiteKey: string;
  turnstileSecretKey: string;
  // SMTP Settings
  smtpEnabled: boolean;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  smtpEncryption: string;
  smtpFromAddress: string;
  smtpFromName: string;
};

type S3ConfigSource = 'database' | 'env' | 'mixed' | 'none';

type AdminSecurityState = {
  mfaRequired: boolean;
  mfaEnabled: boolean;
  mfaEnrolledAt: string | null;
  recoveryCodesRemaining: number;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    platformName: 'Ovmon',
    supportEmail: 'support@ovmon.com',
    maintenanceMode: false,
    allowNewSignups: true,
    requireEmailVerification: false,
    maintenanceMessage: 'جاري إجراء صيانة مجدولة. يرجى العودة قريباً.',
    s3Enabled: false,
    s3Endpoint: '',
    s3Region: '',
    s3Bucket: '',
    s3AccessKey: '',
    s3SecretKey: '',
    s3PublicUrl: '',
    s3UsePathStyle: false,
    turnstileEnabled: false,
    turnstileSiteKey: '',
    turnstileSecretKey: '',
    // SMTP defaults
    smtpEnabled: false,
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    smtpFromAddress: '',
    smtpFromName: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [adminSecurity, setAdminSecurity] = useState<AdminSecurityState>({
    mfaRequired: true,
    mfaEnabled: false,
    mfaEnrolledAt: null,
    recoveryCodesRemaining: 0,
  });
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [mfaActionPending, setMfaActionPending] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [s3ConfigSource, setS3ConfigSource] = useState<S3ConfigSource>('none');
  const [s3EnvFallbackActive, setS3EnvFallbackActive] = useState(false);
  const pendingSecureActionRef = useRef<(() => Promise<void>) | null>(null);

  const loadAdminSecurity = async () => {
    const response = await fetch('/api/auth/admin-mfa/manage', {
      credentials: 'include',
      cache: 'no-store',
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(String(result?.error || 'failed_to_load_admin_security'));
    }

    setAdminSecurity({
      mfaRequired: Boolean(result?.mfa?.required ?? true),
      mfaEnabled: Boolean(result?.mfa?.enabled),
      mfaEnrolledAt: result?.mfa?.enrolledAt || null,
      recoveryCodesRemaining: Number(result?.mfa?.recoveryCodesRemaining || 0),
    });
  };

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setErrorMessage('');

      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          const response = await fetch('/api/admin/settings', { cache: 'no-store' });
          const result = await response.json().catch(() => ({}));

          if (response.status === 401) {
            window.location.href = '/admin/login';
            return;
          }

          if (!response.ok) {
            throw new Error(String(result?.error || 'failed_to_load_settings'));
          }

          const next = result?.settings;
          setSettings({
            platformName: next?.platformName || 'Ovmon',
            supportEmail: next?.supportEmail || 'support@ovmon.com',
            maintenanceMode: Boolean(next?.maintenanceMode),
            allowNewSignups:
              typeof next?.allowNewSignups === 'boolean' ? next.allowNewSignups : true,
            requireEmailVerification:
              typeof next?.requireEmailVerification === 'boolean'
                ? next.requireEmailVerification
                : false,
            maintenanceMessage:
              next?.maintenanceMessage || 'جاري إجراء صيانة مجدولة. يرجى العودة قريباً.',
            s3Enabled: Boolean(next?.s3Enabled),
            s3Endpoint: next?.s3Endpoint || '',
            s3Region: next?.s3Region || '',
            s3Bucket: next?.s3Bucket || '',
            s3AccessKey: next?.s3AccessKey || '',
            s3SecretKey: next?.s3SecretKey || '',
            s3PublicUrl: next?.s3PublicUrl || '',
            s3UsePathStyle: Boolean(next?.s3UsePathStyle),
            turnstileEnabled: Boolean(next?.turnstileEnabled),
            turnstileSiteKey: next?.turnstileSiteKey || '',
            turnstileSecretKey: next?.turnstileSecretKey || '',
            // SMTP
            smtpEnabled: Boolean(next?.smtpEnabled),
            smtpHost: next?.smtpHost || '',
            smtpPort: next?.smtpPort || '587',
            smtpUsername: next?.smtpUsername || '',
            smtpPassword: next?.smtpPassword || '',
            smtpEncryption: next?.smtpEncryption || 'tls',
            smtpFromAddress: next?.smtpFromAddress || '',
            smtpFromName: next?.smtpFromName || '',
          });
          setS3ConfigSource((next?.s3ConfigSource as S3ConfigSource) || 'none');
          setS3EnvFallbackActive(Boolean(next?.s3EnvFallbackActive));
          setAdminSecurity({
            mfaRequired: Boolean(result?.adminSecurity?.mfaRequired ?? true),
            mfaEnabled: Boolean(result?.adminSecurity?.mfaEnabled),
            mfaEnrolledAt: result?.adminSecurity?.mfaEnrolledAt || null,
            recoveryCodesRemaining: Number(result?.adminSecurity?.recoveryCodesRemaining || 0),
          });
          break;
        } catch (error) {
          if (attempt === 3) {
            console.error('[admin/settings] failed to load settings', error);
            setErrorMessage('تعذر تحميل الإعدادات من قاعدة البيانات');
          } else {
            await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
          }
        }
      }

      setLoading(false);
    };

    void fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (String(result?.error || '').toLowerCase().includes('step_up_required')) {
          pendingSecureActionRef.current = handleSave;
          setStepUpOpen(true);
          return;
        }
        throw new Error(String(result?.error || 'failed_to_save_settings'));
      }

      const next = result?.settings;
      if (next) {
        setSettings({
          platformName: next.platformName || 'Ovmon',
          supportEmail: next.supportEmail || 'support@ovmon.com',
          maintenanceMode: Boolean(next.maintenanceMode),
          allowNewSignups: Boolean(next.allowNewSignups),
          requireEmailVerification: Boolean(next.requireEmailVerification),
          maintenanceMessage: next.maintenanceMessage || '',
          s3Enabled: Boolean(next.s3Enabled),
          s3Endpoint: next.s3Endpoint || '',
          s3Region: next.s3Region || '',
          s3Bucket: next.s3Bucket || '',
          s3AccessKey: next.s3AccessKey || '',
          s3SecretKey: next.s3SecretKey || '',
          s3PublicUrl: next.s3PublicUrl || '',
          s3UsePathStyle: Boolean(next.s3UsePathStyle),
          turnstileEnabled: Boolean(next.turnstileEnabled),
          turnstileSiteKey: next.turnstileSiteKey || '',
          turnstileSecretKey: next.turnstileSecretKey || '',
          // SMTP
          smtpEnabled: Boolean(next.smtpEnabled),
          smtpHost: next.smtpHost || '',
          smtpPort: next.smtpPort || '587',
          smtpUsername: next.smtpUsername || '',
          smtpPassword: next.smtpPassword || '',
          smtpEncryption: next.smtpEncryption || 'tls',
          smtpFromAddress: next.smtpFromAddress || '',
          smtpFromName: next.smtpFromName || '',
        });
        setS3ConfigSource((next.s3ConfigSource as S3ConfigSource) || 'none');
        setS3EnvFallbackActive(Boolean(next.s3EnvFallbackActive));
      }

      setSuccessMessage('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('[admin/settings] failed to save settings', error);
      setErrorMessage('تعذر حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateRecoveryCodes = async () => {
    setMfaActionPending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/admin-mfa/recovery-codes', {
        method: 'POST',
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (String(result?.error || '').toLowerCase().includes('step_up_required')) {
          pendingSecureActionRef.current = handleRegenerateRecoveryCodes;
          setStepUpOpen(true);
          return;
        }
        throw new Error(String(result?.error || 'failed_to_regenerate_recovery_codes'));
      }

      setRecoveryCodes(Array.isArray(result?.recoveryCodes) ? result.recoveryCodes : []);
      await loadAdminSecurity();
      setSuccessMessage('تم توليد recovery codes جديدة. احفظها الآن لأنها ستُعرض مرة واحدة فقط.');
    } catch (error) {
      console.error('[admin/settings] failed to regenerate recovery codes', error);
      setErrorMessage('تعذر توليد recovery codes جديدة');
    } finally {
      setMfaActionPending(false);
    }
  };

  const handleDisableMfa = async () => {
    setMfaActionPending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/admin-mfa/disable', {
        method: 'POST',
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (String(result?.error || '').toLowerCase().includes('step_up_required')) {
          pendingSecureActionRef.current = handleDisableMfa;
          setStepUpOpen(true);
          return;
        }
        throw new Error(String(result?.error || 'failed_to_disable_mfa'));
      }

      window.location.href =
        typeof result?.redirectTo === 'string' && result.redirectTo ? result.redirectTo : '/admin/login';
    } catch (error) {
      console.error('[admin/settings] failed to disable MFA', error);
      setErrorMessage('تعذر تعطيل MFA');
    } finally {
      setMfaActionPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">إعدادات النظام</h1>
        <p className="text-muted-foreground">الإعدادات هنا تقرأ من MySQL مع fallback من .env عند الحاجة</p>
      </div>

      <AdminStepUpDialog
        open={stepUpOpen}
        onOpenChange={setStepUpOpen}
        title="تأكيد الوصول الإداري"
        description="العملية الحساسة تتطلب كلمة المرور الحالية + رمز MFA صالح."
        onVerified={() => {
          const pendingAction = pendingSecureActionRef.current;
          pendingSecureActionRef.current = null;
          if (pendingAction) {
            void pendingAction();
          }
        }}
      />

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span>{errorMessage}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              disabled={loading}
            >
              إعادة المحاولة
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {recoveryCodes?.length ? (
        <Alert>
          <ShieldCheck className="h-4 w-4 text-accent" />
          <AlertDescription className="space-y-3">
            <p>Recovery codes الجديدة. سيتم عرضها مرة واحدة فقط:</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {recoveryCodes.map((recoveryCode) => (
                <code key={recoveryCode} className="rounded bg-background px-3 py-2 text-sm">
                  {recoveryCode}
                </code>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="features">المميزات</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="addons">Add-ons</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات المنصة</CardTitle>
              <CardDescription>تكوين إعدادات المنصة الأساسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>اسم المنصة</Label>
                <Input
                  value={settings.platformName}
                  onChange={(e) =>
                    setSettings({ ...settings, platformName: e.target.value })
                  }
                  className="mt-2"
                  disabled={loading || saving}
                />
              </div>
              <div>
                <Label>البريد الإلكتروني للدعم</Label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, supportEmail: e.target.value })
                  }
                  className="mt-2"
                  disabled={loading || saving}
                />
              </div>
              <Button
                className="bg-accent hover:bg-accent/90"
                onClick={handleSave}
                disabled={loading || saving}
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>المميزات</CardTitle>
              <CardDescription>تفعيل أو تعطيل المميزات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <span>السماح بالتسجيل الجديد</span>
                <Switch
                  checked={settings.allowNewSignups}
                  onCheckedChange={(v) =>
                    setSettings({ ...settings, allowNewSignups: v })
                  }
                  disabled={loading || saving}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <span>التحقق من البريد الإلكتروني</span>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(v) =>
                    setSettings({ ...settings, requireEmailVerification: v })
                  }
                  disabled={loading || saving}
                />
              </div>
              <Button
                className="bg-accent hover:bg-accent/90"
                onClick={handleSave}
                disabled={loading || saving}
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الأمان</CardTitle>
                <CardDescription>إعدادات أمان النظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span>وضع الصيانة</span>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(v) =>
                      setSettings({ ...settings, maintenanceMode: v })
                    }
                    disabled={loading || saving}
                  />
                </div>
                <div>
                  <Label>رسالة الصيانة</Label>
                  <Textarea
                    placeholder="الرسالة المعروضة للمستخدمين"
                    className="mt-2"
                    value={settings.maintenanceMessage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maintenanceMessage: e.target.value,
                      })
                    }
                    rows={3}
                    disabled={loading || saving}
                  />
                </div>
                <Button
                  className="bg-accent hover:bg-accent/90"
                  onClick={handleSave}
                  disabled={loading || saving}
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin MFA</CardTitle>
                <CardDescription>
                  MFA is mandatory for every admin session. Recovery codes are one-time use only.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">MFA status</span>
                    <span className={adminSecurity.mfaEnabled ? 'text-green-600' : 'text-red-500'}>
                      {adminSecurity.mfaEnabled ? 'Enabled' : 'Enrollment required'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recovery codes remaining: {adminSecurity.recoveryCodesRemaining}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enrolled at:{' '}
                    {adminSecurity.mfaEnrolledAt
                      ? new Date(adminSecurity.mfaEnrolledAt).toLocaleString()
                      : 'Not enrolled yet'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {!adminSecurity.mfaEnabled ? (
                    <Button
                      type="button"
                      onClick={() => {
                        window.location.href = '/admin/mfa?mode=enroll';
                      }}
                      disabled={loading || mfaActionPending}
                    >
                      Complete MFA enrollment
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleRegenerateRecoveryCodes()}
                    disabled={loading || mfaActionPending || !adminSecurity.mfaEnabled}
                  >
                    {mfaActionPending ? 'Processing...' : 'Regenerate recovery codes'}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => void handleDisableMfa()}
                    disabled={loading || mfaActionPending || !adminSecurity.mfaEnabled}
                  >
                    Disable MFA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="addons">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Amazon S3 Storage</CardTitle>
                <CardDescription>إعدادات تخزين النسخ على S3 أو S3-compatible مع دعم Cloudflare R2</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {s3EnvFallbackActive ? (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                      {s3ConfigSource === 'env'
                        ? 'تم تعبئة إعدادات S3 تلقائيًا من ملف .env لأن قاعدة البيانات لا تحتوي على القيم الكاملة بعد.'
                        : 'بعض إعدادات S3 تُعرض حاليًا من ملف .env لإكمال القيم الناقصة في قاعدة البيانات.'}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span>تفعيل S3 Add-on</span>
                  <Switch
                    checked={settings.s3Enabled}
                    onCheckedChange={(v) =>
                      setSettings({ ...settings, s3Enabled: v })
                    }
                    disabled={loading || saving}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>S3 Endpoint</Label>
                    <Input
                      value={settings.s3Endpoint}
                      onChange={(e) =>
                        setSettings({ ...settings, s3Endpoint: e.target.value })
                      }
                      className="mt-2"
                      placeholder="https://s3.amazonaws.com"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <Label>S3 Region</Label>
                    <Input
                      value={settings.s3Region}
                      onChange={(e) =>
                        setSettings({ ...settings, s3Region: e.target.value })
                      }
                      className="mt-2"
                      placeholder="us-east-1"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <Label>Public/Base URL</Label>
                    <Input
                      value={settings.s3PublicUrl}
                      onChange={(e) =>
                        setSettings({ ...settings, s3PublicUrl: e.target.value })
                      }
                      className="mt-2"
                      placeholder="https://cdn.example.com"
                      disabled={loading || saving}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Bucket Name</Label>
                    <Input
                      value={settings.s3Bucket}
                      onChange={(e) =>
                        setSettings({ ...settings, s3Bucket: e.target.value })
                      }
                      className="mt-2"
                      placeholder="ovmon-backups"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <Label>Access Key</Label>
                    <Input
                      value={settings.s3AccessKey}
                      onChange={(e) =>
                        setSettings({ ...settings, s3AccessKey: e.target.value })
                      }
                      className="mt-2"
                      placeholder="AKIA..."
                      disabled={loading || saving}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Secret Key</Label>
                    <Input
                      type="password"
                      value={settings.s3SecretKey}
                      onChange={(e) =>
                        setSettings({ ...settings, s3SecretKey: e.target.value })
                      }
                      className="mt-2"
                      placeholder="••••••••••••••••"
                      disabled={loading || saving}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 mt-8 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium">Use Path-Style Endpoint</p>
                      <p className="text-sm text-muted-foreground">
                        فعّل هذا الخيار فقط إذا كان مزود S3-compatible يتطلب path-style.
                      </p>
                    </div>
                    <Switch
                      checked={settings.s3UsePathStyle}
                      onCheckedChange={(v) =>
                        setSettings({ ...settings, s3UsePathStyle: v })
                      }
                      disabled={loading || saving}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMTP / Email</CardTitle>
                <CardDescription>إعدادات خادم البريد الإلكتروني لإرسال رسائل التحقق والإشعارات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">تفعيل SMTP</p>
                    <p className="text-sm text-muted-foreground">
                      فعّل لإرسال البريد عبر SMTP بدلاً من الخدمات الخارجية
                    </p>
                  </div>
                  <Switch
                    checked={settings.smtpEnabled}
                    onCheckedChange={(v) =>
                      setSettings({ ...settings, smtpEnabled: v })
                    }
                    disabled={loading || saving}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>SMTP Host</Label>
                    <Input
                      value={settings.smtpHost}
                      onChange={(e) =>
                        setSettings({ ...settings, smtpHost: e.target.value })
                      }
                      className="mt-2"
                      placeholder="smtp.gmail.com"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <Label>SMTP Port</Label>
                    <Input
                      value={settings.smtpPort}
                      onChange={(e) =>
                        setSettings({ ...settings, smtpPort: e.target.value })
                      }
                      className="mt-2"
                      placeholder="587"
                      disabled={loading || saving}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Username / Email</Label>
                    <Input
                      value={settings.smtpUsername}
                      onChange={(e) =>
                        setSettings({ ...settings, smtpUsername: e.target.value })
                      }
                      className="mt-2"
                      placeholder="your-email@gmail.com"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <Label>Password / App Password</Label>
                    <Input
                      type="password"
                      value={settings.smtpPassword}
                      onChange={(e) =>
                        setSettings({ ...settings, smtpPassword: e.target.value })
                      }
                      className="mt-2"
                      placeholder="••••••••••••••••"
                      disabled={loading || saving}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Encryption</Label>
                    <select
                      value={settings.smtpEncryption}
                      onChange={(e) =>
                        setSettings({ ...settings, smtpEncryption: e.target.value })
                      }
                      className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={loading || saving}
                    >
                      <option value="tls">TLS (Port 587)</option>
                      <option value="ssl">SSL (Port 465)</option>
                      <option value="none">None (Port 25)</option>
                    </select>
                  </div>
                  <div>
                    <Label>From Address</Label>
                    <Input
                      type="email"
                      value={settings.smtpFromAddress}
                      onChange={(e) =>
                        setSettings({ ...settings, smtpFromAddress: e.target.value })
                      }
                      className="mt-2"
                      placeholder="noreply@yourdomain.com"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <Label>From Name</Label>
                    <Input
                      value={settings.smtpFromName}
                      onChange={(e) =>
                        setSettings({ ...settings, smtpFromName: e.target.value })
                      }
                      className="mt-2"
                      placeholder="Ovmon"
                      disabled={loading || saving}
                    />
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    للحصول على App Password من Gmail: اذهب إلى Google Account {'->'} Security {'->'} 2-Step Verification {'->'} App passwords
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cloudflare Turnstile</CardTitle>
                <CardDescription>إعدادات CAPTCHA للحماية من البوتات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span>تفعيل Turnstile Add-on</span>
                  <Switch
                    checked={settings.turnstileEnabled}
                    onCheckedChange={(v) =>
                      setSettings({ ...settings, turnstileEnabled: v })
                    }
                    disabled={loading || saving}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Site Key</Label>
                    <Input
                      value={settings.turnstileSiteKey}
                      onChange={(e) =>
                        setSettings({ ...settings, turnstileSiteKey: e.target.value })
                      }
                      className="mt-2"
                      placeholder="0x4AAAAA..."
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <Label>Secret Key</Label>
                    <Input
                      type="password"
                      value={settings.turnstileSecretKey}
                      onChange={(e) =>
                        setSettings({ ...settings, turnstileSecretKey: e.target.value })
                      }
                      className="mt-2"
                      placeholder="0x4AAAAA...secret"
                      disabled={loading || saving}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="bg-accent hover:bg-accent/90"
              onClick={handleSave}
              disabled={loading || saving}
            >
              {saving ? 'جاري الحفظ...' : 'حفظ إعدادات Add-ons'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
