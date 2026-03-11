'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Globe,
  Search,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  MoreVertical,
  Star,
  Trash2,
  RefreshCw,
  XCircle,
} from 'lucide-react';

type AdminDomain = {
  id: string;
  domain: string;
  ownerEmail: string | null;
  websiteName: string | null;
  isPrimary: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed';
  sslStatus: 'pending' | 'active' | 'expired';
  createdAt: string;
};

type DomainForm = {
  domain: string;
  ownerEmail: string;
  websiteName: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  sslStatus: 'pending' | 'active' | 'expired';
  isPrimary: boolean;
};

const INITIAL_FORM: DomainForm = {
  domain: '',
  ownerEmail: '',
  websiteName: '',
  verificationStatus: 'pending',
  sslStatus: 'pending',
  isPrimary: false,
};

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<AdminDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DomainForm>(INITIAL_FORM);

  const loadDomains = async (search = '') => {
    setLoading(true);
    setErrorMessage('');

    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`/api/admin/domains${query}`, { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_domains'));
      }

      setDomains(Array.isArray(result?.domains) ? result.domains : []);
    } catch (error) {
      console.error('[admin/domains] failed to load domains', error);
      setErrorMessage('تعذر تحميل الدومينات من قاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDomains(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredDomains = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return domains;

    return domains.filter((domain) => {
      return (
        domain.domain.toLowerCase().includes(query) ||
        (domain.websiteName || '').toLowerCase().includes(query) ||
        (domain.ownerEmail || '').toLowerCase().includes(query)
      );
    });
  }, [domains, searchQuery]);

  const verifiedCount = domains.filter((d) => d.verificationStatus === 'verified').length;
  const sslActiveCount = domains.filter((d) => d.sslStatus === 'active').length;
  const primaryCount = domains.filter((d) => d.isPrimary).length;

  const handleCreateDomain = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          result?.error === 'owner_not_found'
            ? 'Email صاحب الدومين غير موجود في النظام'
            : result?.error === 'already_exists'
              ? 'هذا الدومين موجود مسبقًا'
              : result?.error === 'invalid_domain'
                ? 'صيغة الدومين غير صحيحة'
                : 'تعذر إضافة الدومين';
        throw new Error(message);
      }

      const created = result?.domain as AdminDomain | undefined;
      if (created) {
        setDomains((previous) => [created, ...previous]);
      } else {
        await loadDomains(searchQuery.trim());
      }

      setForm(INITIAL_FORM);
      setIsCreateOpen(false);
      setSuccessMessage('تمت إضافة الدومين بنجاح');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'تعذر إضافة الدومين');
    } finally {
      setSaving(false);
    }
  };

  const patchDomain = async (
    domainId: string,
    payload: Record<string, unknown>,
    successText: string,
  ) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/domains/${domainId}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_update_domain'));
      }

      const updated = result?.domain as AdminDomain | undefined;
      if (updated) {
        setDomains((previous) => previous.map((domain) => (domain.id === updated.id ? updated : domain)));
        if (payload.isPrimary === true) {
          setDomains((previous) =>
            previous.map((domain) => {
              if (domain.id === updated.id) return updated;
              if ((domain.ownerEmail || '') === (updated.ownerEmail || '') && (domain.websiteName || '') === (updated.websiteName || '')) {
                return { ...domain, isPrimary: false };
              }
              return domain;
            }),
          );
        }
      } else {
        await loadDomains(searchQuery.trim());
      }

      setSuccessMessage(successText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'تعذر تحديث الدومين');
    }
  };

  const removeDomain = async (domainId: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/domains/${domainId}`, {
        method: 'DELETE',
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_delete_domain'));
      }

      setDomains((previous) => previous.filter((domain) => domain.id !== domainId));
      setSuccessMessage('تم حذف الدومين');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'تعذر حذف الدومين');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domains</h1>
          <p className="text-muted-foreground">Manage all domains from MySQL backend</p>
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
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Add New Domain</DialogTitle>
              <DialogDescription>
                This domain will be stored in MySQL and shown to admin directly.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateDomain} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-domain">Domain</Label>
                <Input
                  id="new-domain"
                  placeholder="example.com"
                  value={form.domain}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, domain: event.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner-email">Owner Email (optional)</Label>
                  <Input
                    id="owner-email"
                    placeholder="user@example.com"
                    value={form.ownerEmail}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, ownerEmail: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website-name">Website Name (optional)</Label>
                  <Input
                    id="website-name"
                    placeholder="Marketing Site"
                    value={form.websiteName}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, websiteName: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Verification Status</Label>
                  <Select
                    value={form.verificationStatus}
                    onValueChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        verificationStatus: value as DomainForm['verificationStatus'],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">pending</SelectItem>
                      <SelectItem value="verified">verified</SelectItem>
                      <SelectItem value="failed">failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>SSL Status</Label>
                  <Select
                    value={form.sslStatus}
                    onValueChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        sslStatus: value as DomainForm['sslStatus'],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">pending</SelectItem>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="expired">expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Total Domains</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{domains.length}</p>
              <Globe className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Verified</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-green-500">{verifiedCount}</p>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">SSL Active</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-green-500">{sslActiveCount}</p>
              <Shield className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Primary</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{primaryCount}</p>
              <Star className="w-5 h-5 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Domain Records</CardTitle>
            <Button variant="outline" size="sm" onClick={() => loadDomains(searchQuery.trim())}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          <div className="relative max-w-sm mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search domain, website, owner..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-medium">Domain</th>
                  <th className="text-left py-3 px-3 font-medium">Website</th>
                  <th className="text-left py-3 px-3 font-medium">Owner</th>
                  <th className="text-left py-3 px-3 font-medium">Verification</th>
                  <th className="text-left py-3 px-3 font-medium">SSL</th>
                  <th className="text-left py-3 px-3 font-medium">Primary</th>
                  <th className="text-left py-3 px-3 font-medium">Created</th>
                  <th className="text-right py-3 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      Loading domains...
                    </td>
                  </tr>
                ) : filteredDomains.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No domains found
                    </td>
                  </tr>
                ) : (
                  filteredDomains.map((domain) => (
                    <tr key={domain.id} className="border-b border-border hover:bg-muted/40">
                      <td className="py-3 px-3 font-medium">{domain.domain}</td>
                      <td className="py-3 px-3 text-muted-foreground">{domain.websiteName || '-'}</td>
                      <td className="py-3 px-3 text-muted-foreground">{domain.ownerEmail || '-'}</td>
                      <td className="py-3 px-3">
                        <Badge
                          variant="outline"
                          className={
                            domain.verificationStatus === 'verified'
                              ? 'bg-green-500/10 text-green-600 border-green-500/30'
                              : domain.verificationStatus === 'failed'
                                ? 'bg-red-500/10 text-red-600 border-red-500/30'
                                : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
                          }
                        >
                          {domain.verificationStatus === 'verified' ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : domain.verificationStatus === 'failed' ? (
                            <XCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {domain.verificationStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant="outline"
                          className={
                            domain.sslStatus === 'active'
                              ? 'bg-green-500/10 text-green-600 border-green-500/30'
                              : domain.sslStatus === 'expired'
                                ? 'bg-red-500/10 text-red-600 border-red-500/30'
                                : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
                          }
                        >
                          {domain.sslStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        {domain.isPrimary ? (
                          <Badge className="bg-accent/10 text-accent border-accent/30">
                            <Star className="w-3 h-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {new Date(domain.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => patchDomain(domain.id, { isPrimary: true }, 'Primary domain updated')}
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Set as Primary
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                patchDomain(
                                  domain.id,
                                  { verificationStatus: 'verified' },
                                  'Verification status updated',
                                )
                              }
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark Verified
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                patchDomain(
                                  domain.id,
                                  { verificationStatus: 'failed' },
                                  'Verification status updated',
                                )
                              }
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Mark Failed
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                patchDomain(domain.id, { sslStatus: 'active' }, 'SSL status updated')
                              }
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              SSL Active
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                patchDomain(domain.id, { sslStatus: 'expired' }, 'SSL status updated')
                              }
                            >
                              <AlertCircle className="w-4 h-4 mr-2" />
                              SSL Expired
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => removeDomain(domain.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Domain
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
