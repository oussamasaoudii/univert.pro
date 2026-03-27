'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Globe,
  DollarSign,
  Save,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import type { Country, BillingPeriod } from '@/lib/countries/types';
import type { BillingPlanRecord } from '@/lib/mysql/billing';

type PricingData = Record<
  number,
  Record<string, { monthly: number | null; yearly: number | null; stripePriceIdMonthly: string | null; stripePriceIdYearly: string | null }>
>;

type PriceEdit = {
  countryId: number;
  planId: string;
  billingPeriod: BillingPeriod;
  price: number;
  stripePriceId: string;
};

export default function AdminPricingPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [plans, setPlans] = useState<BillingPlanRecord[]>([]);
  const [pricingByCountry, setPricingByCountry] = useState<PricingData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [editedPrices, setEditedPrices] = useState<Map<string, PriceEdit>>(new Map());
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const loadPricingData = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/pricing', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to load pricing data');
      }

      setCountries(result.countries || []);
      setPlans(result.plans || []);
      setPricingByCountry(result.pricingByCountry || {});

      if (result.countries?.length > 0 && !selectedCountryId) {
        setSelectedCountryId(result.countries[0].id);
      }
    } catch (error) {
      console.error('[admin/pricing] Failed to load pricing', error);
      setErrorMessage('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricingData();
  }, []);

  const selectedCountry = useMemo(
    () => countries.find((c) => c.id === selectedCountryId),
    [countries, selectedCountryId]
  );

  const currentPricing = useMemo(() => {
    if (!selectedCountryId || !pricingByCountry[selectedCountryId]) {
      return {};
    }
    return pricingByCountry[selectedCountryId];
  }, [selectedCountryId, pricingByCountry]);

  const getPriceKey = (countryId: number, planId: string, period: BillingPeriod) =>
    `${countryId}-${planId}-${period}`;

  const getEditedPrice = (planId: string): PriceEdit | undefined => {
    if (!selectedCountryId) return undefined;
    return editedPrices.get(getPriceKey(selectedCountryId, planId, billingPeriod));
  };

  const getCurrentPrice = (planId: string): number | null => {
    const edited = getEditedPrice(planId);
    if (edited !== undefined) return edited.price;
    return currentPricing[planId]?.[billingPeriod] ?? null;
  };

  const getCurrentStripePriceId = (planId: string): string => {
    const edited = getEditedPrice(planId);
    if (edited !== undefined) return edited.stripePriceId;
    return billingPeriod === 'monthly'
      ? currentPricing[planId]?.stripePriceIdMonthly ?? ''
      : currentPricing[planId]?.stripePriceIdYearly ?? '';
  };

  const handlePriceChange = (planId: string, value: string) => {
    if (!selectedCountryId) return;

    const price = parseFloat(value) || 0;
    const key = getPriceKey(selectedCountryId, planId, billingPeriod);

    setEditedPrices((prev) => {
      const next = new Map(prev);
      next.set(key, {
        countryId: selectedCountryId,
        planId,
        billingPeriod,
        price,
        stripePriceId: getCurrentStripePriceId(planId),
      });
      return next;
    });
  };

  const handleStripePriceIdChange = (planId: string, value: string) => {
    if (!selectedCountryId) return;

    const key = getPriceKey(selectedCountryId, planId, billingPeriod);

    setEditedPrices((prev) => {
      const next = new Map(prev);
      const existing = next.get(key);
      next.set(key, {
        countryId: selectedCountryId,
        planId,
        billingPeriod,
        price: existing?.price ?? getCurrentPrice(planId) ?? 0,
        stripePriceId: value,
      });
      return next;
    });
  };

  const handleSaveAll = async () => {
    if (editedPrices.size === 0) {
      setErrorMessage('No changes to save');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const prices = Array.from(editedPrices.values()).map((edit) => ({
        countryId: edit.countryId,
        planId: edit.planId,
        billingPeriod: edit.billingPeriod,
        price: edit.price,
        stripePriceId: edit.stripePriceId || null,
        isActive: true,
      }));

      const response = await fetch('/api/admin/pricing/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to save pricing');
      }

      setSuccessMessage(`Saved ${result.saved} price(s) successfully`);
      setEditedPrices(new Map());
      loadPricingData();
    } catch (error) {
      console.error('[admin/pricing] Failed to save pricing', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save pricing');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = editedPrices.size > 0;

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    if (!selectedCountry) return `$${amount}`;

    try {
      return new Intl.NumberFormat(selectedCountry.locale, {
        style: 'currency',
        currency: selectedCountry.currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${selectedCountry.currencySymbol}${amount}`;
    }
  };

  const getDefaultPrice = (plan: BillingPlanRecord) => {
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Management</h1>
          <p className="text-muted-foreground">
            Set prices for each plan by country and billing period
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving || !hasChanges}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
          {hasChanges && (
            <Badge variant="secondary" className="ml-2">
              {editedPrices.size}
            </Badge>
          )}
        </Button>
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>
        <Card className={hasChanges ? 'bg-amber-500/10 border-amber-500/20' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Save className="w-4 h-4" />
              Pending Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{editedPrices.size}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configure Pricing</CardTitle>
              <CardDescription>
                Select a country and billing period to set prices
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="country-select" className="sr-only">
                  Country
                </Label>
                <Select
                  value={selectedCountryId?.toString() || ''}
                  onValueChange={(value) => setSelectedCountryId(parseInt(value, 10))}
                >
                  <SelectTrigger id="country-select" className="w-[200px]">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        <span className="flex items-center gap-2">
                          {country.flagEmoji} {country.name} ({country.currencyCode})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : countries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No countries configured. Add countries first in Country Management.
            </div>
          ) : (
            <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as BillingPeriod)}>
              <TabsList className="mb-4">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>

              <TabsContent value={billingPeriod}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Default Price (USD)</TableHead>
                      <TableHead>
                        {selectedCountry
                          ? `${selectedCountry.name} Price (${selectedCountry.currencyCode})`
                          : 'Local Price'}
                      </TableHead>
                      <TableHead>Stripe Price ID</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => {
                      const currentPrice = getCurrentPrice(plan.id);
                      const isEdited = getEditedPrice(plan.id) !== undefined;
                      const defaultPrice = getDefaultPrice(plan);

                      return (
                        <TableRow key={plan.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{plan.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {plan.tier}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              ${defaultPrice.toLocaleString()}
                              {billingPeriod === 'yearly' && '/yr'}
                              {billingPeriod === 'monthly' && '/mo'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {selectedCountry?.currencySymbol || '$'}
                              </span>
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                className={`w-32 ${isEdited ? 'border-amber-500' : ''}`}
                                value={currentPrice ?? ''}
                                placeholder={defaultPrice.toString()}
                                onChange={(e) => handlePriceChange(plan.id, e.target.value)}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              className={`w-64 font-mono text-xs ${isEdited ? 'border-amber-500' : ''}`}
                              value={getCurrentStripePriceId(plan.id)}
                              placeholder="price_..."
                              onChange={(e) =>
                                handleStripePriceIdChange(plan.id, e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {currentPrice !== null ? (
                              <Badge variant="default" className="bg-green-500/10 text-green-600">
                                Configured
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Using Default</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Quick Overview by Country */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Overview</CardTitle>
          <CardDescription>Quick view of configured prices across all countries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  {plans.map((plan) => (
                    <TableHead key={plan.id} className="text-center">
                      {plan.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {country.flagEmoji} {country.name}
                      </span>
                    </TableCell>
                    {plans.map((plan) => {
                      const pricing = pricingByCountry[country.id]?.[plan.id];
                      const monthlyPrice = pricing?.monthly;
                      const yearlyPrice = pricing?.yearly;

                      return (
                        <TableCell key={plan.id} className="text-center">
                          {monthlyPrice !== null || yearlyPrice !== null ? (
                            <div className="text-xs">
                              {monthlyPrice !== null && (
                                <div>
                                  {country.currencySymbol}
                                  {monthlyPrice}/mo
                                </div>
                              )}
                              {yearlyPrice !== null && (
                                <div className="text-muted-foreground">
                                  {country.currencySymbol}
                                  {yearlyPrice}/yr
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
