import { useState, useEffect, useRef } from 'react';
import { HybridOrder } from './use-hybrid-orders';
import { getApiBaseUrl } from '@/lib/api-config';

// Get API base URL dynamically
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use dynamic function
    return getApiBaseUrl();
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://chouieur-express-backend.onrender.com'
      : 'http://localhost:3001');
};

export function useRealtimeOrders() {
  const [orders, setOrders] = useState<HybridOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to connect to SSE stream
  const connectToStream = () => {
    try {
      console.log('🔌 Connecting to real-time orders stream...');
      
      const apiUrl = getApiUrl();
      console.log('🌐 Using API URL:', apiUrl);
      const eventSource = new EventSource(`${apiUrl}/api/orders/stream`, {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        console.log('✅ Connected to real-time orders stream');
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📦 Received real-time update:', data.type);

          switch (data.type) {
            case 'connected':
              console.log('✅', data.message);
              break;

            case 'initial':
              // Received initial orders data
              console.log(`📋 Received ${data.orders.length} initial orders`);
              setOrders(transformOrders(data.orders));
              setIsLoading(false);
              break;

            case 'orderCreated':
              // New order created - add to top of list
              const newOrderId = data.order?.orderId || data.order?.orderid;
              console.log('🆕 New order created:', newOrderId, data.order);
              if (data.order) {
                const transformedOrder = transformOrder(data.order);
                setOrders(prev => {
                  // Prevent duplicates
                  const exists = prev.some(o => (o.orderid || o.id) === (transformedOrder.orderid || transformedOrder.id));
                  if (exists) {
                    console.log('⚠️ Order already exists, updating instead');
                    return prev.map(order => {
                      const orderId = transformedOrder.orderid || transformedOrder.id;
                      const currentOrderId = order.orderid || order.id;
                      return orderId === currentOrderId ? transformedOrder : order;
                    });
                  }
                  return [transformedOrder, ...prev];
                });
              }
              break;

            case 'orderUpdated':
              // Order status updated - update in list
              console.log('🔄 Order updated:', data.order?.orderId || data.order?.orderid);
              setOrders(prev => 
                prev.map(order => {
                  const orderId = data.order?.orderId || data.order?.orderid;
                  const currentOrderId = order.orderid || order.id;
                  return orderId === currentOrderId
                    ? transformOrder(data.order) 
                    : order;
                })
              );
              break;

            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('❌ SSE connection error:', err);
        setError('Connection lost. Reconnecting...');
        eventSource.close();
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connectToStream();
        }, 3000);
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error('Error connecting to stream:', err);
      setError('Failed to connect to real-time updates');
      setIsLoading(false);
    }
  };

  // Transform MongoDB order to HybridOrder format
  const transformOrder = (mongoOrder: any): HybridOrder => {
    return {
      id: mongoOrder._id,
      orderid: mongoOrder.orderId,
      userid: mongoOrder.userId || 'guest',
      customerName: mongoOrder.customerName,
      customerPhone: mongoOrder.customerPhone,
      customerAddress: mongoOrder.customerAddress,
      items: mongoOrder.items || [],
      total: mongoOrder.total || 0,
      status: mongoOrder.status,
      createdAt: mongoOrder.createdAt,
      updatedAt: mongoOrder.updatedAt,
      email: mongoOrder.customerEmail || '',
      notes: mongoOrder.notes || '',
      deliveryTime: mongoOrder.estimatedDeliveryTime || '',
      paymentMethod: mongoOrder.paymentMethod || 'cash',
      orderType: mongoOrder.orderType || 'delivery',
    };
  };

  // Transform array of orders
  const transformOrders = (mongoOrders: any[]): HybridOrder[] => {
    return mongoOrders.map(transformOrder);
  };

  // Update order status function
  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      console.log('Updating order via API:', orderId, 'to status:', status);
      
      const response = await fetch(`${getApiUrl()}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status,
          reason: notes || ''
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update order: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update order');
      }

      console.log('✅ Order updated successfully');
      // Order will be automatically updated via SSE broadcast
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  };

  // Manual refetch function
  const refetch = () => {
    // Try both SSE reconnect and API fallback
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsLoading(true);
    connectToStream();
    // Also fetch from API as backup
    fetchOrdersFromAPI();
  };

  // Fallback: Fetch orders from regular API if SSE fails
  const fetchOrdersFromAPI = async () => {
    try {
      console.log('🔄 Fallback: Fetching orders from API...');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/orders`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📋 API fallback response:', data);
      
      // Extract orders from response - handle multiple formats
      let ordersData: any[] = [];
      if (Array.isArray(data)) {
        ordersData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        ordersData = data.data;
      } else if (data?.orders && Array.isArray(data.orders)) {
        ordersData = data.orders;
      }
      
      if (ordersData.length > 0) {
        console.log(`✅ Fallback: Loaded ${ordersData.length} orders from API`);
        setOrders(transformOrders(ordersData));
        setIsLoading(false);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Fallback API fetch failed:', err);
      // Only set error if we don't have any orders from SSE
      if (orders.length === 0) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        setIsLoading(false);
      }
    }
  };

  // Connect on mount and cleanup on unmount
  useEffect(() => {
    // Connect to SSE stream for real-time updates
    connectToStream();
    
    // Also fetch from API immediately as fallback/backup
    // This ensures orders appear even if SSE is slow or fails
    fetchOrdersFromAPI();

    return () => {
      console.log('🔌 Disconnecting from real-time stream');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    orders: orders || [],
    isLoading,
    error,
    refetch,
    updateOrderStatus,
    source: 'realtime-sse' // Indicate data source
  };
}

