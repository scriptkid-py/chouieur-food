import { useState, useEffect, useMemo } from 'react';
import { useRealtimeOrders } from './use-realtime-orders';
import { apiRequest } from '@/lib/api-config';

export interface AdminStats {
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    ready: number;
    delivered: number;
    growth: number;
  };
  revenue: {
    total: number;
    growth: number;
  };
  menu: {
    total: number;
    active: number;
    withImages: number;
    categories: number;
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    total: number;
    status: string;
    time: string;
    items: any[];
  }>;
}

export function useHybridAdminStats() {
  const { orders: firebaseOrders, isLoading: firebaseLoading, error: firebaseError } = useRealtimeOrders();
  const [apiOrders, setApiOrders] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [useFirebase, setUseFirebase] = useState(true);

  // Fetch orders from API as fallback
  const fetchOrdersFromAPI = async () => {
    try {
      setApiLoading(true);
      setApiError(null);
      
      const response = await apiRequest<any[]>('/api/orders');
      setApiOrders(response);
      setUseFirebase(false); // Switch to API mode
    } catch (err) {
      console.error('Error fetching orders from API:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setApiLoading(false);
    }
  };

  // Use Firebase orders if available, otherwise fall back to API
  const orders = useMemo(() => {
    if (useFirebase && firebaseOrders && firebaseOrders.length > 0) {
      return firebaseOrders;
    } else if (!useFirebase && apiOrders.length > 0) {
      return apiOrders;
    } else if (useFirebase && firebaseOrders && firebaseOrders.length === 0) {
      // Firebase is connected but has no orders, try API
      if (!apiLoading && apiOrders.length === 0) {
        fetchOrdersFromAPI();
      }
      return [];
    }
    return [];
  }, [firebaseOrders, apiOrders, useFirebase, apiLoading]);

  const isLoading = useFirebase ? firebaseLoading : apiLoading;
  const error = useFirebase ? firebaseError : apiError;

  const stats = useMemo(() => {
    if (!orders || orders.length === 0) return null;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const confirmedOrders = orders.filter(order => order.status === 'confirmed').length;
    const readyOrders = orders.filter(order => order.status === 'ready').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

    const recentOrders = orders
      .slice(0, 5)
      .map(order => ({
        id: order.orderid || order.id,
        customer: order.customerName || order.customer_name || 'Anonymous',
        total: parseFloat(order.total) || 0,
        status: order.status,
        time: order.createdAt?.toDate?.()?.toLocaleString() || 
              order.created_at || 
              'Unknown',
        items: order.items || []
      }));

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        ready: readyOrders,
        delivered: deliveredOrders,
        growth: 0 // You can implement growth calculation if needed
      },
      revenue: {
        total: totalRevenue,
        growth: 0 // You can implement growth calculation if needed
      },
      menu: {
        total: 0, // You can implement menu stats if needed
        active: 0,
        withImages: 0,
        categories: 0
      },
      recentOrders
    };
  }, [orders]);

  const refetch = () => {
    if (useFirebase) {
      // Real-time updates don't need manual refetch
      return;
    } else {
      // Refetch from API
      fetchOrdersFromAPI();
    }
  };

  return {
    stats,
    isLoading,
    error,
    refetch,
    source: useFirebase ? 'firebase' : 'api',
    ordersCount: orders.length
  };
}
