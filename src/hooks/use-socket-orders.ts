import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { HybridOrder } from './use-hybrid-orders';
import { getApiBaseUrl } from '@/lib/api-config';

// Get API base URL for Socket.io connection
const getSocketUrl = () => {
  if (typeof window !== 'undefined') {
    const apiUrl = getApiBaseUrl();
    // Return the full URL, Socket.io client will handle the protocol
    return apiUrl;
  }
  // Server-side fallback
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  // Default fallback
  return process.env.NODE_ENV === 'production' 
    ? 'https://chouieur-express-backend-h74v.onrender.com'
    : 'http://localhost:3001';
};

// Helper to play notification sound
const playNotificationSound = () => {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Higher pitch for notification
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
};

// Transform MongoDB order to HybridOrder format
const transformOrder = (mongoOrder: any): HybridOrder => {
  return {
    id: mongoOrder._id || mongoOrder.id,
    orderid: mongoOrder.orderId || mongoOrder.orderid,
    userid: mongoOrder.userId || mongoOrder.userid || 'guest',
    customerName: mongoOrder.customerName,
    customerPhone: mongoOrder.customerPhone,
    customerAddress: mongoOrder.customerAddress,
    items: mongoOrder.items || [],
    total: mongoOrder.total || 0,
    status: mongoOrder.status,
    createdAt: mongoOrder.createdAt,
    updatedAt: mongoOrder.updatedAt,
    email: mongoOrder.customerEmail || mongoOrder.email || '',
    notes: mongoOrder.notes || '',
    deliveryTime: mongoOrder.estimatedDeliveryTime || mongoOrder.deliveryTime || '',
    paymentMethod: mongoOrder.paymentMethod || 'cash',
    orderType: mongoOrder.orderType || 'delivery',
    assignedDriver: mongoOrder.assignedDriver,
    assignedDriverId: mongoOrder.assignedDriverId,
    assignedAt: mongoOrder.assignedAt,
  };
};

// Transform array of orders
const transformOrders = (mongoOrders: any[]): HybridOrder[] => {
  return mongoOrders.map(transformOrder);
};

export interface UseSocketOrdersOptions {
  enableSound?: boolean; // Enable notification sound for new orders
}

