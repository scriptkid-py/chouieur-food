import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface OrderData {
  orderid: string;
  userid: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: any[];
  total: number;
  status: string;
  createdAt: any;
  updatedAt: any;
  email?: string;
  notes?: string;
  deliveryTime?: string;
  paymentMethod?: string;
  orderType?: string;
}

export async function migrateOrdersToFirestore(orders: any[]) {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  const ordersRef = collection(db, 'orders');
  const migratedOrders = [];

  for (const order of orders) {
    try {
      // Parse items if they're stored as JSON string
      let items = [];
      if (order.items) {
        try {
          items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (e) {
          console.warn('Failed to parse items for order:', order.orderid, e);
          items = [];
        }
      }

      // Convert string dates to proper format
      let createdAt = serverTimestamp();
      let updatedAt = serverTimestamp();
      
      if (order.created_at) {
        try {
          createdAt = new Date(order.created_at);
        } catch (e) {
          console.warn('Failed to parse created_at for order:', order.orderid);
        }
      }
      
      if (order.updated_at) {
        try {
          updatedAt = new Date(order.updated_at);
        } catch (e) {
          console.warn('Failed to parse updated_at for order:', order.orderid);
        }
      }

      const orderData: OrderData = {
        orderid: order.orderid || order.id || '',
        userid: order.userid || order.user_id || '',
        customerName: order.customer_name || order.customerName || 'Anonymous',
        customerPhone: order.customer_phone || order.customerPhone || '',
        customerAddress: order.customer_address || order.customerAddress || '',
        items: items,
        total: parseFloat(order.total) || 0,
        status: order.status || 'pending',
        createdAt: createdAt,
        updatedAt: updatedAt,
        email: order.email || '',
        notes: order.notes || '',
        deliveryTime: order.delivery_time || order.deliveryTime || '',
        paymentMethod: order.payment_method || order.paymentMethod || 'cash',
        orderType: order.order_type || order.orderType || 'delivery'
      };

      const docRef = await addDoc(ordersRef, orderData);
      migratedOrders.push({ id: docRef.id, ...orderData });
      
      console.log('Migrated order:', order.orderid, 'to Firestore with ID:', docRef.id);
    } catch (error) {
      console.error('Failed to migrate order:', order.orderid, error);
    }
  }

  return migratedOrders;
}

export async function syncNewOrderToFirestore(orderData: any) {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  const ordersRef = collection(db, 'orders');
  
  const firestoreOrder = {
    orderid: orderData.orderId || orderData.id || `ORD-${Date.now()}`,
    userid: orderData.userId || orderData.userid || '',
    customerName: orderData.customerName || orderData.customer_name || 'Anonymous',
    customerPhone: orderData.customerPhone || orderData.customer_phone || '',
    customerAddress: orderData.customerAddress || orderData.customer_address || '',
    items: orderData.items || [],
    total: orderData.total || 0,
    status: orderData.status || 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    email: orderData.email || '',
    notes: orderData.notes || '',
    deliveryTime: orderData.deliveryTime || orderData.delivery_time || '',
    paymentMethod: orderData.paymentMethod || orderData.payment_method || 'cash',
    orderType: orderData.orderType || orderData.order_type || 'delivery'
  };

  const docRef = await addDoc(ordersRef, firestoreOrder);
  return { id: docRef.id, ...firestoreOrder };
}
