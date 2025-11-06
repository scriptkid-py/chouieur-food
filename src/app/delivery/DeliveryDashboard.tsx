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
  User, 
  Phone, 
  MapPin, 
  Truck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Bell,
  BellOff
} from 'lucide-react';

interface Order {
  orderid: string;
  id?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryInstructions?: string;
  items: any;
  total: number;
  status: string;
  orderType: string;
  createdAt?: string;
  assignedDriverId?: string;
  assignedDriver?: string;
}

export function DeliveryDashboard() {
  const { 
    orders: allOrders, 
    isLoading, 
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
  const { toast } = useToast();

  // Check authentication on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('driverAuthenticated');
      const driverName = localStorage.getItem('driverName');
      const driverId = localStorage.getItem('driverId');
      
      if (authStatus === 'true' && driverName && driverId) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Driver authentication
  const DRIVERS = [
    { id: 'driver1', username: 'driver1', password: 'driver123', name: 'Driver 1' },
    { id: 'driver2', username: 'driver2', password: 'driver456', name: 'Driver 2' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginAttempting(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const driver = DRIVERS.find(d => d.username === username && d.password === password);
    
    if (driver) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('driverAuthenticated', 'true');
        localStorage.setItem('driverId', driver.id);
        localStorage.setItem('driverName', driver.name);
        localStorage.setItem('driverUsername', driver.username);
      }
      toast({
        title: 'Login Successful',
        description: `Welcome, ${driver.name}!`,
      });
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid username or password',
        variant: 'destructive',
      });
    }
    
    setLoginAttempting(false);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
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

  // Filter delivery orders from all orders
  const deliveryOrders = allOrders.filter(order => {
    // Only show delivery orders (not pickup)
    const isDeliveryOrder = order.orderType === 'delivery';
    
    // Only show orders that need delivery (Ready, Out for Delivery, or recently Delivered)
    const needsDelivery = ['ready', 'out-for-delivery', 'delivered'].includes(order.status?.toLowerCase() || '');
    
    if (!isDeliveryOrder || !needsDelivery) return false;
    
    // Driver filtering logic:
    // - Show unassigned orders to ALL drivers (until admin assigns)
    // - Show assigned orders ONLY to the assigned driver
    if (isAuthenticated && typeof window !== 'undefined') {
      const driverId = localStorage.getItem('driverId');
      if (driverId) {
        // If order has no assigned driver, show it to all drivers
        if (!order.assignedDriverId) {
          return true; // Unassigned - visible to all drivers
        }
        // If order is assigned, only show to the assigned driver
        return order.assignedDriverId === driverId;
      }
    }
    
    // If not authenticated, show nothing
    return false;
  });

  // Filter orders based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(deliveryOrders as Order[]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = deliveryOrders.filter(order => 
      order.orderid?.toLowerCase().includes(query) ||
      order.customerName?.toLowerCase().includes(query) ||
      order.customerPhone?.includes(query) ||
      order.customerAddress?.toLowerCase().includes(query)
    );
    
    setFilteredOrders(filtered as Order[]);
  }, [searchQuery, deliveryOrders]);

  // Detect new orders and trigger notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const currentCount = deliveryOrders.length;
    
    // Check if there are new orders
    if (currentCount > previousOrderCount && previousOrderCount > 0) {
      const newCount = currentCount - previousOrderCount;
      setNewOrdersCount(newCount);
      
      if (notificationsEnabled) {
        // Play sound
        playNotificationSound();
        
        // Vibrate device (if supported)
        vibrateDevice();
        
        // Show browser notification
        showBrowserNotification(newCount);
      }
    }
    
    setPreviousOrderCount(currentCount);
  }, [deliveryOrders.length, previousOrderCount, notificationsEnabled, isAuthenticated]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast({
        title: 'Notifications Not Supported',
        description: 'Your browser does not support notifications',
        variant: 'destructive',
      });
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      toast({
        title: 'Notifications Enabled',
        description: 'You will receive alerts for new orders',
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast({
          title: 'Notifications Enabled',
          description: 'You will receive alerts for new orders',
        });
      } else {
        toast({
          title: 'Notifications Blocked',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Notifications Blocked',
        description: 'Please enable notifications in your browser settings',
        variant: 'destructive',
      });
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  // Vibrate device
  const vibrateDevice = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  // Show browser notification
  const showBrowserNotification = (count: number) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification('New Delivery Order!', {
        body: `You have ${count} new order${count > 1 ? 's' : ''} to deliver`,
        icon: '/favicon.ico',
        tag: 'delivery-order',
      });
    }
  };

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      await socketUpdateStatus(orderId, newStatus);
      toast({
        title: 'Status Updated',
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Format date/time
  const formatDateTime = (dateString?: string) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 border-b shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm relative flex-shrink-0">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                {newOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {newOrdersCount}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">Delivery Driver Dashboard</h1>
                  {notificationsEnabled && (
                    <Badge className="bg-green-500 text-white text-xs flex-shrink-0">
                      🔔 ON
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-white/90 font-medium hidden sm:block">
                  🚚 Driver Access Only • Not in Public Menu
                  {typeof window !== 'undefined' && localStorage.getItem('driverName') && (
                    <span className="ml-2">• {localStorage.getItem('driverName')}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Badge className="bg-green-500 text-white text-xs sm:text-sm">
                    <div className="w-2 h-2 bg-white rounded-full mr-1.5 sm:mr-2 animate-pulse" />
                    LIVE
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs sm:text-sm">
                    <div className="w-2 h-2 bg-white rounded-full mr-1.5 sm:mr-2" />
                    OFFLINE
                  </Badge>
                )}
              </div>
              {!notificationsEnabled ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestNotificationPermission}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation"
                >
                  <BellOff className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Enable Notifications</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNotificationsEnabled(false)}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation"
                >
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Disable Notifications</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{deliveryOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ready for Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{readyOrdersCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-sm font-medium text-red-600">Disconnected</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl">Delivery Orders</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  View and manage delivery orders. Update status when you pick up or deliver an order. Real-time updates via Socket.IO ⚡
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-48 md:w-64 h-9 sm:h-10 text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="h-9 sm:h-10 px-3 sm:px-4 touch-manipulation"
                >
                  <Loader2 className={`h-4 w-4 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-600 text-sm sm:text-base">Loading orders...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">No orders found</p>
                {searchQuery && (
                  <p className="text-xs sm:text-sm mt-2">Try adjusting your search query</p>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
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
                            <div className="max-w-xs">
                              {(() => {
                                let items = [];
                                if (order.items) {
                                  if (typeof order.items === 'string') {
                                    try {
                                      items = JSON.parse(order.items);
                                    } catch {
                                      items = [];
                                    }
                                  } else if (Array.isArray(order.items)) {
                                    items = order.items;
                                  }
                                }
                                return (
                                  <div className="space-y-1">
                                    {items.slice(0, 2).map((item: any, idx: number) => (
                                      <div key={idx} className="text-sm">
                                        {item.quantity}x {item.name}
                                      </div>
                                    ))}
                                    {items.length > 2 && (
                                      <div className="text-xs text-gray-500">
                                        +{items.length - 2} more
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {order.total?.toLocaleString()} FCFA
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                order.status === 'ready' ? 'bg-green-500' :
                                order.status === 'out-for-delivery' ? 'bg-blue-500' :
                                order.status === 'delivered' ? 'bg-gray-500' :
                                'bg-yellow-500'
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.assignedDriverId ? (
                              <Badge className="bg-purple-500 text-white">
                                {typeof window !== 'undefined' && localStorage.getItem('driverId') === order.assignedDriverId
                                  ? 'You'
                                  : order.assignedDriver || `Driver ${order.assignedDriverId}`}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                Unassigned
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(order.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {order.status === 'ready' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(order.orderid, 'out-for-delivery')}
                                  disabled={updatingStatus === order.orderid}
                                  className="bg-blue-500 hover:bg-blue-600"
                                >
                                  {updatingStatus === order.orderid ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Truck className="h-4 w-4 mr-1" />
                                      Pick Up
                                    </>
                                  )}
                                </Button>
                              )}
                              {order.status === 'out-for-delivery' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(order.orderid, 'delivered')}
                                  disabled={updatingStatus === order.orderid}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  {updatingStatus === order.orderid ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                      Mark Delivered
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-4">
                  {filteredOrders.map((order, index) => {
                    const orderKey = order.orderid || order.id || `order-${index}`;
                    let items = [];
                    if (order.items) {
                      if (typeof order.items === 'string') {
                        try {
                          items = JSON.parse(order.items);
                        } catch {
                          items = [];
                        }
                      } else if (Array.isArray(order.items)) {
                        items = order.items;
                      }
                    }
                    return (
                      <Card key={orderKey} className="border-2">
                        <CardHeader className="p-4 pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div className="min-w-0">
                                <CardTitle className="text-base font-bold truncate">Order #{order.orderid}</CardTitle>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Badge 
                                    className={
                                      order.status === 'ready' ? 'bg-green-500 text-xs' :
                                      order.status === 'out-for-delivery' ? 'bg-blue-500 text-xs' :
                                      order.status === 'delivered' ? 'bg-gray-500 text-xs' :
                                      'bg-yellow-500 text-xs'
                                    }
                                  >
                                    {order.status}
                                  </Badge>
                                  {order.assignedDriverId && (
                                    <Badge className="bg-purple-500 text-white text-xs">
                                      {typeof window !== 'undefined' && localStorage.getItem('driverId') === order.assignedDriverId
                                        ? 'You'
                                        : order.assignedDriver || `Driver ${order.assignedDriverId}`}
                                    </Badge>
                                  )}
                                  {!order.assignedDriverId && (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                                      Unassigned
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-lg font-bold text-primary">{order.total?.toLocaleString()} FCFA</div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3" />
                                {formatDateTime(order.createdAt)}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="font-medium text-sm">{order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                              <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline">{order.customerPhone}</a>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-sm break-words">{order.customerAddress}</span>
                              {order.deliveryInstructions && (
                                <div className="text-xs text-gray-500 mt-1 italic">
                                  Note: {order.deliveryInstructions}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-500">Items:</div>
                            <div className="space-y-1">
                              {items.slice(0, 3).map((item: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  {item.quantity}x {item.name}
                                </div>
                              ))}
                              {items.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{items.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="pt-2 border-t">
                            {order.status === 'ready' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(order.orderid, 'out-for-delivery')}
                                disabled={updatingStatus === order.orderid}
                                className="w-full bg-blue-500 hover:bg-blue-600 h-10 touch-manipulation"
                              >
                                {updatingStatus === order.orderid ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Truck className="h-4 w-4 mr-2" />
                                    Pick Up Order
                                  </>
                                )}
                              </Button>
                            )}
                            {order.status === 'out-for-delivery' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(order.orderid, 'delivered')}
                                disabled={updatingStatus === order.orderid}
                                className="w-full bg-green-500 hover:bg-green-600 h-10 touch-manipulation"
                              >
                                {updatingStatus === order.orderid ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark as Delivered
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

