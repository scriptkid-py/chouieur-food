'use client';

import { DeliveryOrderForm } from "@/components/admin/DeliveryOrderForm";
import { AdminCredentials } from "@/components/admin/AdminCredentials";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMenuItems } from "@/hooks/use-menu-items";
import { useHybridAdminStats } from "@/hooks/use-hybrid-admin-stats";
import { 
  Package, 
  Users, 
  Utensils, 
  ShoppingCart, 
  Clock, 
  TrendingUp,
  Plus,
  Eye,
  Loader2,
  RefreshCw,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getApiBaseUrl } from "@/lib/api-config";

export default function AdminDashboardPage() {
  const { menuItems, isLoading: menuLoading } = useMenuItems();
  const { stats, isLoading: statsLoading, error: statsError, refetch, source, ordersCount } = useHybridAdminStats();
  const [isMounted, setIsMounted] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const { toast } = useToast();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCleanupOrders = async () => {
    if (!confirm('Are you sure you want to clean up old orders? Orders older than 24 hours will be archived to Google Sheets and removed from the database.')) {
      return;
    }

    setIsCleaning(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/orders/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const archived = data.archivedCount || data.archived || 0;
        const deleted = data.deletedCount || data.deleted || 0;
        toast({
          title: "✅ Cleanup Successful",
          description: `✅ Backed up ${archived} orders to Google Sheets (Historical Orders) and removed ${deleted} old orders from the database.`,
          variant: "default",
        });
        // Refresh stats after cleanup
        refetch();
      } else {
        throw new Error(data.message || 'Cleanup failed');
      }
    } catch (error: any) {
      console.error('Cleanup error:', error);
      toast({
        title: "❌ Cleanup Failed",
        description: error.message || 'Failed to clean up orders. Please try again or check if the backend is deployed.',
        variant: "destructive",
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at your restaurant.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            ADMIN ACCESS
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {source?.toUpperCase()} • {ordersCount} orders
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={statsLoading}
            className="h-8"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.orders.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.orders.growth ? `+${stats.orders.growth}% growth` : 'No data available'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.orders.pending || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${(stats?.revenue.total || 0).toLocaleString()} FCFA`}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.revenue.growth ? `+${stats.revenue.growth}% growth` : 'No data available'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {menuLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.menu.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.menu.withImages || 0} with images
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Automation</TabsTrigger>
          <TabsTrigger value="credentials">Access Info</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Incoming Orders</CardTitle>
                <CardDescription>New orders from the website waiting for confirmation.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!isMounted ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : statsLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
                      stats.recentOrders.map((order, index) => {
                        const orderKey = order.id || `recent-order-${index}`;
                        return (
                          <TableRow key={orderKey}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{order.total.toLocaleString()} FCFA</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No recent orders found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin/orders">
                      <Eye className="mr-2 h-4 w-4" />
                      View All Orders
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common admin tasks and shortcuts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/admin/menu">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Menu Item
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/menu">
                    <Utensils className="mr-2 h-4 w-4" />
                    Manage Menu
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/orders">
                    <Package className="mr-2 h-4 w-4" />
                    View Orders
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/kitchen">
                    <Users className="mr-2 h-4 w-4" />
                    Kitchen View
                  </Link>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={handleCleanupOrders}
                  disabled={isCleaning}
                >
                  {isCleaning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clean Old Orders
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Order Automation</CardTitle>
              <CardDescription>Simulate a delivery app order to test the WhatsApp notification flow.</CardDescription>
            </CardHeader>
            <CardContent>
              <DeliveryOrderForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials">
          <div className="space-y-6">
            <AdminCredentials />
            {/* LiveOrdersTest component removed - using API-only backend */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
