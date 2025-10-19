'use client';

import { useStaffAuth } from '@/context/StaffAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Logo } from '@/components/Logo';
import Link from 'next/link';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, role, isLoading, logout } = useStaffAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated || role !== 'kitchen') {
      router.replace('/staff/login');
    }
  }, [isAuthenticated, role, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/staff/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || role !== 'kitchen') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Kitchen Access Required</h2>
          <p className="text-muted-foreground">Please login with kitchen credentials to access this page.</p>
          <Button asChild>
            <Link href="/staff/login">
              Go to Login
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/kitchen">
            <Logo className="text-foreground" />
          </Link>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 bg-muted/30 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
