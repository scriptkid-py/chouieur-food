import { useState, useEffect, useMemo } from 'react';
// Removed Firebase realtime orders - using API-only backend
import { apiRequest } from '@/lib/api-config';
import { useHybridOrders } from './use-hybrid-orders';

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
  const { orders: hybridOrders, isLoading: hybridLoading, error: hybridError } = useHybridOrders();
  const [apiOrders, setApiOrders] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [useHybrid, setUseHybrid] = useState(true);

  // Fetch orders from API as fallback
  const fetchOrdersFromAPI = async () => {
    try {
      setApiLoading(true);
      setApiError(null);
      
      const response = await apiRequest<any[]>('/api/orders');
      setApiOrders(response);
      setUseHybrid(false); // Switch to API mode
    } catch (err) {
      console.error('Error fetching orders from API:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setApiLoading(false);
    }
  };

  // Use hybrid orders if available, otherwise fall back to API
  const orders = useMemo(() => {
    if (useHybrid && hybridOrders && hybridOrders.length > 0) {
      return hybridOrders;
    }
    if (!useHybrid && apiOrders.length > 0) {
      return apiOrders;
    }
    return [];
  }, [hybridOrders, apiOrders, useHybrid]);

  // Client-only: if hybrid has no orders, trigger API fetch after mount
  useEffect(() => {
    if (typeof window === 'undefined') return; // avoid build-time fetch
    if (useHybrid && (hybridOrders?.length || 0) === 0 && !apiLoading && apiOrders.length === 0) {
      fetchOrdersFromAPI();
    }
  }, [useHybrid, hybridOrders, apiLoading, apiOrders.length]);

  // Auto-refresh API orders every 30 seconds when using API mode
  useEffect(() => {
    if (!useHybrid && !apiLoading) {
      const interval = setInterval(() => {
        fetchOrdersFromAPI();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [useHybrid, apiLoading]);

  const isLoading = useHybrid ? hybridLoading : apiLoading;
  const error = useHybrid ? hybridError : apiError;

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
      .map(order => {
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
        
        return {
          id: order.orderid || order.id,
          customer: order.customerName || order.customer_name || 'Anonymous',
          total: parseFloat(order.total) || 0,
          status: order.status,
          time: order.createdAt?.toDate?.()?.toLocaleString() || 
                order.created_at || 
                'Unknown',
          items: items
        };
      });

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
    if (useHybrid) {
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
    source: useHybrid ? 'hybrid' : 'api',
    ordersCount: orders.length
  };
}
