'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { automateDeliveryNotifications } from '@/ai/flows/automate-delivery-notifications';
import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import type { AutomateDeliveryNotificationsInput } from '@/ai/flows/automate-delivery-notifications';

type FormValues = Omit<AutomateDeliveryNotificationsInput, 'orderId' | 'totalAmount' | 'orderItems'> & {
    orderItems: string;
    totalAmount: string;
};


export function DeliveryOrderForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
        customerName: 'John Doe',
        customerPhoneNumber: '+15551234567',
        deliveryAddress: '123 Main St, Anytown, USA',
        orderItems: '1x Pizza, 2x Burger',
        totalAmount: '2500'
    }
  });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    try {
        const payload: AutomateDeliveryNotificationsInput = {
            orderId: `del_${Date.now()}`,
            customerName: data.customerName,
            customerPhoneNumber: data.customerPhoneNumber,
            deliveryAddress: data.deliveryAddress,
            orderItems: data.orderItems.split(',').map(item => item.trim()),
            totalAmount: parseFloat(data.totalAmount),
        };

      const result = await automateDeliveryNotifications(payload);

      if (result.messageSent) {
        toast({
          title: 'Notification Sent',
          description: 'The delivery notification was sent successfully.',
        });
        reset();
      } else {
        throw new Error('An unknown error occurred while sending the notification.');
      }
    } catch (error: any) {
      toast({
        title: 'Action Failed',
        description: error.message || 'There was a problem triggering the notification.',
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input id="customerName" {...register('customerName', { required: 'Name is required' })} />
        {errors.customerName && <p className="text-sm text-destructive">{errors.customerName.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerPhoneNumber">Customer Phone</Label>
        <Input id="customerPhoneNumber" type="tel" {...register('customerPhoneNumber', { required: 'Phone is required' })} />
        {errors.customerPhoneNumber && <p className="text-sm text-destructive">{errors.customerPhoneNumber.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="deliveryAddress">Delivery Address</Label>
        <Input id="deliveryAddress" {...register('deliveryAddress', { required: 'Address is required' })} />
        {errors.deliveryAddress && <p className="text-sm text-destructive">{errors.deliveryAddress.message}</p>}
      </div>
       <div className="space-y-2">
        <Label htmlFor="orderItems">Order Items (comma-separated)</Label>
        <Input id="orderItems" {...register('orderItems', { required: 'Items are required' })} />
        {errors.orderItems && <p className="text-sm text-destructive">{errors.orderItems.message}</p>}
      </div>
       <div className="space-y-2">
        <Label htmlFor="totalAmount">Total Amount (DA)</Label>
        <Input id="totalAmount" type="number" {...register('totalAmount', { required: 'Total is required', valueAsNumber: true })} />
        {errors.totalAmount && <p className="text-sm text-destructive">{errors.totalAmount.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
        ) : (
          <><Send className="mr-2 h-4 w-4" /> Send Notification</>
        )}
      </Button>
    </form>
  );
}
