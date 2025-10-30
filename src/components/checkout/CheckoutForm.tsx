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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, Truck, Store } from 'lucide-react';
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
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
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
      // Transform cart items to match Order schema
      const orderItems = cartItems.map(item => ({
        menuItemId: item.menuItem.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.size === 'Mega' && item.menuItem.megaPrice 
          ? item.menuItem.megaPrice 
          : item.menuItem.price,
        totalPrice: item.totalPrice,
        size: item.size === 'Mega' ? 'mega' : 'regular',
        specialInstructions: item.supplements?.length > 0 
          ? `Supplements: ${item.supplements.map(s => s.name).join(', ')}` 
          : ''
      }));

      // Prepare order data
      const newOrder = {
        customerName: data.name,
        customerPhone: data.phone,
        customerAddress: orderType === 'delivery' ? data.address : 'Pickup at restaurant',
        items: orderItems,
        total: cartTotal,
        status: 'pending',
        email: '',
        orderType: orderType,
        paymentMethod: 'cash'
      };

      // Log order data for debugging (development only, with PII redacted)
      if (process.env.NODE_ENV === 'development') {
        const redactedOrder = {
          ...newOrder,
          customerName: '[REDACTED]',
          customerPhone: '[REDACTED]',
          customerAddress: '[REDACTED]',
        };
        console.log('📦 Sending order:', JSON.stringify(redactedOrder, null, 2));
      }
      
      // Send order to API
      const response = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(newOrder)
      });

      // Log API response (development only, with sensitive data redacted)
      if (process.env.NODE_ENV === 'development' && response) {
        const redactedResponse = {
          ...response,
          // Redact any potential customer data in response
          orderId: response.orderId || '[HIDDEN]',
          success: response.success
        };
        console.log('📥 API Response:', JSON.stringify(redactedResponse, null, 2));
      }

      if (response && response.success) {
        // Trigger the automation flow
        const orderItemsString = orderItems.map(item => `${item.quantity}x ${item.name}`).join(', ');
        await automateDeliveryNotifications({
          customerName: newOrder.customerName,
          customerPhone: newOrder.customerPhone,
          deliveryAddress: newOrder.customerAddress,
          orderItems: orderItemsString,
          totalAmount: newOrder.total,
          estimatedDeliveryTime: '30-45 minutes'
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
    } catch (error: unknown) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error placing order:', error);
        console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }
      
      // Narrow the error type and derive error message
      let errorMessage = 'Failed to place order. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        if ('error' in error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      
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
        {/* Order Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={orderType} onValueChange={(value) => setOrderType(value as 'delivery' | 'pickup')}>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">Delivery</div>
                    <div className="text-sm text-muted-foreground">Get it delivered to your address</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Store className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">Pickup (Local)</div>
                    <div className="text-sm text-muted-foreground">Pick up from our restaurant</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

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
        
        {/* Only show address field for delivery orders */}
        {orderType === 'delivery' && (
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address</Label>
            <Input id="address" {...register('address', { required: orderType === 'delivery' ? 'Address is required for delivery' : false })} />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>
        )}
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