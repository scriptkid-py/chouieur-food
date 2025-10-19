'use client';

import { DeliveryOrderForm } from "@/components/admin/DeliveryOrderForm";
import { AdminCredentials } from "@/components/admin/AdminCredentials";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMenuItems } from "@/hooks/use-menu-items";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { 
  Package, 
  Users, 
  Utensils, 
  ShoppingCart, 
  Clock, 
  TrendingUp,
  Plus,
  Eye,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { role } = useStaffAuth();
  const { menuItems, isLoading } = useMenuItems();

  // Mock data for demonstration
  const stats = {
    totalOrders: 156,
    pendingOrders: 12,
    totalRevenue: 2450000, // FCFA
    menuItems: menuItems.length
  };

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      total: 3500,
      status: "pending",
      time: "2 min ago"
    },
    {
      id: "ORD-002", 
      customer: "Jane Smith",
      total: 2800,
      status: "confirmed",
      time: "5 min ago"
    },
    {
      id: "ORD-003",
      customer: "Mike Johnson", 
      total: 4200,
      status: "ready",
      time: "8 min ago"
    }
  ];

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at your restaurant.</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {role?.toUpperCase()} ACCESS
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
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
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
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
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.menuItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Active menu items
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
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{order.total.toLocaleString()} FCFA</TableCell>
                      </TableRow>
                    ))}
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
          <AdminCredentials />
        </TabsContent>
      </Tabs>
    </div>
  );
}
