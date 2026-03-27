'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Eye, EyeOff } from 'lucide-react';

interface APIKey {
  id: string;
  name: string | null;
  key_prefix: string;
  scopes: string[];
  rate_limit: number;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKeys = async () => {
      try {
        const res = await fetch('/api/api-keys');
        if (res.ok) {
          const data = await res.json();
          setApiKeys(data.apiKeys);
        }
      } catch (error) {
        console.error('Error loading API keys:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKeys();
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyName) {
      alert('Please enter a key name');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName, scopes: [] }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedKey(data.key);
        setApiKeys([data.apiKey, ...apiKeys]);
        setNewKeyName('');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-gray-600">Manage API keys for integrations</p>
      </div>

      {createdKey && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">API Key Created Successfully</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-green-700">Copy this key now. You won't be able to see it again.</p>
            <div className="flex gap-2">
              <Input
                value={createdKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={() => copyToClipboard(createdKey)} size="sm">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={() => setCreatedKey(null)} variant="outline">
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showNewKey ? (
            <Button onClick={() => setShowNewKey(true)}>
              Generate New Key
            </Button>
          ) : (
            <>
              <Input
                placeholder="Key name (e.g., 'Production API')"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateKey} disabled={loading}>
                  {loading ? 'Creating...' : 'Create'}
                </Button>
                <Button onClick={() => setShowNewKey(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active API Keys</CardTitle>
          <CardDescription>All API keys for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">Loading...</div>
          ) : apiKeys.length === 0 ? (
            <div className="flex justify-center py-8 text-gray-500">
              No API keys created yet
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">{key.name || 'Unnamed Key'}</div>
                    <div className="text-sm text-gray-600 font-mono">
                      {visibleKeys.has(key.id) ? key.key_prefix : key.key_prefix + '****'}
                    </div>
                    {key.last_used_at && (
                      <div className="text-sm text-gray-600">
                        Last used: {new Date(key.last_used_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(key.id)}
                    >
                      {visibleKeys.has(key.id) ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
