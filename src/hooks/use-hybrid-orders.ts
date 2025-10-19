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
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  createdAt: any;
  updatedAt: any;
  email?: string;
  notes?: string;
  deliveryTime?: string;
  paymentMethod?: string;
  orderType?: string;
}

export function useHybridOrders() {
  const [orders, setOrders] = useState<HybridOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFirebase, setUseFirebase] = useState(true);

  // Create a memoized query for real-time updates
  const ordersQuery = useMemoFirebase(() => {
    if (!db || !useFirebase) return null;
    
    const ordersRef = collection(db, 'orders');
    return query(ordersRef, orderBy('createdAt', 'desc'));
  }, [useFirebase]);

  const { data: firebaseOrders, isLoading: firebaseLoading, error: firebaseError } = useCollection<HybridOrder>(ordersQuery);

  // Fallback to API if Firebase fails
  const fetchOrdersFromAPI = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest<HybridOrder[]>('/api/orders');
      setOrders(response);
      setUseFirebase(false); // Switch to API mode
    } catch (err) {
      console.error('Error fetching orders from API:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Update orders based on source
  useEffect(() => {
    if (useFirebase && firebaseOrders) {
      setOrders(firebaseOrders);
      setIsLoading(firebaseLoading);
      setError(firebaseError ? firebaseError.message : null);
    } else if (!useFirebase) {
      // Use API orders
      setIsLoading(false);
    }
  }, [firebaseOrders, firebaseLoading, firebaseError, useFirebase]);

  // Handle Firebase errors by falling back to API
  useEffect(() => {
    if (firebaseError && useFirebase) {
      console.warn('Firebase error, falling back to API:', firebaseError);
      fetchOrdersFromAPI();
    }
  }, [firebaseError, useFirebase]);

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      if (!db) throw new Error('Firebase not initialized');
      
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        notes: notes || '',
        updatedAt: serverTimestamp()
      });
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
      // Refetch from API
      fetchOrdersFromAPI();
    }
  };

  return {
    orders: orders || [],
    isLoading,
    error,
    refetch,
    updateOrderStatus,
    source: useFirebase ? 'firebase' : 'api'
  };
}
