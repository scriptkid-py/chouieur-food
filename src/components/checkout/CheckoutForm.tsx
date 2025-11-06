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
import { useState, useEffect } from 'react';
import { Loader2, Truck, Store, MapPin, Navigation } from 'lucide-react';
import { apiRequest, getApiBaseUrl } from '@/lib/api-config';
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
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [savedAddress, setSavedAddress] = useState<string>('');
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>();
  
  const addressValue = watch('address');

  // Load saved address from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('savedAddress');
      if (saved) {
        setSavedAddress(saved);
        // If address field is empty, pre-fill with saved address
        if (!addressValue) {
          setValue('address', saved);
        }
      }
    }
  }, [setValue, addressValue]);

  // Save address to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && addressValue && orderType === 'delivery') {
      localStorage.setItem('savedAddress', addressValue);
      setSavedAddress(addressValue);
    }
  }, [addressValue, orderType]);

  // Get user's current location using geolocation API
  const handleGetLocation = async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation. Please enter your address manually.',
        variant: 'destructive',
      });
      return;
    }

    setIsGettingLocation(true);

    try {
      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
      {
        enableHighAccuracy: false, // Changed to false for better compatibility
        timeout: 20000, // Increased timeout to 20 seconds
        maximumAge: 60000 // Allow cached location up to 1 minute old
      }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Use our backend API for reverse geocoding (avoids CORS issues)
      const apiUrl = getApiBaseUrl();
      
      const response = await fetch(
        `${apiUrl}/api/geocode/reverse?lat=${latitude}&lon=${longitude}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get address from location');
      }

      const data = await response.json();
      
      if (data.success && data.address) {
        const address = data.address;
        setValue('address', address);
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('savedAddress', address);
          setSavedAddress(address);
        }
        toast({
          title: 'Location Found!',
          description: data.isFallback 
            ? 'Using coordinates. Please refine the address if needed.'
            : 'Your address has been filled in automatically',
        });
      } else {
        throw new Error(data.error || 'Could not determine address from location');
      }
    } catch (error: any) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Geolocation unavailable:', {
          code: error.code,
          message: error.message || 'Position unavailable',
          type: error.code === 1 ? 'PERMISSION_DENIED' : 
                error.code === 2 ? 'POSITION_UNAVAILABLE' : 
                error.code === 3 ? 'TIMEOUT' : 'UNKNOWN'
        });
      }
      
      let errorMessage = 'Failed to get your location.';
      let errorTitle = 'Location Unavailable';
      
      if (error.code === 1) {
        // PERMISSION_DENIED
        errorTitle = 'Location Permission Denied';
        errorMessage = 'Please enable location access in your browser settings. You can also enter your address manually below.';
      } else if (error.code === 2) {
        // POSITION_UNAVAILABLE - GPS/WiFi unavailable or location service disabled
        errorTitle = 'Location Unavailable';
        errorMessage = 'Unable to determine your location. This is normal if GPS is disabled or location services are unavailable. You can enter your address manually - it\'s quick and easy!';
      } else if (error.code === 3) {
        // TIMEOUT
        errorTitle = 'Location Timeout';
        errorMessage = 'Location request took too long. Please try again or enter your address manually below.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show user-friendly error message
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

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
    <div className="space-y-6 sm:space-y-8">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="font-headline text-lg sm:text-xl">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-2">
            {cartItems.map(item => (
              <div key={item.cartId} className="flex justify-between text-xs sm:text-sm">
                <span className="flex-1 pr-2">{item.quantity} x {item.menuItem?.name || 'Unknown'} ({item.size || 'Normal'})</span>
                <span className="font-medium flex-shrink-0">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-base sm:text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(cartTotal)}</span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Order Type Selection */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Order Type</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
            <RadioGroup value={orderType} onValueChange={(value) => setOrderType(value as 'delivery' | 'pickup')}>
              <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-accent cursor-pointer touch-manipulation">
                <RadioGroupItem value="delivery" id="delivery" className="mt-0.5" />
                <Label htmlFor="delivery" className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-1">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm sm:text-base">Delivery</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Get it delivered to your address</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-accent cursor-pointer touch-manipulation">
                <RadioGroupItem value="pickup" id="pickup" className="mt-0.5" />
                <Label htmlFor="pickup" className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-1">
                  <Store className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm sm:text-base">Pickup (Local)</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Pick up from our restaurant</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm sm:text-base">Full Name</Label>
          <Input id="name" className="h-11 sm:h-12 text-base touch-manipulation" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="text-xs sm:text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
          <Input id="phone" type="tel" className="h-11 sm:h-12 text-base touch-manipulation" {...register('phone', { required: 'Phone number is required' })} />
           {errors.phone && <p className="text-xs sm:text-sm text-destructive">{errors.phone.message}</p>}
        </div>
        
        {/* Address field - different behavior for delivery vs pickup */}
        {orderType === 'delivery' ? (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Label htmlFor="address" className="text-sm sm:text-base">Delivery Address *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="text-xs h-9 sm:h-10 touch-manipulation self-start sm:self-auto"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin" />
                    <span className="hidden sm:inline">Getting location...</span>
                    <span className="sm:hidden">Getting...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Use My Location</span>
                    <span className="sm:hidden">Location</span>
                  </>
                )}
              </Button>
            </div>
            <Input 
              id="address" 
              placeholder="Enter your delivery address"
              {...register('address', { required: 'Address is required for delivery' })} 
              className="w-full h-11 sm:h-12 text-base touch-manipulation"
            />
            {errors.address && <p className="text-xs sm:text-sm text-destructive">{errors.address.message}</p>}
            {savedAddress && addressValue !== savedAddress && (
              <div className="p-3 sm:p-4 bg-muted rounded-md">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                  Saved address:
                </p>
                <p className="text-sm sm:text-base font-medium break-words">{savedAddress}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setValue('address', savedAddress);
                    toast({
                      title: 'Address Loaded',
                      description: 'Your saved address has been loaded',
                    });
                  }}
                  className="mt-2 h-8 sm:h-9 text-xs sm:text-sm touch-manipulation"
                >
                  Use This Address
                </Button>
              </div>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground">
              💡 Tip: If location doesn't work, you can always enter your address manually
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm sm:text-base">Your Address (Optional - for future orders)</Label>
            <Input 
              id="address" 
              placeholder="Enter your address (optional for pickup)"
              {...register('address', { required: false })} 
              className="h-11 sm:h-12 text-base touch-manipulation"
            />
            {savedAddress && (
              <div className="p-3 sm:p-4 bg-muted rounded-lg">
                <p className="text-sm sm:text-base font-medium mb-1">Saved Address:</p>
                <p className="text-sm sm:text-base text-muted-foreground break-words">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                  {savedAddress}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setValue('address', savedAddress);
                    toast({
                      title: 'Address Loaded',
                      description: 'Your saved address has been loaded',
                    });
                  }}
                  className="mt-2 h-8 sm:h-9 text-xs sm:text-sm touch-manipulation"
                >
                  Use Saved Address
                </Button>
              </div>
            )}
          </div>
        )}
        <Button type="submit" size="lg" className="w-full h-12 sm:h-14 text-base sm:text-lg touch-manipulation" disabled={isSubmitting || cartItems.length === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
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