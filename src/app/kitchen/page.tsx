'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { useHybridOrders } from "@/hooks/use-hybrid-orders";
import { 
  UtensilsCrossed, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Timer,
  ChefHat,
  RefreshCw
} from "lucide-react";
import { useState } from "react";

export default function KitchenViewPage() {
  const { role } = useStaffAuth();
  const { orders: allOrders, isLoading, updateOrderStatus, refetch, error } = useHybridOrders();

  // Filter orders for kitchen (confirmed, preparing, ready)
  const kitchenOrders = allOrders.filter(order => 
    ['confirmed', 'preparing', 'ready'].includes(order.status?.toLowerCase())
  );

  // Debug logging
  console.log('Kitchen Dashboard - All orders:', allOrders.length);
  console.log('Kitchen Dashboard - Kitchen orders:', kitchenOrders.length);
  console.log('Kitchen Dashboard - Orders:', allOrders.map(o => ({ id: o.orderid || o.id, status: o.status })));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-yellow-500';
      case 'ready': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <AlertCircle className="h-4 w-4" />;
      case 'preparing': return <Timer className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Orders will be automatically refreshed by the hook
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
            <ChefHat className="h-8 w-8" />
            Kitchen Dashboard
          </h1>
          <p className="text-muted-foreground">Live list of confirmed orders to be prepared.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="outline" className="text-sm">
            {role?.toUpperCase()} ACCESS
          </Badge>
        </div>
      </header>

      {/* Kitchen Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : kitchenOrders.filter(o => o.status?.toLowerCase() === 'confirmed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Waiting to start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Timer className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : kitchenOrders.filter(o => o.status?.toLowerCase() === 'preparing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently preparing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : kitchenOrders.filter(o => o.status?.toLowerCase() === 'ready').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting pickup
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backend Connection Status */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Backend Connection Issue
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              Unable to connect to the backend server. Please ensure the backend service is running.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refetch} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Orders</CardTitle>
          <CardDescription>Manage order preparation status</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Error loading orders: {typeof error === 'string' ? error : error.message || 'Unknown error'}</p>
              <Button onClick={refetch} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Loading orders...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : kitchenOrders.length > 0 ? (
                kitchenOrders.map((order) => {
                  const items = order.items || [];
                  const timeAgo = order.createdAt ? 
                    (order.createdAt.toDate ? order.createdAt.toDate().toLocaleString() : new Date(order.createdAt).toLocaleString()) 
                    : 'Unknown';
                  
                  return (
                    <TableRow key={order.orderid || order.id}>
                      <TableCell className="font-medium">{order.orderid || order.id}</TableCell>
                      <TableCell>{order.customerName || 'Anonymous'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {items.map((item: any, index: number) => (
                            <div key={index} className="text-sm">
                              {item.quantity}x {item.name || item.menuItem?.name}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{timeAgo}</div>
                          <div className="text-muted-foreground">{order.total} FCFA</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status?.toLowerCase() === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.orderid || order.id, 'preparing')}
                            >
                              Start Preparing
                            </Button>
                          )}
                          {order.status?.toLowerCase() === 'preparing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateOrderStatus(order.orderid || order.id, 'ready')}
                            >
                              Mark Ready
                            </Button>
                          )}
                          {order.status?.toLowerCase() === 'ready' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled
                            >
                              Ready
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Kitchen Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Kitchen Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📋 Order Workflow
              </h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li><strong>Confirmed:</strong> Order received and confirmed - click "Start Preparing"</li>
                <li><strong>Preparing:</strong> Order is being prepared - click "Mark Ready" when done</li>
                <li><strong>Ready:</strong> Order is ready for pickup/delivery</li>
              </ol>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                ⚠️ Important Notes
              </h4>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                <li>Always check order details before starting preparation</li>
                <li>Update status promptly to keep customers informed</li>
                <li>Contact admin if there are any issues with orders</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
