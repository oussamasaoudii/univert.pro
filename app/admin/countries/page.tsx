'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Globe,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertCircle,
  Check,
  X,
  Star,
} from 'lucide-react';
import type { Country } from '@/lib/countries/types';

type CountryFormData = {
  isoCode: string;
  slug: string;
  name: string;
  nameNative: string;
  currencyCode: string;
  currencySymbol: string;
  locale: string;
  textDirection: 'ltr' | 'rtl';
  flagEmoji: string;
  isDefault: boolean;
  isActive: boolean;
  position: number;
};

const defaultFormData: CountryFormData = {
  isoCode: '',
  slug: '',
  name: '',
  nameNative: '',
  currencyCode: '',
  currencySymbol: '',
  locale: 'en-US',
  textDirection: 'ltr',
  flagEmoji: '',
  isDefault: false,
  isActive: true,
  position: 0,
};

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [deletingCountry, setDeletingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState<CountryFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  const loadCountries = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/countries', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to load countries');
      }
      
      setCountries(Array.isArray(result?.countries) ? result.countries : []);
    } catch (error) {
      console.error('[admin/countries] Failed to load countries', error);
      setErrorMessage('Failed to load countries from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  const handleOpenCreate = () => {
    setEditingCountry(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (country: Country) => {
    setEditingCountry(country);
    setFormData({
      isoCode: country.isoCode,
      slug: country.slug,
      name: country.name,
      nameNative: country.nameNative || '',
      currencyCode: country.currencyCode,
      currencySymbol: country.currencySymbol,
      locale: country.locale,
      textDirection: country.textDirection,
      flagEmoji: country.flagEmoji || '',
      isDefault: country.isDefault,
      isActive: country.isActive,
      position: country.position,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (country: Country) => {
    setDeletingCountry(country);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const url = editingCountry
        ? `/api/admin/countries/${editingCountry.id}`
        : '/api/admin/countries';
      
      const response = await fetch(url, {
        method: editingCountry ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to save country');
      }

      setSuccessMessage(
        editingCountry ? 'Country updated successfully' : 'Country created successfully'
      );
      setIsDialogOpen(false);
      loadCountries();
    } catch (error) {
      console.error('[admin/countries] Failed to save country', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save country');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCountry) return;

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/countries/${deletingCountry.id}`, {
        method: 'DELETE',
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to delete country');
      }

      setSuccessMessage('Country deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingCountry(null);
      loadCountries();
    } catch (error) {
      console.error('[admin/countries] Failed to delete country', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete country');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (country: Country) => {
    try {
      const response = await fetch(`/api/admin/countries/${country.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !country.isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update country');
      }

      loadCountries();
    } catch (error) {
      console.error('[admin/countries] Failed to toggle active', error);
      setErrorMessage('Failed to update country status');
    }
  };

  const handleSetDefault = async (country: Country) => {
    try {
      const response = await fetch(`/api/admin/countries/${country.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to set default country');
      }

      setSuccessMessage(`${country.name} is now the default country`);
      loadCountries();
    } catch (error) {
      console.error('[admin/countries] Failed to set default', error);
      setErrorMessage('Failed to set default country');
    }
  };

  const activeCount = countries.filter((c) => c.isActive).length;
  const defaultCountry = countries.find((c) => c.isDefault);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Country Management</h1>
          <p className="text-muted-foreground">
            Manage countries, currencies, and localization settings
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Country
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCountry ? 'Edit Country' : 'Add New Country'}
              </DialogTitle>
              <DialogDescription>
                {editingCountry
                  ? 'Update country details and localization settings'
                  : 'Add a new country with its currency and locale configuration'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isoCode">ISO Code *</Label>
                  <Input
                    id="isoCode"
                    placeholder="US"
                    maxLength={2}
                    value={formData.isoCode}
                    onChange={(e) =>
                      setFormData({ ...formData, isoCode: e.target.value.toUpperCase() })
                    }
                  />
                  <p className="text-xs text-muted-foreground">2-letter ISO 3166-1 code</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    placeholder="usa"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Used in URLs: /usa/pricing</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (English) *</Label>
                  <Input
                    id="name"
                    placeholder="United States"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameNative">Name (Native)</Label>
                  <Input
                    id="nameNative"
                    placeholder="United States"
                    value={formData.nameNative}
                    onChange={(e) => setFormData({ ...formData, nameNative: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currencyCode">Currency Code *</Label>
                  <Input
                    id="currencyCode"
                    placeholder="USD"
                    maxLength={3}
                    value={formData.currencyCode}
                    onChange={(e) =>
                      setFormData({ ...formData, currencyCode: e.target.value.toUpperCase() })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Currency Symbol *</Label>
                  <Input
                    id="currencySymbol"
                    placeholder="$"
                    value={formData.currencySymbol}
                    onChange={(e) =>
                      setFormData({ ...formData, currencySymbol: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flagEmoji">Flag Emoji</Label>
                  <Input
                    id="flagEmoji"
                    placeholder="🇺🇸"
                    value={formData.flagEmoji}
                    onChange={(e) => setFormData({ ...formData, flagEmoji: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locale">Locale *</Label>
                  <Input
                    id="locale"
                    placeholder="en-US"
                    value={formData.locale}
                    onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Used for number/date formatting</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textDirection">Text Direction</Label>
                  <Select
                    value={formData.textDirection}
                    onValueChange={(value: 'ltr' | 'rtl') =>
                      setFormData({ ...formData, textDirection: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ltr">Left to Right (LTR)</SelectItem>
                      <SelectItem value="rtl">Right to Left (RTL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Sort Position</Label>
                <Input
                  id="position"
                  type="number"
                  min={0}
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Country will be available for selection
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Default Country</Label>
                  <p className="text-sm text-muted-foreground">
                    Used when no country is detected
                  </p>
                </div>
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDefault: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : editingCountry ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Total Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countries.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
              <Check className="w-4 h-4" />
              Active Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="w-4 h-4" />
              Default Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {defaultCountry ? (
                <span className="flex items-center gap-2">
                  {defaultCountry.flagEmoji} {defaultCountry.name}
                </span>
              ) : (
                'Not set'
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Country</TableHead>
                  <TableHead>ISO / Slug</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Locale</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading countries...
                    </TableCell>
                  </TableRow>
                ) : countries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No countries found. Add your first country to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  countries.map((country) => (
                    <TableRow key={country.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {country.flagEmoji && (
                            <span className="text-2xl">{country.flagEmoji}</span>
                          )}
                          <div>
                            <p className="font-medium">{country.name}</p>
                            {country.nameNative && country.nameNative !== country.name && (
                              <p className="text-sm text-muted-foreground">{country.nameNative}</p>
                            )}
                          </div>
                          {country.isDefault && (
                            <Badge variant="secondary" className="ml-2">
                              <Star className="w-3 h-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline">{country.isoCode}</Badge>
                          <p className="text-xs text-muted-foreground">/{country.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-mono">{country.currencySymbol}</span>
                          <span className="text-muted-foreground">{country.currencyCode}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
                          {country.locale}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={country.textDirection === 'rtl' ? 'secondary' : 'outline'}>
                          {country.textDirection.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-2"
                          onClick={() => handleToggleActive(country)}
                        >
                          {country.isActive ? (
                            <>
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-green-600">Active</span>
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Inactive</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleOpenEdit(country)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {!country.isDefault && (
                              <DropdownMenuItem onClick={() => handleSetDefault(country)}>
                                <Star className="w-4 h-4 mr-2" />
                                Set as Default
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleOpenDelete(country)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Country</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingCountry?.name}? This will also delete all
              associated pricing data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
