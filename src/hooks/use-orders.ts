import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api-config';

export interface Order {
  id: string;
  orderid: string;
  userid: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: string; // JSON string
  total: string;
  status: string;
  created_at: string;
  updated_at: string;
  email: string;
  notes: string;
  delivery_time: string;
  payment_method: string;
  order_type: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest<Order[]>('/api/orders');
      setOrders(response);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      await apiRequest(`/api/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes })
      });
      
      // Refresh orders after update
      await fetchOrders();
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const refetch = () => {
    fetchOrders();
  };

  return {
    orders,
    isLoading,
    error,
    refetch,
    updateOrderStatus
  };
}
