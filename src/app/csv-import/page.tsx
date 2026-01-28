'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, Upload } from 'lucide-react';
import { CSVUpload } from '@/components/csv-upload';
import { useToast } from '@/hooks/use-toast';

export default function CSVImportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Upload className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Import Consumer Data</h1>
              <p className="text-muted-foreground">Upload CSV file with consumer records</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* CSV Upload Component */}
        <CSVUpload />

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/view-database">
            <Button variant="outline" className="w-full justify-start h-auto py-4">
              <Database className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">View Database</div>
                <div className="text-xs text-muted-foreground">Browse all consumer records</div>
              </div>
            </Button>
          </Link>
          
          <Link href="/dashboard/admin">
            <Button variant="outline" className="w-full justify-start h-auto py-4">
              <Upload className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Admin Dashboard</div>
                <div className="text-xs text-muted-foreground">Manage users and settings</div>
              </div>
            </Button>
          </Link>
        </div>

        {/* CSV Format Instructions */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">CSV File Format</h3>
          <p className="text-sm text-muted-foreground">Your CSV file should have these columns:</p>
          <div className="bg-background rounded p-3 font-mono text-sm overflow-x-auto">
            <div className="text-muted-foreground">accNo, name, guardian, meterNo, mobile, address, tarrif</div>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Example:</strong> ०००-१०००, मोसाः हामिदा आली, फाथर नेम, 12345, 9876543210, उदयपुर, D1
          </p>
        </div>
      </div>
    </div>
  );
}
