'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AdminStepUpDialog } from '@/components/admin/admin-step-up-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Search,
  MoreHorizontal,
  Shield,
  Globe,
  Users,
  UserCheck,
  DollarSign,
  UserX,
  UserCheck2,
  Mail,
  AlertCircle,
} from 'lucide-react';

type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: 'user' | 'admin';
  status: 'pending' | 'active' | 'suspended';
  emailVerified: boolean;
  plan: string;
  totalRevenue: number;
  websitesCount: number;
  createdAt: string;
  lastLoginAt: string | null;
};

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const pendingStepUpActionRef = useRef<(() => Promise<void>) | null>(null);

  const loadUsers = async (search = '') => {
    setLoading(true);
    setErrorMessage('');

    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`/api/admin/users${query}`, { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_users'));
      }
      setUsers(Array.isArray(result?.users) ? result.users : []);
    } catch (error) {
      console.error('[admin/users] failed to load users', error);
      setErrorMessage('تعذر تحميل المستخدمين من قاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return users;
    }
    return users.filter((u) => {
      const name = (u.fullName || '').toLowerCase();
      return name.includes(query) || u.email.toLowerCase().includes(query);
    });
  }, [users, searchQuery]);

  const activeUsers = users.filter((u) => u.status === 'active').length;
  const proUsers = users.filter(
    (u) => u.plan === 'pro' || u.plan === 'premium' || u.plan === 'enterprise',
  ).length;
  const totalRevenue = users.reduce((sum, u) => sum + (u.totalRevenue || 0), 0);

  const updateUser = async (
    userId: string,
    payload: Partial<Pick<AdminUser, 'status' | 'role' | 'emailVerified'>>,
    successText: string,
  ) => {
    setUpdatingUserId(userId);
    setErrorMessage('');
    setActionMessage('');

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (String(result?.error || '').toLowerCase().includes('step_up_required')) {
          pendingStepUpActionRef.current = () => updateUser(userId, payload, successText);
          setStepUpOpen(true);
          return;
        }
        throw new Error(String(result?.error || 'failed_to_update_user'));
      }

      const updatedUser = result?.user as AdminUser | undefined;
      if (updatedUser) {
        setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
      } else {
        await loadUsers(searchQuery.trim());
      }

      setActionMessage(successText);
    } catch (error) {
      console.error('[admin/users] failed to update user', error);
      setErrorMessage('تعذر تنفيذ العملية على المستخدم');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Users are loaded from MySQL and controllable by admin</p>
      </div>

      <AdminStepUpDialog
        open={stepUpOpen}
        onOpenChange={setStepUpOpen}
        title="Confirm access before changing user permissions"
        description="Privilege changes require a fresh admin step-up verification."
        onVerified={() => {
          const pendingAction = pendingStepUpActionRef.current;
          pendingStepUpActionRef.current = null;
          if (pendingAction) {
            void pendingAction();
          }
        }}
      />

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {actionMessage && (
        <Alert>
          <AlertDescription>{actionMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Stored in database</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {users.length > 0 ? Math.round((activeUsers / users.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Linked to user records</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Premium Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Pro, Premium, Enterprise</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary border-border"
        />
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Websites</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const displayName = user.fullName || user.email.split('@')[0];
                    return (
                      <TableRow key={user.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-accent">
                                {displayName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{displayName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === 'admin' ? 'default' : 'outline'}
                            className={user.role === 'admin' ? 'bg-accent text-accent-foreground' : ''}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === 'active'
                                ? 'default'
                                : user.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                            className={
                              user.status === 'active'
                                ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20'
                                : ''
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {user.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-semibold text-foreground">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span>${Number(user.totalRevenue || 0).toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span>{user.websitesCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={updatingUserId === user.id}>
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              {user.status !== 'active' ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateUser(
                                      user.id,
                                      { status: 'active', emailVerified: true },
                                      'User activated successfully',
                                    )
                                  }
                                >
                                  <UserCheck2 className="w-4 h-4 mr-2" />
                                  Activate User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateUser(
                                      user.id,
                                      { status: 'suspended' },
                                      'User suspended successfully',
                                    )
                                  }
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() =>
                                  updateUser(
                                    user.id,
                                    { role: user.role === 'admin' ? 'user' : 'admin' },
                                    user.role === 'admin'
                                      ? 'User set as regular account'
                                      : 'User promoted to admin',
                                  )
                                }
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                {user.role === 'admin' ? 'Set as User' : 'Promote to Admin'}
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  updateUser(
                                    user.id,
                                    { emailVerified: !user.emailVerified },
                                    user.emailVerified
                                      ? 'Email marked as unverified'
                                      : 'Email marked as verified',
                                  )
                                }
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                {user.emailVerified ? 'Mark Email Unverified' : 'Mark Email Verified'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
