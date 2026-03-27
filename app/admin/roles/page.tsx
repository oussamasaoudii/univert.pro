'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2 } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions_count: number;
}

export default function RBACPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  const defaultRoles = [
    { id: '1', name: 'Admin', description: 'Full system access', is_system: true, permissions_count: 50 },
    { id: '2', name: 'Editor', description: 'Can edit content', is_system: true, permissions_count: 15 },
    { id: '3', name: 'Viewer', description: 'Read-only access', is_system: true, permissions_count: 5 },
    { id: '4', name: 'Support Agent', description: 'Support team member', is_system: false, permissions_count: 8 },
  ];

  useEffect(() => {
    setRoles(defaultRoles);
    setLoading(false);
  }, []);

  const handleCreateRole = async () => {
    if (!newRole.name) {
      alert('Please enter a role name');
      return;
    }

    setLoading(true);
    try {
      // API call would go here
      const newRoleObj = {
        id: String(roles.length + 1),
        name: newRole.name,
        description: newRole.description,
        is_system: false,
        permissions_count: 0,
      };
      setRoles([...roles, newRoleObj]);
      setNewRole({ name: '', description: '' });
      setShowNewRole(false);
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        <p className="text-gray-600">Manage system roles and access permissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showNewRole ? (
            <Button onClick={() => setShowNewRole(true)}>
              Create New Role
            </Button>
          ) : (
            <>
              <Input
                placeholder="Role name (e.g., 'Moderator')"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateRole} disabled={loading}>
                  {loading ? 'Creating...' : 'Create'}
                </Button>
                <Button onClick={() => setShowNewRole(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{role.name}</h3>
                    {role.is_system && <Badge>System</Badge>}
                  </div>
                  {role.description && (
                    <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {role.permissions_count} permissions assigned
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  {!role.is_system && (
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions List</CardTitle>
          <CardDescription>System permissions that can be assigned to roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'users.view', 'users.create', 'users.edit', 'users.delete',
              'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
              'settings.view', 'settings.edit', 'reports.view', 'reports.export'
            ].map((perm) => (
              <div key={perm} className="p-2 bg-gray-50 rounded text-sm font-mono">
                {perm}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