export function useSocketOrders(options: UseSocketOrdersOptions = {}) {
  const { enableSound = true } = options;
  
  const [orders, setOrders] = useState<HybridOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Get API base URL for order updates
  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      return getApiBaseUrl();
    }
    return process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://chouieur-express-backend-h74v.onrender.com'
        : 'http://localhost:3001');
  };

  // Connect to Socket.io server
  const connectSocket = useCallback(() => {
    try {
      console.log('🔌 Connecting to Socket.io server...');
      
      const socketUrl = getSocketUrl();
      console.log('🌐 Connecting to:', socketUrl);
      
      const socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
        timeout: 20000,
      });

      socketRef.current = socket;

      // Connection successful
      socket.on('connect', () => {
        console.log('✅ Connected to Socket.io server. Socket ID:', socket.id);
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      });

      // Receive connection confirmation
      socket.on('connected', (data: any) => {
        console.log('✅ Server confirmed connection:', data.message);
      });

      // Receive initial orders
      socket.on('initialOrders', (data: { orders: any[]; count: number }) => {
        console.log(`📋 Received ${data.count} initial orders from Socket.io`);
        setOrders(transformOrders(data.orders));
        setIsLoading(false);
      });

      // Receive new order event
      socket.on('newOrder', (data: { order: any; type: string; timestamp: string }) => {
        console.log('🆕 New order received via Socket.io:', data.order?.orderId || data.order?.orderid);
        
        if (data.order) {
          const transformedOrder = transformOrder(data.order);
          
          // Play notification sound if enabled
          if (enableSound) {
            playNotificationSound();
          }
          
          setOrders(prev => {
            // Prevent duplicates
            const exists = prev.some(o => {
              const newOrderId = transformedOrder.orderid || transformedOrder.id;
              const currentOrderId = o.orderid || o.id;
              return newOrderId === currentOrderId;
            });
            
            if (exists) {
              console.log('⚠️ Order already exists, updating instead');
              return prev.map(order => {
                const newOrderId = transformedOrder.orderid || transformedOrder.id;
                const currentOrderId = order.orderid || order.id;
                return newOrderId === currentOrderId ? transformedOrder : order;
              });
            }
            
            // Add new order to the top of the list with animation
            return [transformedOrder, ...prev];
          });
        }
      });

      // Receive order status update event
      socket.on('updateOrderStatus', (data: { order: any; type: string; timestamp: string }) => {
        console.log('🔄 Order status updated via Socket.io:', data.order?.orderId || data.order?.orderid);
        
        if (data.order) {
          const transformedOrder = transformOrder(data.order);
          
          setOrders(prev => 
            prev.map(order => {
              const updatedOrderId = transformedOrder.orderid || transformedOrder.id;
              const currentOrderId = order.orderid || order.id;
              return updatedOrderId === currentOrderId
                ? transformedOrder 
                : order;
            })
          );
        }
      });

      // Handle disconnection
      socket.on('disconnect', (reason: string) => {
        console.log('🔌 Disconnected from Socket.io server. Reason:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected the client, reconnect manually
          reconnectAttemptsRef.current++;
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
            reconnectTimeoutRef.current = setTimeout(() => {
              connectSocket();
            }, 2000);
          } else {
            setError('Connection lost. Please refresh the page.');
          }
        }
      });

      // Handle connection errors
      socket.on('connect_error', (error: Error) => {
        console.error('❌ Socket.io connection error:', error);
        setIsConnected(false);
        reconnectAttemptsRef.current++;
        
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          setError(`Connecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSocket();
          }, 3000);
        } else {
          setError('Failed to connect. Please check your connection and refresh the page.');
          setIsLoading(false);
        }
      });

      // Handle errors from server
      socket.on('error', (errorData: { message: string; error?: string }) => {
        console.error('❌ Socket.io server error:', errorData);
        setError(errorData.message || 'Server error');
      });

      // Handle reconnection attempts
      socket.on('reconnect_attempt', (attemptNumber: number) => {
        console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
      });

      socket.on('reconnect', (attemptNumber: number) => {
        console.log(`✅ Reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      });

      socket.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed after all attempts');
        setError('Connection lost. Please refresh the page.');
        setIsLoading(false);
      });

    } catch (err) {
      console.error('❌ Error setting up Socket.io connection:', err);
      setError('Failed to initialize real-time connection');
      setIsLoading(false);
    }
  }, [enableSound]);

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
      // Order will be automatically updated via Socket.io broadcast
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  };

  // Manual refetch function (falls back to API)
  const refetch = useCallback(async () => {
    try {
      console.log('🔄 Manual refetch requested...');
      setIsLoading(true);
      
      // Reconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      connectSocket();
      
      // Also fetch from API as backup
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/orders`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        let ordersData: any[] = [];
        if (Array.isArray(data)) {
          ordersData = data;
        } else if (data?.data && Array.isArray(data.data)) {
          ordersData = data.data;
        }
        
        if (ordersData.length > 0) {
          console.log(`✅ Loaded ${ordersData.length} orders from API fallback`);
          setOrders(transformOrders(ordersData));
        }
      }
    } catch (err) {
      console.error('❌ Refetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [connectSocket]);

  // Connect on mount and cleanup on unmount
  useEffect(() => {
    connectSocket();

    return () => {
      console.log('🔌 Cleaning up Socket.io connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  return {
    orders: orders || [],
    isLoading,
    error,
    isConnected,
    refetch,
    updateOrderStatus,
    source: 'socket.io' // Indicate data source
  };
}

