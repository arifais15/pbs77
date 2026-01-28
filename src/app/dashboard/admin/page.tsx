'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ArrowLeft, Database, Upload, Users, Activity, Trash, Edit, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUsers, useActivities, useUpdateUser, useDeleteUser, useCreateUser } from '@/hooks/use-database';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);

  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useUsers();
  const { data: activities, isLoading: activitiesLoading } = useActivities({ limit: 10 });

  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const createUser = useCreateUser();

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    if (role !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
      });
      router.push('/dashboard');
    }
    setUserRole(role);
  }, []);

  if (!userRole || userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // ---------------- User Management Functions ----------------
  const handleAddUser = async () => {
    if (!newUserEmail) return toast({ variant: 'destructive', title: 'Email is required' });

    try {
      await createUser({ email: newUserEmail, role: newUserRole });
      toast({ variant: 'default', title: 'User added successfully' });
      setNewUserEmail('');
      refetchUsers();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error adding user', description: error.message });
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      await updateUser(user.id, { status: user.status === 'active' ? 'inactive' : 'active' });
      toast({ variant: 'default', title: `User ${user.status === 'active' ? 'deactivated' : 'activated'}` });
      refetchUsers();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error updating status', description: error.message });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast({ variant: 'default', title: 'User deleted successfully' });
      refetchUsers();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error deleting user', description: error.message });
    }
  };

  // ---------------- Render ----------------
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage system users and consumer data</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> System Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" /> Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activities?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Letter generations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" /> Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">SQLite</div>
              <p className="text-xs text-muted-foreground mt-1">Migration complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link href="/csv-import">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                Import Consumer Data (CSV)
              </Button>
            </Link>
            <Link href="/view-database">
              <Button variant="outline" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" />
                View All Consumers
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Users with Management */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <CardTitle>System Users</CardTitle>
              <CardDescription>All registered users ({users?.length || 0})</CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="email"
                placeholder="New user email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="input input-bordered input-sm"
              />
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'user')}
                className="select select-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <Button size="sm" onClick={handleAddUser}>
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : users && users.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                        {user.role}
                      </Badge>
                      <Badge
                        variant={user.status === 'active' ? 'outline' : 'destructive'}
                        className="text-xs cursor-pointer"
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
