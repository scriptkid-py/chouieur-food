import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/firebase/provider';

export interface RealtimeOrder {
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

export function useRealtimeOrders() {
  // Create a memoized query for real-time updates
  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    
    const ordersRef = collection(db, 'orders');
    return query(ordersRef, orderBy('createdAt', 'desc'));
  }, []);

  const { data: orders, isLoading, error } = useCollection<RealtimeOrder>(ordersQuery);

  // Handle Firestore permission errors gracefully
  useEffect(() => {
    if (error) {
      console.warn('Firestore permission error - please update Firestore security rules:', error);
      console.log('Go to Firebase Console > Firestore Database > Rules and update the rules');
    }
  }, [error]);

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
    // Real-time updates don't need manual refetch
    // The data will update automatically via Firestore listeners
  };

  return {
    orders: orders || [],
    isLoading,
    error,
    refetch,
    updateOrderStatus
  };
}

export function useRealtimeAdminStats() {
  const { orders, isLoading } = useRealtimeOrders();
  
  const stats = useMemo(() => {
    if (!orders) return null;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const confirmedOrders = orders.filter(order => order.status === 'confirmed').length;
    const readyOrders = orders.filter(order => order.status === 'ready').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (order.total || 0), 0);

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
          customer: order.customerName,
          total: order.total,
          status: order.status,
          time: order.createdAt?.toDate?.()?.toLocaleString() || 'Unknown',
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

  return {
    stats,
    isLoading,
    error: null,
    refetch: () => {} // Real-time updates don't need manual refetch
  };
}
