'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
// Removed Firebase import - using API-only backend
import { apiRequest } from '@/lib/api-config';
import Link from 'next/link';
import { automateDeliveryNotifications } from '@/ai/flows/automate-delivery-notifications';

type FormValues = {
  name: string;
  phone: string;
  address: string;
};

export function CheckoutForm() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (user) {
      setValue('name', user.displayName || '');
    }
  }, [user, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to place an order.',
        variant: 'destructive',
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: 'Your cart is empty',
        description: 'Please add items to your cart before placing an order.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data for Google Sheets
      const newOrder = {
        userId: user.uid,
        customerName: data.name,
        customerPhone: data.phone,
        customerAddress: data.address,
        items: cartItems,
        total: cartTotal,
        status: 'pending',
        email: user.email || '',
        orderType: 'delivery',
        paymentMethod: 'cash'
      };

      // Send order to Google Sheets via API
      const response = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(newOrder)
      });

      if (response.success) {
        // Trigger the automation flow
        await automateDeliveryNotifications({
          orderId: response.orderId,
          customerName: newOrder.customerName,
          customerPhoneNumber: newOrder.customerPhone,
          deliveryAddress: newOrder.customerAddress,
          orderItems: newOrder.items.map(item => `${item.quantity}x ${item.menuItem.name}`),
          totalAmount: newOrder.total,
        });

        toast({
          title: 'Order Placed!',
          description: 'Your order has been successfully placed.',
        });
        clearCart();
        router.push(`/order/confirmation/${response.orderId}`);
      } else {
        throw new Error('Failed to create order.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <p className="mb-4">Please log in to proceed with your order.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {cartItems.map(item => (
              <div key={item.cartId} className="flex justify-between text-sm">
                <span>{item.quantity} x {item.menuItem.name} ({item.size})</span>
                <span>{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(cartTotal)}</span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" {...register('phone', { required: 'Phone number is required' })} />
           {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Delivery Address</Label>
          <Input id="address" {...register('address', { required: 'Address is required' })} />
           {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || cartItems.length === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Order...
            </>
          ) : (
            'Confirm Order'
          )}
        </Button>
      </form>
    </div>
  );
}
