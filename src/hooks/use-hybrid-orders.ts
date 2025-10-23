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
    
    // Cache for 30 seconds to prevent excessive API calls
    if (!forceRefresh && timeSinceLastFetch < 30000 && orders.length > 0) {
      console.log('Using cached orders, skipping API call');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching orders from API...');
      const response = await apiRequest<HybridOrder[]>('/api/orders');
      console.log('API orders response:', response);
      setOrders(response);
      setLastFetchTime(now);
    } catch (err) {
      console.error('Error fetching orders from API:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh orders every 60 seconds
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        fetchOrdersFromAPI();
      }, 60000); // Refresh every 60 seconds

      return () => clearInterval(interval);
    }
  }, [isLoading]);

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
    updateOrderStatus
  };
}