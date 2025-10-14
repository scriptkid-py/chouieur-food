'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '../Logo';
import { Button } from '../ui/button';
import { useStaffAuth } from '@/context/StaffAuthContext';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { href: '/admin/orders', label: 'Orders', icon: Package, roles: ['admin'] },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { role, logout } = useStaffAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/staff/login');
  };

  const filteredNavItems = navItems.filter(item => item.roles.includes(role || ''));

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between">
           <Link href={'/admin/dashboard'}>
             <Logo className="text-foreground" />
           </Link>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  icon={<item.icon />}
                >
                  {item.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
       <SidebarFooter>
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
