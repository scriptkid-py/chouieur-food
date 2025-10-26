'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Utensils } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';

export function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Menu Items',
      href: '/admin/menu',
      icon: Utensils,
    },
    {
      title: 'Orders',
      href: '/admin/orders',
      icon: Package,
    },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Admin Panel</span>
            <span className="text-xs text-muted-foreground">Chouieur Express</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2">
          <div className="text-xs text-muted-foreground">
            Admin access enabled
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}