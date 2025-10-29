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
      ? 'https://chouieur-express-backend-h74v.onrender.com'
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
              console.log('🆕 New order created:', data.order.orderId);
              setOrders(prev => [transformOrder(data.order), ...prev]);
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

  // Manual refetch function (though not needed with SSE)
  const refetch = () => {
    // With SSE, we don't need manual refetch
    // But we can reconnect if needed
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsLoading(true);
    connectToStream();
  };

  // Connect on mount and cleanup on unmount
  useEffect(() => {
    connectToStream();

    return () => {
      console.log('🔌 Disconnecting from real-time stream');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
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

