'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Package } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/lib/api-config';

type OrderConfirmationClientProps = {
  orderId: string;
};

export default function OrderConfirmationClient({ orderId }: OrderConfirmationClientProps) {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [urlOrderType, setUrlOrderType] = useState<string | null>(null);

  // Get orderType from URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      if (type) {
        setUrlOrderType(type);
      }
    }
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setOrder(data.data);
          }
        } else {
          console.error('Failed to fetch order:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Check order type - use URL param as fallback, then check order data
  const orderTypeFromData = order?.orderType;
  const finalOrderType = orderTypeFromData || urlOrderType;
  const isPickup = finalOrderType === 'pickup' || 
                   finalOrderType === 'local' || 
                   order?.customerAddress === 'Pickup at restaurant' ||
                   (order?.customerAddress && order.customerAddress.toLowerCase().includes('pickup'));
  const isDelivered = order?.status === 'delivered';
  const displayOrderId = order?.orderId || order?.orderid || orderId;

  return (
    <div className="container mx-auto flex items-center justify-center px-4 py-12 md:px-6">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader className="items-center">
          {isDelivered ? (
            <CheckCircle2 className="h-20 w-20 text-green-500" />
          ) : (
            <Package className="h-20 w-20 text-blue-500" />
          )}
          <CardTitle className="font-semibold tracking-tight mt-4 font-headline text-3xl">
            {isPickup ? 'Go confirm your code' : 'Your order confirmed'}
          </CardTitle>
          <CardDescription className="text-base">
            {isDelivered
              ? 'Thank you! Your order has been delivered successfully.'
              : isPickup
              ? 'Please bring this order ID when you come to pick up your order.'
              : 'Thank you for your order. We are preparing it now.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-secondary p-4">
            <p className="text-sm text-muted-foreground">Your Order ID</p>
            <p className="break-all text-lg font-mono font-semibold">{displayOrderId}</p>
          </div>
          {isPickup && !isDelivered && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                📍 Pickup Order
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Please bring this order ID when you come to pick up your order.
              </p>
            </div>
          )}
          <Button asChild size="lg" className="w-full">
            <Link href="/menu">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

