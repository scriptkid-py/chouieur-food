/**
 * DELIVERY DRIVER DASHBOARD
 * ==========================
 * This page is exclusively for delivery drivers to manage deliveries.
 * It is NOT accessible from the main navigation menu.
 * 
 * Access URL: /delivery
 * 
 * Features:
 * - View all delivery orders (REAL-TIME via Socket.IO)
 * - Update order status (Ready → Out for Delivery → Delivered)
 * - Search orders by ID, customer name, phone, or address
 * - Live updates with WebSocket connection
 * - Push notifications for new orders
 */

'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Disable SSR for this page to prevent hydration errors
const DeliveryDashboard = dynamic(
  () => import('./DeliveryDashboard').then(mod => ({ default: mod.DeliveryDashboard })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading delivery dashboard...</p>
        </div>
      </div>
    ),
  }
);

export default function DeliveryPage() {
  return <DeliveryDashboard />;
}
