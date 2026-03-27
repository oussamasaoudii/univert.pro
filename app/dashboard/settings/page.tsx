'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Copy, Check, AlertTriangle } from 'lucide-react';
import { AvatarUpload } from '@/components/settings/avatar-upload';

type SettingsState = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  company: string;
  apiKey: string;
  avatarPath: string | null;
  emailNotifications: boolean;
  maintenanceAlerts: boolean;
  weeklyReports: boolean;
  twoFactor: boolean;
};

const INITIAL_SETTINGS: SettingsState = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  company: '',
  apiKey: '',
  avatarPath: null,
  emailNotifications: true,
  maintenanceAlerts: true,
  weeklyReports: false,
  twoFactor: false,
};

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/dashboard/settings', {
        cache: 'no-store',
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_settings'));
      }

      const next = (result?.settings || {}) as Partial<SettingsState>;
      setSettings({
        email: next.email || '',
        phone: next.phone || '',
        firstName: next.firstName || '',
        lastName: next.lastName || '',
        company: next.company || '',
        apiKey: next.apiKey || '',
        avatarPath: next.avatarPath || null,
        emailNotifications: Boolean(next.emailNotifications),
        maintenanceAlerts: Boolean(next.maintenanceAlerts),
        weeklyReports: Boolean(next.weeklyReports),
        twoFactor: Boolean(next.twoFactor),
      });
    } catch (error) {
      console.error('[dashboard/settings] failed to load', error);
      setErrorMessage('Failed to load settings from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const patchSettings = async (payload: Record<string, unknown>, successText: string) => {
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_update_settings'));
      }

      const next = (result?.settings || {}) as Partial<SettingsState>;
      setSettings((previous) => ({
        ...previous,
        email: next.email || previous.email,
        phone: next.phone || '',
        firstName: next.firstName || '',
        lastName: next.lastName || '',
        company: next.company || '',
        apiKey: next.apiKey || previous.apiKey,
        emailNotifications:
          typeof next.emailNotifications === 'boolean'
            ? next.emailNotifications
            : previous.emailNotifications,
        maintenanceAlerts:
          typeof next.maintenanceAlerts === 'boolean'
            ? next.maintenanceAlerts
            : previous.maintenanceAlerts,
        weeklyReports:
          typeof next.weeklyReports === 'boolean'
            ? next.weeklyReports
            : previous.weeklyReports,
        twoFactor: typeof next.twoFactor === 'boolean' ? next.twoFactor : previous.twoFactor,
      }));
      setSuccessMessage(successText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(settings.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences and security</p>
      </div>

      {loading && <Badge variant="secondary">Loading settings...</Badge>}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center pb-2">
                <AvatarUpload
                  currentAvatarPath={settings.avatarPath}
                  userInitials={
                    settings.firstName && settings.lastName
                      ? `${settings.firstName[0]}${settings.lastName[0]}`.toUpperCase()
                      : settings.email
                        ? settings.email.substring(0, 2).toUpperCase()
                        : 'U'
                  }
                  onAvatarChange={(pathname) =>
                    setSettings((previous) => ({ ...previous, avatarPath: pathname }))
                  }
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={settings.email} className="mt-1.5" disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    className="mt-1.5"
                    onChange={(event) => setSettings((previous) => ({ ...previous, phone: event.target.value }))}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fname">First Name</Label>
                  <Input
                    id="fname"
                    value={settings.firstName}
                    className="mt-1.5"
                    onChange={(event) => setSettings((previous) => ({ ...previous, firstName: event.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lname">Last Name</Label>
                  <Input
                    id="lname"
                    value={settings.lastName}
                    className="mt-1.5"
                    onChange={(event) => setSettings((previous) => ({ ...previous, lastName: event.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={settings.company}
                  className="mt-1.5"
                  onChange={(event) => setSettings((previous) => ({ ...previous, company: event.target.value }))}
                />
              </div>
              <Button
                onClick={() =>
                  patchSettings(
                    {
                      phone: settings.phone,
                      firstName: settings.firstName,
                      lastName: settings.lastName,
                      company: settings.company,
                    },
                    'Account settings saved.',
                  )
                }
                disabled={saving}
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Live API Key</Label>
                <div className="flex gap-2 mt-1.5">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-muted">
                    <code className="text-sm font-mono text-muted-foreground flex-1">
                      {showApiKey ? settings.apiKey : '•'.repeat(settings.apiKey.length || 20)}
                    </code>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-2">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => patchSettings({ regenerateApiKey: true }, 'API key regenerated.')}
                disabled={saving}
              >
                Regenerate Key
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Control how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive emails about your account activity</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings((previous) => ({ ...previous, emailNotifications: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Maintenance Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified about scheduled maintenance</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceAlerts}
                    onCheckedChange={(checked) => setSettings((previous) => ({ ...previous, maintenanceAlerts: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Weekly Reports</p>
                    <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => setSettings((previous) => ({ ...previous, weeklyReports: checked }))}
                  />
                </div>
              </div>
              <Button
                onClick={() =>
                  patchSettings(
                    {
                      emailNotifications: settings.emailNotifications,
                      maintenanceAlerts: settings.maintenanceAlerts,
                      weeklyReports: settings.weeklyReports,
                    },
                    'Notification preferences saved.',
                  )
                }
                disabled={saving}
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Protect your account with additional security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch
                    checked={settings.twoFactor}
                    onCheckedChange={(checked) => setSettings((previous) => ({ ...previous, twoFactor: checked }))}
                  />
                </div>
                <Separator />
              </div>

              <Button
                onClick={() => patchSettings({ twoFactor: settings.twoFactor }, 'Security settings saved.')}
                disabled={saving}
              >
                Save Security Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Account deletion is not enabled in this release.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
