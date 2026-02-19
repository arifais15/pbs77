"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        setIsAuth(true);
        const role = sessionStorage.getItem('userRole');
        if (role === 'admin') {
          setIsAdmin(true);
        }
      } else {
        router.push('/');
      }
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userEmail');
    await signOut(auth);
    router.push('/');
  };
  
  if (isUserLoading || !isAuth) {
    return (
       <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
          <nav className="flex w-full items-center justify-between">
             <Skeleton className="h-6 w-48" />
             <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-9 w-24" />
             </div>
          </nav>
        </header>
        <main className="flex-1 p-8">
            <Skeleton className="h-32 w-full" />
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 no-print-area">
        <nav className="flex w-full items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2 font-semibold">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-headline">ARIF-AGMF-GPBS-2</span>
          </a>
          <div className="flex items-center gap-2">
             {isAdmin && (
              <Button asChild variant="outline" size="sm">
                 <Link href="/dashboard/admin">
                  <ShieldCheck className="mr-2 h-4 w-4" /> Admin
                </Link>
              </Button>
            )}
            <Button asChild size="sm">
              <Link href="/application-form">
                Create Application <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
