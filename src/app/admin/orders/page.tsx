'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRealtimeOrders } from "@/hooks/use-realtime-orders";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { Loader2, RefreshCw, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminOrdersPage() {
  const { role } = useStaffAuth();
  const { orders, isLoading, error, refetch, updateOrderStatus } = useRealtimeOrders();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'ready': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    
    // Handle Firestore timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Handle string dates
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return 'Unknown';
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Orders will be automatically refreshed by the hook
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Order Management</h1>
          <p className="text-muted-foreground">Complete history of all orders placed through the website.</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {role?.toUpperCase()} ACCESS
        </Badge>
      </div>

      {/* Pending Orders Alert */}
      {orders.filter(order => order.status?.toLowerCase() === 'pending').length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Orders Require Confirmation
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              {orders.filter(order => order.status?.toLowerCase() === 'pending').length} orders are waiting for your confirmation
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>
                {isLoading ? 'Loading orders...' : `${orders.length} total orders`}
                {orders.filter(order => order.status?.toLowerCase() === 'pending').length > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-400 ml-2">
                    • {orders.filter(order => order.status?.toLowerCase() === 'pending').length} pending
                  </span>
                )}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Error loading orders: {error}</p>
              <Button onClick={refetch} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p>Loading orders...</p>
                    </TableCell>
                  </TableRow>
                ) : orders.length > 0 ? (
                  orders.map((order) => {
                    const items = order.items || [];
                    
                    return (
                      <TableRow key={order.orderid || order.id}>
                        <TableCell className="font-medium">
                          {order.orderid || order.id}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customerName || 'Anonymous'}</div>
                            <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {items.slice(0, 2).map((item: any, index: number) => (
                              <div key={index} className="text-sm">
                                {item.quantity}x {item.name || item.menuItem?.name}
                              </div>
                            ))}
                            {items.length > 2 && (
                              <div className="text-sm text-muted-foreground">
                                +{items.length - 2} more items
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {parseFloat(order.total || '0').toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            
                            {/* Order Status Actions */}
                            {order.status?.toLowerCase() === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleStatusUpdate(order.orderid || order.id, 'confirmed')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleStatusUpdate(order.orderid || order.id, 'cancelled')}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}
                            
                            {order.status?.toLowerCase() === 'confirmed' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(order.orderid || order.id, 'preparing')}
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Start Prep
                              </Button>
                            )}
                            
                            {order.status?.toLowerCase() === 'preparing' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(order.orderid || order.id, 'ready')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Ready
                              </Button>
                            )}
                            
                            {order.status?.toLowerCase() === 'ready' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(order.orderid || order.id, 'delivered')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Delivered
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No orders found. Orders will appear here once customers start placing orders.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
