/**
 * DELIVERY DRIVER DASHBOARD
 * ==========================
 * This page is exclusively for delivery drivers to manage deliveries.
 * It is NOT accessible from the main navigation menu.
 * 
 * Access URL: /delivery
 * 
 * Features:
 * - View all delivery orders
 * - Update order status (Ready → Out for Delivery → Delivered)
 * - Search orders by ID, customer name, phone, or address
 * - Auto-refresh every 10 seconds
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, getApiBaseUrl } from '@/lib/api-config';
import { 
  Search, 
  LogOut, 
  Package, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2,
  XCircle,
  RefreshCw,
  Truck,
  Loader2
} from 'lucide-react';

interface OrderItem {
  menuItemId?: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  size?: string;
  specialInstructions?: string;
}

interface Order {
  _id?: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
  orderType: 'delivery' | 'pickup';
  paymentMethod: string;
  notes?: string;
  deliveryInstructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
  { value: 'preparing', label: 'Preparing', color: 'bg-orange-500' },
  { value: 'ready', label: 'Ready', color: 'bg-green-500' },
  { value: 'out-for-delivery', label: 'Out for Delivery', color: 'bg-purple-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

export default function DeliveryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Use a try-catch around the API call to handle any errors
      let response;
      try {
        response = await apiRequest<{ success: boolean; data: Order[]; orders?: Order[] }>('/api/orders');
      } catch (apiError) {
        console.error('❌ API request failed:', apiError);
        // Set empty orders instead of crashing
        setOrders([]);
        setFilteredOrders([]);
        if (toast) {
          toast({
            title: 'Connection Error',
            description: 'Could not connect to backend. Please check if the server is running.',
            variant: 'destructive',
          });
        }
        return;
      }
      
      console.log('📦 Raw API Response:', response);
      
      // Safely extract orders data
      const ordersData = (response && (response.data || response.orders)) || [];
      console.log(`📋 Total orders from API: ${ordersData.length}`);
      
      // Filter out cancelled orders by default, show only delivery-relevant statuses
      // Also handle cases where orderType might be missing (show all non-cancelled orders if no orderType filter)
      const activeOrders = Array.isArray(ordersData) ? ordersData.filter(order => {
        if (!order || typeof order !== 'object') return false;
        const notCancelled = order.status !== 'cancelled';
        const isDelivery = order.orderType === 'delivery' || !order.orderType; // Show orders without orderType too
        return notCancelled && isDelivery;
      }) : [];
      
      console.log(`🚚 Delivery orders after filter: ${activeOrders.length}`);
      
      setOrders(activeOrders);
      setFilteredOrders(activeOrders);
      
      if (activeOrders.length === 0 && ordersData.length > 0 && toast) {
        toast({
          title: 'No Delivery Orders',
          description: `Found ${ordersData.length} total orders, but none are delivery orders. Check orderType field.`,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      // Set empty arrays on error to prevent crash
      setOrders([]);
      setFilteredOrders([]);
      if (toast) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch orders. Please check your connection and try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch orders on mount and set up auto-refresh
  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Filter orders based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = orders.filter(order => 
      order.orderId.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.customerPhone.includes(query) ||
      order.customerAddress.toLowerCase().includes(query)
    );
    
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    
    try {
      // Try by orderId first (ORD-xxx format)
      let order = orders.find(o => o.orderId === orderId);
      const idToUse = order?._id || orderId;

      const response = await apiRequest<{ success: boolean; data?: Order; message?: string }>(
        `/api/orders/${idToUse}`,
        {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response && response.success !== false) {
        toast({
          title: 'Success',
          description: `Order status updated to ${newStatus.replace('-', ' ')}`,
        });
        
        // Refresh orders
        await fetchOrders();
      } else {
        throw new Error(response?.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      window.location.href = '/';
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return (
      <Badge className={`${statusOption.color} text-white`}>
        {statusOption.label}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  // Calculate delivery-ready orders count
  const readyOrdersCount = orders.filter(o => o.status === 'ready' || o.status === 'out-for-delivery').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 border-b shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Delivery Driver Dashboard</h1>
                <p className="text-xs text-white/90 font-medium">🚚 Driver Access Only • Not in Public Menu</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ready for Delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{readyOrdersCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Out for Delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {orders.filter(o => o.status === 'out-for-delivery').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by Order ID, Customer Name, Phone, or Address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Orders</CardTitle>
            <CardDescription>
              View and manage delivery orders. Update status when you pick up or deliver an order. Auto-refreshes every 10 seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">Loading orders...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders found</p>
                {searchQuery && (
                  <p className="text-sm mt-2">Try adjusting your search query</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.orderId || order._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            {order.orderId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone className="h-3 w-3" />
                              {order.customerPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2 max-w-xs">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{order.customerAddress}</span>
                          </div>
                          {order.deliveryInstructions && (
                            <div className="text-xs text-gray-500 mt-1 italic">
                              Note: {order.deliveryInstructions}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-sm">
                                {item.quantity}x {item.name}
                                {item.size && ` (${item.size})`}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{order.items.length - 2} more items
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${order.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {formatDate(order.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusUpdate(order.orderId, value)}
                            disabled={updatingStatus === order.orderId}
                          >
                            <SelectTrigger className="w-[160px]">
                              {updatingStatus === order.orderId ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips for Delivery Drivers */}
        {filteredOrders.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>📱 Driver Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>✅ <strong>Update Status:</strong> Use the dropdown to change order status (Ready → Out for Delivery → Delivered)</p>
              <p>✅ <strong>Auto-Refresh:</strong> Orders update every 10 seconds automatically</p>
              <p>✅ <strong>Search:</strong> Find orders by Order ID, customer name, phone number, or address</p>
              <p>✅ <strong>Customer Info:</strong> Click on customer details to see phone number and delivery address</p>
              <p>✅ <strong>Delivery Notes:</strong> Check delivery instructions below the address if provided</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

