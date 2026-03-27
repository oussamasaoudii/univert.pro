'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp } from 'lucide-react';

interface LoyaltyStats {
  total_users_with_points: number;
  total_points_distributed: number;
  avg_points_per_user: number;
  top_tier_users: number;
  total_redeemed_points: number;
}

export default function LoyaltyPage() {
  const [stats, setStats] = useState<LoyaltyStats>({
    total_users_with_points: 0,
    total_points_distributed: 0,
    avg_points_per_user: 0,
    top_tier_users: 0,
    total_redeemed_points: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - API would be called here
    setStats({
      total_users_with_points: 234,
      total_points_distributed: 45800,
      avg_points_per_user: 196,
      top_tier_users: 28,
      total_redeemed_points: 12300,
    });
    setLoading(false);
  }, []);

  const tiers = [
    { name: 'Bronze', minPoints: 0, color: 'bg-amber-100 text-amber-800' },
    { name: 'Silver', minPoints: 500, color: 'bg-slate-100 text-slate-800' },
    { name: 'Gold', minPoints: 1000, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Platinum', minPoints: 2000, color: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loyalty Program</h1>
        <p className="text-gray-600">Manage loyalty points and rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users_with_points}</div>
            <p className="text-xs text-gray-500">With points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_points_distributed.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Distributed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avg_points_per_user}</div>
            <p className="text-xs text-gray-500">Per user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.top_tier_users}</div>
            <p className="text-xs text-gray-500">Platinum members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Redeemed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_redeemed_points.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Total points</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loyalty Tiers</CardTitle>
          <CardDescription>Tier structure and requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div key={tier.name} className={`p-4 rounded-lg ${tier.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5" />
                  <h3 className="font-semibold">{tier.name}</h3>
                </div>
                <p className="text-sm font-mono">{tier.minPoints.toLocaleString()} pts</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Points Distribution</CardTitle>
          <CardDescription>How points are earned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'Monthly Subscription', points: 100 },
              { action: 'Annual Subscription', points: 1500 },
              { action: 'Referral', points: 250 },
              { action: 'Review Left', points: 25 },
              { action: 'Newsletter Signup', points: 50 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>{item.action}</span>
                <Badge variant="outline">{item.points} pts</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
