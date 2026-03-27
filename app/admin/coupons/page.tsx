'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  valid_until: string | null;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountValue: '', discountType: 'percentage' });
  const [loading, setLoading] = useState(false);

  const handleCreateCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discountValue) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCoupon.code,
          discount_value: parseFloat(newCoupon.discountValue),
          discount_type: newCoupon.discountType,
        }),
      });

      if (res.ok) {
        alert('Coupon created successfully');
        setNewCoupon({ code: '', discountValue: '', discountType: 'percentage' });
        // Reload coupons
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Coupons & Discounts</h1>
        <p className="text-gray-600">Manage promotional codes and discounts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Coupon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Coupon code"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
            />
            <Input
              placeholder="Discount value"
              type="number"
              value={newCoupon.discountValue}
              onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
            />
            <select
              value={newCoupon.discountType}
              onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
              className="px-3 py-2 border rounded-md"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>
          <Button onClick={handleCreateCoupon} disabled={loading}>
            {loading ? 'Creating...' : 'Create Coupon'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
          <CardDescription>All promotional codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coupons.filter(c => c.is_active).map((coupon) => (
              <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-mono font-bold">{coupon.code}</div>
                  <div className="text-sm text-gray-600">
                    {coupon.discount_value}{coupon.discount_type === 'percentage' ? '%' : '$'} off
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div>{coupon.current_uses}/{coupon.max_uses || '∞'} uses</div>
                    {coupon.valid_until && (
                      <div className="text-gray-600">
                        Expires: {new Date(coupon.valid_until).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Badge>Active</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
