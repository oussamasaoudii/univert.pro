'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Database, Globe, Server, Shield, Zap, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

export default function ProvisioningProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProvisioningProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    params.then(({ id }) => setProfileId(id));
  }, [params]);

  useEffect(() => {
    if (!profileId) return;

    const loadProfile = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await fetch(`/api/admin/profiles/${profileId}`, { cache: 'no-store' });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (response.status === 404) {
            setProfile(null);
            return;
          }
          throw new Error(String(result?.error || 'failed_to_load_profile'));
        }

        setProfile((result?.profile as ProvisioningProfile) || null);
      } catch (error) {
        console.error('[admin/profiles/:id] failed to load profile', error);
        setErrorMessage('Failed to load profile from MySQL.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [profileId]);

  if (isLoading) {
    return <div className="space-y-4"><p className="text-muted-foreground">Loading profile...</p></div>;
  }

  if (errorMessage) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <Link href="/admin/profiles">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Profiles
          </Button>
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Not Found</h1>
          <p className="text-muted-foreground">This profile does not exist or was deleted.</p>
        </div>
        <Link href="/admin/profiles">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Profiles
          </Button>
        </Link>
      </div>
    );
  }

  const createdAt = new Date(profile.created).toLocaleDateString('en-US');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/profiles">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
          <p className="text-muted-foreground">Provisioning profile details from MySQL</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Websites</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{profile.websites}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{profile.stack}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{createdAt}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Deployment Method
            </p>
            <p className="font-medium">{profile.method}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Database className="h-3 w-3" />
              Database
            </p>
            <p className="font-medium">{profile.database}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Domain
            </p>
            <p className="font-medium">{profile.domain}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              SSL
            </p>
            <p className="font-medium">{profile.ssl}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Server className="h-3 w-3" />
              Target Server
            </p>
            <p className="font-medium">{profile.server}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
