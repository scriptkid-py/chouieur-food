'use client';

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSocketOrders } from "@/hooks/use-socket-orders";
import { Loader2, RefreshCw, Eye, CheckCircle, XCircle, Clock, Wifi, WifiOff, Truck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiBaseUrl } from "@/lib/api-config";
import { useToast } from "@/hooks/use-toast";

// Available delivery drivers
const DRIVERS = [
  { id: 'driver1', name: 'Driver 1' },
  { id: 'driver2', name: 'Driver 2' },
  { id: 'driver3', name: 'Driver 3' },
  { id: 'driver4', name: 'Driver 4' },
  { id: 'driver5', name: 'Driver 5' },
];

export default function AdminOrdersPage() {
  const { orders, isLoading, error, refetch, updateOrderStatus, isConnected } = useSocketOrders({ enableSound: true });
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const [assigningDriver, setAssigningDriver] = useState<Set<string>>(new Set());
  const { toast } = useToast();

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
      console.log('Attempting to update order:', orderId, 'to status:', newStatus);
      setUpdatingOrders(prev => new Set(prev).add(orderId));
      await updateOrderStatus(orderId, newStatus);
      console.log('Order updated successfully');
      // Orders will be automatically refreshed by the hook
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert(`Failed to update order: ${(error as any)?.message || error}`);
      // You could add a toast notification here for better UX
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleAssignDriver = async (orderId: string, driverName: string, driverId: string) => {
    try {
      setAssigningDriver(prev => new Set(prev).add(orderId));
      
      const apiUrl = getApiBaseUrl();
      const order = orders.find(o => (o.orderid || o.id) === orderId);
      const idToUse = order?.id || orderId;
      
      const response = await fetch(`${apiUrl}/api/orders/${idToUse}/assign-driver`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          driverName,
          driverId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to assign driver: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Driver Assigned',
          description: `${driverName} has been assigned to this order`,
        });
        // Orders will be automatically refreshed by Socket.IO
      } else {
        throw new Error(data.message || 'Failed to assign driver');
      }
    } catch (error) {
      console.error('Failed to assign driver:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign driver',
        variant: 'destructive',
      });
    } finally {
      setAssigningDriver(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleUnassignDriver = async (orderId: string) => {
    try {
      setAssigningDriver(prev => new Set(prev).add(orderId));
      
      const apiUrl = getApiBaseUrl();
      const order = orders.find(o => (o.orderid || o.id) === orderId);
      const idToUse = order?.id || orderId;
      
      const response = await fetch(`${apiUrl}/api/orders/${idToUse}/unassign-driver`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to unassign driver: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Driver Unassigned',
          description: 'Driver has been removed from this order',
        });
        // Orders will be automatically refreshed by Socket.IO
      } else {
        throw new Error(data.message || 'Failed to unassign driver');
      }
    } catch (error) {
      console.error('Failed to unassign driver:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to unassign driver',
        variant: 'destructive',
      });
    } finally {
      setAssigningDriver(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Order Management</h1>
          <p className="text-muted-foreground">Complete history of all orders placed through the website.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            ADMIN ACCESS
          </Badge>
          <Badge variant="secondary" className="text-xs">
            SOCKET.IO • {orders.length} orders
          </Badge>
          <Badge 
            variant="default" 
            className={cn(
              "text-xs",
              isConnected ? "bg-green-600 animate-pulse" : "bg-red-600"
            )}
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" /> LIVE
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" /> DISCONNECTED
              </>
            )}
          </Badge>
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
        </div>
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
              <p className="text-red-500 mb-4">Error loading orders: {typeof error === 'string' ? error : (error as any)?.message || 'Unknown error'}</p>
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
                  <TableHead>Driver</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p>Loading orders...</p>
                    </TableCell>
                  </TableRow>
                ) : orders.length > 0 ? (
                  orders.map((order) => {
                    // Handle items field - it might be a JSON string or array
                    let items = [];
                    if (order.items) {
                      if (typeof order.items === 'string') {
                        try {
                          items = JSON.parse(order.items);
                        } catch (e) {
                          console.warn('Failed to parse items JSON:', order.items);
                          items = [];
                        }
                      } else if (Array.isArray(order.items)) {
                        items = order.items;
                      }
                    }
                    
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
                        <TableCell>
                          {order.orderType === 'delivery' ? (
                            <div className="space-y-2">
                              {order.assignedDriver ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Truck className="h-3 w-3 mr-1" />
                                    {order.assignedDriver}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUnassignDriver(order.orderid || order.id)}
                                    disabled={assigningDriver.has(order.orderid || order.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {assigningDriver.has(order.orderid || order.id) ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <UserX className="h-3 w-3 text-red-500" />
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                <Select
                                  onValueChange={(value) => {
                                    const driver = DRIVERS.find(d => d.id === value);
                                    if (driver) {
                                      handleAssignDriver(order.orderid || order.id, driver.name, driver.id);
                                    }
                                  }}
                                  disabled={assigningDriver.has(order.orderid || order.id)}
                                >
                                  <SelectTrigger className="w-[140px] h-8">
                                    {assigningDriver.has(order.orderid || order.id) ? (
                                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                    ) : (
                                      <Truck className="h-3 w-3 mr-2 text-gray-400" />
                                    )}
                                    <SelectValue placeholder="Assign Driver" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DRIVERS.map((driver) => (
                                      <SelectItem key={driver.id} value={driver.id}>
                                        {driver.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Pickup</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {parseFloat(String(order.total || 0)).toLocaleString()} FCFA
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
                                  disabled={updatingOrders.has(order.orderid || order.id)}
                                >
                                  {updatingOrders.has(order.orderid || order.id) ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Confirm
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleStatusUpdate(order.orderid || order.id, 'cancelled')}
                                  disabled={updatingOrders.has(order.orderid || order.id)}
                                >
                                  {updatingOrders.has(order.orderid || order.id) ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Cancel
                                </Button>
                              </>
                            )}
                            
                            {order.status?.toLowerCase() === 'confirmed' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(order.orderid || order.id, 'preparing')}
                                disabled={updatingOrders.has(order.orderid || order.id)}
                              >
                                {updatingOrders.has(order.orderid || order.id) ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Clock className="h-4 w-4 mr-1" />
                                )}
                                Start Prep
                              </Button>
                            )}
                            
                            {order.status?.toLowerCase() === 'preparing' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(order.orderid || order.id, 'ready')}
                                disabled={updatingOrders.has(order.orderid || order.id)}
                              >
                                {updatingOrders.has(order.orderid || order.id) ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Mark Ready
                              </Button>
                            )}
                            
                            {order.status?.toLowerCase() === 'ready' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(order.orderid || order.id, 'delivered')}
                                disabled={updatingOrders.has(order.orderid || order.id)}
                              >
                                {updatingOrders.has(order.orderid || order.id) ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
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
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
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
