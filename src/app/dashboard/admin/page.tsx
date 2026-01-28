'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ArrowLeft, Database, Upload, Users, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUsers, useActivities } from '@/hooks/use-database';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: activities, isLoading: activitiesLoading } = useActivities({ limit: 10 });

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
                <Users className="h-4 w-4" />
                System Users
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
                <Activity className="h-4 w-4" />
                Recent Activities
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
                <Database className="h-4 w-4" />
                Database
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

        {/* System Users */}
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>All registered users ({users?.length || 0})</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : users && users.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                        {user.role}
                      </Badge>
                      <Badge variant={user.status === 'active' ? 'outline' : 'destructive'} className="text-xs">
                        {user.status}
                      </Badge>
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

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Letter Generations</CardTitle>
            <CardDescription>Last 10 activities</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading activities...</p>
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border text-sm hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium">{activity.consumerName || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.subject || 'No subject'} • {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono">{activity.accountNumber}</p>
                      <p className="text-xs text-muted-foreground">{activity.createdBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No activities yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">ℹ️ About SQLite Migration</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <p>
              This application has been migrated from Firebase Firestore to SQLite. All consumer data, user accounts, and letter activities are now stored locally in an SQLite database. 
            </p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>✅ Firebase Auth is still used for user authentication</li>
              <li>✅ All database operations use SQLite</li>
              <li>✅ CSV import with progress tracking</li>
              <li>✅ Full database viewer available</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
