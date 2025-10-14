'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useStaffAuth } from '@/context/StaffAuthContext';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, role, isLoading } = useStaffAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated || (role !== 'kitchen' && role !== 'admin')) {
      router.replace('/staff/login');
    }
  }, [isAuthenticated, role, isLoading, router]);

  if (isLoading || !isAuthenticated || (role !== 'kitchen' && role !== 'admin')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verifying Access...</p>
      </div>
    );
  }

  return (
      <SidebarProvider>
        <AdminSidebar />
        <main className="flex-1 bg-muted/30 md:ml-[var(--sidebar-width)] group-data-[collapsible=icon]:md:ml-[var(--sidebar-width-icon)]">
            {children}
        </main>
    </SidebarProvider>
  );
}
