'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="flex-1 bg-muted/30 md:ml-[var(--sidebar-width)] group-data-[collapsible=icon]:md:ml-[var(--sidebar-width-icon)] p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </SidebarProvider>
  );
}
