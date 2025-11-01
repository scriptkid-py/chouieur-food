'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useNavigation } from '@/hooks/use-navigation';

export function AdminSidebar() {
  const pathname = usePathname();
  
  // Fetch navigation items from API (admin menu)
  const { navigationItems, isLoading: navLoading } = useNavigation({
    menuType: 'admin',
    visible: true,
  });
  
  // Helper to get icon component from string
  const getIcon = (iconName?: string) => {
    if (!iconName) return Icons.LayoutDashboard; // Default icon
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.LayoutDashboard;
  };
  
  // Filter navigation items
  const visibleNavItems = navigationItems.filter(item => item.visible && item.isActive !== false);
  
  // Fallback menu items if API fails
  const fallbackMenuItems = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: Icons.LayoutDashboard,
    },
    {
      title: 'Menu Items',
      href: '/admin/menu',
      icon: Icons.Utensils,
    },
    {
      title: 'Orders',
      href: '/admin/orders',
      icon: Icons.Package,
    },
    {
      title: 'Navigation',
      href: '/admin/navigation',
      icon: Icons.Navigation,
    },
  ];
  
  const menuItems = navLoading || visibleNavItems.length === 0 
    ? fallbackMenuItems 
    : visibleNavItems.map(item => ({
        title: item.label,
        href: item.path,
        icon: getIcon(item.icon),
        id: item.id,
      }));

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
          {navLoading ? (
            <SidebarMenuItem>
              <div className="px-2 py-2 text-sm text-muted-foreground">Loading...</div>
            </SidebarMenuItem>
          ) : (
            menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.href || item.id}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link 
                      href={item.href}
                      onClick={(e) => {
                        // Handle onClick handlers if needed
                        if (typeof window !== 'undefined') {
                          const navItem = visibleNavItems.find(ni => ni.id === item.id);
                          if (navItem?.onClick) {
                            const handler = (window as any)[navItem.onClick];
                            if (typeof handler === 'function') {
                              e.preventDefault();
                              handler();
                            }
                          }
                        }
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })
          )}
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