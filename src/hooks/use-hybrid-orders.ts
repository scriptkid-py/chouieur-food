import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/firebase/provider';
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
  const [useFirebase, setUseFirebase] = useState(true);
  const [apiOrders, setApiOrders] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Create a memoized query for real-time updates
  const ordersQuery = useMemoFirebase(() => {
    if (!db || !useFirebase) return null;
    
    const ordersRef = collection(db, 'orders');
    return query(ordersRef, orderBy('createdAt', 'desc'));
  }, [useFirebase]);

  const { data: firebaseOrders, isLoading: firebaseLoading, error: firebaseError } = useCollection<HybridOrder>(ordersQuery);

  // Fetch orders from API as fallback
  const fetchOrdersFromAPI = async (forceRefresh = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    
    // Cache for 30 seconds to prevent excessive API calls
    if (!forceRefresh && timeSinceLastFetch < 30000 && apiOrders.length > 0) {
      console.log('Using cached orders, skipping API call');
      return;
    }
    
    try {
      setApiLoading(true);
      setApiError(null);
      
      console.log('Fetching orders from API...');
      const response = await apiRequest<any[]>('/api/orders');
      console.log('API orders response:', response);
      setApiOrders(response);
      setLastFetchTime(now);
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

  // Auto-refresh API orders every 60 seconds when using API mode (reduced frequency)
  useEffect(() => {
    if (!useFirebase && !apiLoading) {
      const interval = setInterval(() => {
        fetchOrdersFromAPI();
      }, 60000); // Refresh every 60 seconds (reduced from 30s)

      return () => clearInterval(interval);
    }
  }, [useFirebase, apiLoading]);

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      if (useFirebase && db) {
        // Update via Firebase
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          status,
          notes: notes || '',
          updatedAt: serverTimestamp()
        });
      } else {
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
        
        // Refresh API orders after successful update
        await fetchOrdersFromAPI();
      }
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  };

  const refetch = () => {
    if (useFirebase) {
      // Real-time updates don't need manual refetch
      return;
    } else {
      // Force refresh from API
      fetchOrdersFromAPI(true);
    }
  };

  const currentLoading = useFirebase ? firebaseLoading : apiLoading;
  const currentError = useFirebase ? firebaseError : apiError;

  return {
    orders: orders || [],
    isLoading: currentLoading,
    error: currentError,
    refetch,
    updateOrderStatus,
    source: useFirebase ? 'firebase' : 'api'
  };
}