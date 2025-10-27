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
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api-config';
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
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
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
      // Prepare order data
      const newOrder = {
        customerName: data.name,
        customerPhone: data.phone,
        customerAddress: data.address,
        items: cartItems,
        total: cartTotal,
        status: 'pending',
        email: '',
        orderType: 'delivery',
        paymentMethod: 'cash'
      };

      // Log order data for debugging
      console.log('📦 Sending order:', JSON.stringify(newOrder, null, 2));
      
      // Send order to API
      const response = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(newOrder)
      });

      console.log('📥 API Response:', response);

      if (response && response.success) {
        // Trigger the automation flow
        await automateDeliveryNotifications({
          orderId: response.orderId,
          customerName: newOrder.customerName,
          customerPhoneNumber: newOrder.customerPhone,
          deliveryAddress: newOrder.customerAddress,
          orderItems: newOrder.items.map(item => `${item.quantity}x ${item.menuItem?.name || 'Item'}`),
          totalAmount: newOrder.total,
        });

        toast({
          title: 'Order Placed!',
          description: 'Your order has been successfully placed.',
        });
        clearCart();
        router.push(`/order/confirmation/${response.orderId}`);
      } else {
        const errorMessage = response?.error || response?.message || 'Failed to create order';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Error placing order:', error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      const errorMessage = error?.message || error?.error || 'Failed to place order. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <span>{item.quantity} x {item.menuItem?.name || 'Unknown'} ({item.size || 'Normal'})</span>
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