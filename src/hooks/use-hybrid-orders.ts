import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '@/lib/api-config';

export interface HybridOrder {
  id: string;
  orderid: string;
  userid: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: any[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: any;
  updatedAt: any;
  email?: string;
  notes?: string;
  deliveryTime?: string;
  paymentMethod?: string;
  orderType?: string;
}

export function useHybridOrders() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<HybridOrder[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Fetch orders from API
  const fetchOrdersFromAPI = async (forceRefresh = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    
    // Cache for 3 seconds to prevent excessive API calls while allowing live updates
    if (!forceRefresh && timeSinceLastFetch < 3000 && orders.length > 0) {
      console.log('Using cached orders, skipping API call');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching orders from API...');
      const response = await apiRequest<any>('/api/orders');
      console.log('API orders response:', response);
      
      // Extract orders array from response - handle multiple formats
      // Render backend returns: { success: true, data: [...] }
      // Other backends might return: { success: true, orders: [...] }
      let ordersData: HybridOrder[] = [];
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response?.orders && Array.isArray(response.orders)) {
        ordersData = response.orders;
      } else {
        console.error('❌ Invalid orders response format:', response);
        ordersData = [];
      }
      
      console.log(`✅ Extracted ${ordersData.length} orders from response`);
      setOrders(ordersData);
      setLastFetchTime(now);
    } catch (err) {
      console.error('Error fetching orders from API:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      setOrders([]); // Set empty array on error to prevent filter issues
    } finally {
      setIsLoading(false);
    }
  };

  // NO AUTO-REFRESH - Use useRealtimeOrders hook for real-time updates instead
  // This hook is kept only for backward compatibility but should not be used
  // for new implementations. useRealtimeOrders provides true SSE-based updates.

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      // Update via API
      console.log('Updating order via API:', orderId, 'to status:', status);
      const response = await apiRequest(`/api/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          notes: notes || ''
        })
      });
      
      console.log('API response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update order');
      }
      
      // Refresh orders after successful update
      await fetchOrdersFromAPI(true);
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  };

  const refetch = () => {
    // Force refresh from API
    fetchOrdersFromAPI(true);
  };

  // Initial load
  useEffect(() => {
    fetchOrdersFromAPI();
  }, []);

  return {
    orders: orders || [],
    isLoading,
    error,
    refetch,
    updateOrderStatus,
    source: 'api' // Indicate data source
  };
}