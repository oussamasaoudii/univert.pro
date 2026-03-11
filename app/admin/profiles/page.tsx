'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  MoreVertical,
  Edit,
  Copy,
  ToggleLeft,
  Trash2,
  Database,
  Globe,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

type ProvisioningProfile = {
  id: string;
  name: string;
  stack: string;
  method: string;
  server: string;
  database: string;
  domain: string;
  ssl: string;
  status: 'active' | 'disabled';
  websites: number;
  created: string;
  updatedAt: string;
};

type NewProfileForm = {
  name: string;
  stack: string;
  method: string;
  server: string;
  database: string;
  domain: string;
  ssl: string;
  status: ProvisioningProfile['status'];
};

const INITIAL_FORM: NewProfileForm = {
  name: '',
  stack: 'Next.js',
  method: 'Docker',
  server: 'US East Primary',
  database: 'Managed',
  domain: 'Auto',
  ssl: "Let's Encrypt",
  status: 'active',
};

export default function ProvisioningProfilesPage() {
  const [profiles, setProfiles] = useState<ProvisioningProfile[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<NewProfileForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadProfiles = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/profiles', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_profiles'));
      }

      setProfiles(Array.isArray(result?.profiles) ? result.profiles : []);
    } catch (error) {
      console.error('[admin/profiles] failed to load', error);
      setErrorMessage('Failed to load provisioning profiles from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const activeCount = useMemo(
    () => profiles.filter((profile) => profile.status === 'active').length,
    [profiles],
  );

  const handleCreateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/profiles', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_create_profile'));
      }

      if (result?.profile) {
        setProfiles((previous) => [...previous, result.profile as ProvisioningProfile]);
      } else {
        await loadProfiles();
      }

      setForm(INITIAL_FORM);
      setIsCreateOpen(false);
      setSuccessMessage('Profile created successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create profile');
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = async (
    id: string,
    payload: Record<string, unknown>,
    successText: string,
  ) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_update_profile'));
      }

      if (result?.profile) {
        const updated = result.profile as ProvisioningProfile;
        setProfiles((previous) => previous.map((profile) => (profile.id === updated.id ? updated : profile)));
      } else {
        await loadProfiles();
      }

      setSuccessMessage(successText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const removeProfile = async (id: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/profiles/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_delete_profile'));
      }

      setProfiles((previous) => previous.filter((profile) => profile.id !== id));
      setSuccessMessage('Profile deleted successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete profile');
    }
  };

  const duplicateProfile = async (profile: ProvisioningProfile) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/profiles', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          name: `${profile.name} Copy`,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_duplicate_profile'));
      }

      if (result?.profile) {
        setProfiles((previous) => [...previous, result.profile as ProvisioningProfile]);
      } else {
        await loadProfiles();
      }

      setSuccessMessage('Profile duplicated successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to duplicate profile');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Provisioning Profiles</h1>
          <p className="text-muted-foreground">Profiles are now loaded from MySQL backend</p>
        </div>
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) setForm(INITIAL_FORM);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Create Provisioning Profile</DialogTitle>
              <DialogDescription>Add a new deployment profile stored in MySQL.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Profile Name</Label>
                <Input
                  id="profile-name"
                  value={form.name}
                  onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                  placeholder="My New Profile"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stack</Label>
                  <Select value={form.stack} onValueChange={(value) => setForm((p) => ({ ...p, stack: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Next.js">Next.js</SelectItem>
                      <SelectItem value="Laravel">Laravel</SelectItem>
                      <SelectItem value="WordPress">WordPress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={form.method} onValueChange={(value) => setForm((p) => ({ ...p, method: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Docker">Docker</SelectItem>
                      <SelectItem value="Traditional">Traditional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Server</Label>
                  <Input
                    value={form.server}
                    onChange={(event) => setForm((previous) => ({ ...previous, server: event.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Database</Label>
                  <Select value={form.database} onValueChange={(value) => setForm((p) => ({ ...p, database: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Managed">Managed</SelectItem>
                      <SelectItem value="Server">Server</SelectItem>
                      <SelectItem value="External">External</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Domain</Label>
                  <Select value={form.domain} onValueChange={(value) => setForm((p) => ({ ...p, domain: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Auto">Auto</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>SSL</Label>
                  <Select value={form.ssl} onValueChange={(value) => setForm((p) => ({ ...p, ssl: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Let's Encrypt">Let's Encrypt</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((previous) => ({ ...previous, status: value as ProvisioningProfile['status'] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="disabled">disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !form.name.trim()}>
                  {saving ? 'Saving...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Total Profiles</p>
            <p className="text-2xl font-bold">{profiles.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Active Profiles</p>
            <p className="text-2xl font-bold text-green-500">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Disabled Profiles</p>
            <p className="text-2xl font-bold text-orange-500">{profiles.length - activeCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Deployment Profiles</CardTitle>
          <CardDescription>Connected to MySQL with full CRUD actions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading profiles...</div>
          ) : profiles.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No profiles found.</div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <Card key={profile.id} className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link href={`/admin/profiles/${profile.id}`} className="font-semibold hover:text-accent transition-colors">
                            {profile.name}
                          </Link>
                          <Badge variant="outline">{profile.stack}</Badge>
                          <Badge
                            variant="outline"
                            className={
                              profile.status === 'active'
                                ? 'bg-green-500/10 text-green-600 border-green-500/30'
                                : 'bg-gray-500/10 text-gray-600 border-gray-500/30'
                            }
                          >
                            {profile.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Zap className="w-3 h-3" />{profile.method}</span>
                          <span className="inline-flex items-center gap-1"><Database className="w-3 h-3" />{profile.database}</span>
                          <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3" />{profile.domain}</span>
                          <span className="inline-flex items-center gap-1"><Shield className="w-3 h-3" />{profile.ssl}</span>
                          <span>{profile.server}</span>
                          <span>{profile.websites} websites</span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/profiles/${profile.id}`} className="gap-2">
                              <Edit className="w-4 h-4" />
                              Open details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => duplicateProfile(profile)}
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() =>
                              updateProfile(
                                profile.id,
                                {
                                  status: profile.status === 'active' ? 'disabled' : 'active',
                                },
                                'Profile status updated.',
                              )
                            }
                          >
                            <ToggleLeft className="w-4 h-4" />
                            {profile.status === 'active' ? 'Disable' : 'Enable'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-red-600" onClick={() => removeProfile(profile.id)}>
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
