/**
 * DELIVERY DRIVER DASHBOARD
 * ==========================
 * This page is exclusively for delivery drivers to manage deliveries.
 * It is NOT accessible from the main navigation menu.
 * 
 * Access URL: /delivery
 * 
 * Features:
 * - View all delivery orders (REAL-TIME via Socket.IO)
 * - Update order status (Ready → Out for Delivery → Delivered)
 * - Search orders by ID, customer name, phone, or address
 * - Live updates with WebSocket connection
 * - Push notifications for new orders
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
import { useSocketOrders } from '@/hooks/use-socket-orders';
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
  Loader2,
  Wifi,
  WifiOff
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
  id?: string;
  _id?: string;
  orderId?: string;
  orderid?: string;
  userid?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerEmail?: string;
  email?: string;
  items?: OrderItem[];
  subtotal?: number;
  total?: number;
  status?: string;
  orderType?: string;
  paymentMethod?: string;
  notes?: string;
  deliveryTime?: string;
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
  // Use Socket.IO hook for real-time orders (LIVE UPDATES!)
  const { 
    orders: allOrders, 
    isLoading, 
    error: socketError,
    isConnected, 
    updateOrderStatus: socketUpdateStatus,
    refetch 
  } = useSocketOrders({ enableSound: true });

  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginAttempting, setLoginAttempting] = useState(false);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter delivery orders from all orders
  const deliveryOrders = allOrders.filter(order => {
    // Only show delivery orders (not pickup)
    const isDeliveryOrder = order.orderType === 'delivery';
    
    // Only show orders that need delivery (Ready, Out for Delivery, or recently Delivered)
    const needsDelivery = ['ready', 'out-for-delivery', 'delivered'].includes(order.status?.toLowerCase() || '');
    
    if (!isDeliveryOrder || !needsDelivery) return false;
    
    // If driver is authenticated, only show orders assigned to them
    if (isAuthenticated && typeof window !== 'undefined') {
      const driverId = localStorage.getItem('driverId');
      if (driverId) {
        // Show orders assigned to this driver OR unassigned orders
        return !order.assignedDriverId || order.assignedDriverId === driverId;
      }
    }
    
    return true;
  });

  // Filter orders based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(deliveryOrders);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = deliveryOrders.filter(order => 
      order.orderid?.toLowerCase().includes(query) ||
      order.customerName?.toLowerCase().includes(query) ||
      order.customerPhone?.includes(query) ||
      order.customerAddress?.toLowerCase().includes(query)
    );
    
    setFilteredOrders(filtered);
  }, [searchQuery, deliveryOrders]);

  // Detect new orders and trigger notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const currentCount = deliveryOrders.length;
    
    // Check if there are new orders
    if (previousOrderCount > 0 && currentCount > previousOrderCount) {
      const newOrdersCount = currentCount - previousOrderCount;
      setNewOrdersCount(newOrdersCount);
      
      // Play sound notification
      playNotificationSound();
      
      // Vibrate device (mobile)
      vibrateDevice();
      
      // Show browser notification
      const orderText = newOrdersCount === 1 ? 'order' : 'orders';
      showBrowserNotification(
        `🚚 ${newOrdersCount} New Delivery ${orderText.charAt(0).toUpperCase() + orderText.slice(1)}!`,
        `You have ${newOrdersCount} new delivery ${orderText} ready for pickup`
      );
      
      // Show toast notification
      toast({
        title: `🚚 ${newOrdersCount} New Order${newOrdersCount > 1 ? 's' : ''}!`,
        description: `${newOrdersCount} new delivery order${newOrdersCount > 1 ? 's are' : ' is'} ready for pickup`,
        duration: 5000,
      });

      // Reset new orders count after 5 seconds
      setTimeout(() => setNewOrdersCount(0), 5000);
    }
    
    // Update previous count
    setPreviousOrderCount(currentCount);
  }, [deliveryOrders, isAuthenticated, previousOrderCount, toast]);

  // Request notification permission on mount (when authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      requestNotificationPermission();
    }
  }, [isAuthenticated]);

  // Update order status (using Socket.IO for real-time updates)
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    
    try {
      // Find the order
      const order = deliveryOrders.find(o => o.orderid === orderId || o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Use Socket.IO hook to update status (will broadcast to all connected clients)
      await socketUpdateStatus(order.id || order.orderid, newStatus);

      toast({
        title: 'Success',
        description: `Order status updated to ${newStatus.replace('-', ' ')}`,
      });
      
      // No need to refresh - Socket.IO will update automatically!
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

  // Driver accounts with username and password
  const DRIVER_ACCOUNTS = [
    {
      username: 'driver1',
      password: 'driver123',
      id: 'driver1',
      name: 'Driver 1'
    },
    {
      username: 'driver2',
      password: 'driver456',
      id: 'driver2',
      name: 'Driver 2'
    }
  ];

  // Handle driver login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginAttempting(true);
    
    // Find matching driver account
    const driver = DRIVER_ACCOUNTS.find(
      account => account.username.toLowerCase() === username.toLowerCase() && account.password === password
    );
    
    setTimeout(() => {
      if (driver) {
        setIsAuthenticated(true);
        localStorage.setItem('driverAuthenticated', 'true');
        localStorage.setItem('driverId', driver.id);
        localStorage.setItem('driverName', driver.name);
        localStorage.setItem('driverUsername', driver.username);
        setUsername('');
        setPassword('');
        toast({
          title: 'Login Successful',
          description: `Welcome ${driver.name}!`,
        });
      } else {
        toast({
          title: 'Invalid Credentials',
          description: 'Please check your username and password',
          variant: 'destructive',
        });
      }
      setLoginAttempting(false);
    }, 500);
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      setIsAuthenticated(false);
      localStorage.removeItem('driverAuthenticated');
      localStorage.removeItem('driverId');
      localStorage.removeItem('driverName');
      localStorage.removeItem('driverUsername');
      setUsername('');
      setPassword('');
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully',
      });
    }
  };

  // Check authentication on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const isAuth = localStorage.getItem('driverAuthenticated') === 'true';
    setIsAuthenticated(isAuth);
    // Restore driver info if authenticated
    if (isAuth) {
      const driverId = localStorage.getItem('driverId');
      const driverName = localStorage.getItem('driverName');
      if (!driverId || !driverName) {
        // If driver info is missing, logout
        setIsAuthenticated(false);
        localStorage.removeItem('driverAuthenticated');
      }
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
        toast({
          title: 'Notifications Enabled',
          description: 'You will receive alerts for new orders',
        });
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create audio context and oscillator for beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Vibrate device (mobile)
  const vibrateDevice = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]); // Vibrate pattern: 200ms, pause 100ms, 200ms
    }
  };

  // Show browser notification
  const showBrowserNotification = (title: string, body: string) => {
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'new-order',
        requireInteraction: false,
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Click handler to focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
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
  const readyOrdersCount = deliveryOrders.filter(o => {
    const status = (o.status || '').toLowerCase();
    return status === 'ready' || status === 'out-for-delivery';
  }).length;

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 p-4 rounded-full">
                <Truck className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Delivery Driver Login</CardTitle>
            <CardDescription>
              Enter your username and password to access the delivery dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loginAttempting}
                  className="text-center"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginAttempting}
                  className="text-center"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Contact your manager if you don't have credentials
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loginAttempting || !username || !password}
              >
                {loginAttempting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Truck className="mr-2 h-4 w-4" />
                    Access Dashboard
                  </>
                )}
              </Button>
            </form>
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-2">Driver Accounts:</p>
              <div className="space-y-1 text-xs text-blue-600">
                <p><strong>Driver 1:</strong> driver1 / driver123</p>
                <p><strong>Driver 2:</strong> driver2 / driver456</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prevent rendering until mounted to avoid hydration errors
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 border-b shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm relative">
                <Truck className="h-6 w-6 text-white" />
                {newOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {newOrdersCount}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">Delivery Driver Dashboard</h1>
                  {notificationsEnabled && (
                    <Badge className="bg-green-500 text-white text-xs">
                      🔔 Notifications ON
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-white/90 font-medium">
                  🚚 Driver Access Only • Not in Public Menu
                  {isAuthenticated && typeof window !== 'undefined' && localStorage.getItem('driverName') && (
                    <span className="ml-2">• {localStorage.getItem('driverName')}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Real-time Connection Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-white font-medium">LIVE</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-400" />
                    <span className="text-xs text-white font-medium">OFFLINE</span>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
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
                {deliveryOrders.filter(o => (o.status || '').toLowerCase() === 'out-for-delivery').length}
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
              View and manage delivery orders. Update status when you pick up or deliver an order. Real-time updates via Socket.IO ⚡
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
                    {filteredOrders.map((order, index) => {
                      const orderKey = order.orderid || order.id || `order-${index}`;
                      return (
                      <TableRow key={orderKey}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            {order.orderid}
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
                            {(order.items || []).slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-sm">
                                {item.quantity}x {item.name}
                                {item.size && ` (${item.size})`}
                              </div>
                            ))}
                            {(order.items || []).length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{(order.items || []).length - 2} more items
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${(order.total || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status || 'pending')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {formatDate(order.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={order.status || 'pending'}
                            onValueChange={(value) => handleStatusUpdate(order.orderid || order.id || '', value)}
                            disabled={updatingStatus === order.orderid}
                          >
                            <SelectTrigger className="w-[160px]">
                              {updatingStatus === order.orderid ? (
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
                      );
                    })}
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

