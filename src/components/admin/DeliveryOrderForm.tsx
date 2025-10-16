'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { automateDeliveryNotifications } from '@/ai/flows/automate-delivery-notifications';
import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';

interface DeliveryOrderFormData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderItems: string;
  totalAmount: string;
  estimatedDeliveryTime: string;
}

export function DeliveryOrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeliveryOrderFormData>();

  const onSubmit: SubmitHandler<DeliveryOrderFormData> = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Simulate the delivery notification flow
      await automateDeliveryNotifications({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: data.deliveryAddress,
        orderItems: data.orderItems,
        totalAmount: parseFloat(data.totalAmount),
        estimatedDeliveryTime: data.estimatedDeliveryTime,
      });

      toast({
        title: "Delivery Order Created",
        description: "WhatsApp notification sent successfully!",
      });

      reset();
    } catch (error) {
      console.error('Error creating delivery order:', error);
      toast({
        title: "Error",
        description: "Failed to create delivery order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            {...register('customerName', { required: 'Customer name is required' })}
            placeholder="Enter customer name"
          />
          {errors.customerName && (
            <p className="text-sm text-red-500">{errors.customerName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">Phone Number</Label>
          <Input
            id="customerPhone"
            {...register('customerPhone', { required: 'Phone number is required' })}
            placeholder="Enter phone number"
          />
          {errors.customerPhone && (
            <p className="text-sm text-red-500">{errors.customerPhone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deliveryAddress">Delivery Address</Label>
        <Input
          id="deliveryAddress"
          {...register('deliveryAddress', { required: 'Delivery address is required' })}
          placeholder="Enter delivery address"
        />
        {errors.deliveryAddress && (
          <p className="text-sm text-red-500">{errors.deliveryAddress.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="orderItems">Order Items</Label>
        <Input
          id="orderItems"
          {...register('orderItems', { required: 'Order items are required' })}
          placeholder="e.g., 2x Pizza Margherita, 1x Caesar Salad"
        />
        {errors.orderItems && (
          <p className="text-sm text-red-500">{errors.orderItems.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total Amount ($)</Label>
          <Input
            id="totalAmount"
            type="number"
            step="0.01"
            {...register('totalAmount', { required: 'Total amount is required' })}
            placeholder="0.00"
          />
          {errors.totalAmount && (
            <p className="text-sm text-red-500">{errors.totalAmount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedDeliveryTime">Estimated Delivery Time</Label>
          <Input
            id="estimatedDeliveryTime"
            {...register('estimatedDeliveryTime', { required: 'Delivery time is required' })}
            placeholder="e.g., 30-45 minutes"
          />
          {errors.estimatedDeliveryTime && (
            <p className="text-sm text-red-500">{errors.estimatedDeliveryTime.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Order...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Create Delivery Order
          </>
        )}
      </Button>
    </form>
  );
}