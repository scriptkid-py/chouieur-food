'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function CartPage() {
  const { cartItems, cartTotal, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center gap-6 py-24 text-center">
        <ShoppingCart className="h-24 w-24 text-muted-foreground" />
        <h1 className="font-headline text-4xl font-bold">Your Cart is Empty</h1>
        <p className="text-lg text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild size="lg" className="bg-primary text-primary-foreground">
          <Link href="/menu">Start Ordering</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:px-6">
      <h1 className="mb-6 sm:mb-8 font-headline text-3xl sm:text-4xl font-bold text-primary px-2">Your Cart</h1>
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {cartItems.map(item => (
            <CartItemCard key={item.cartId} item={item} />
          ))}
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-20 sm:top-24 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="font-headline text-xl sm:text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="flex justify-between text-base sm:text-lg">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-medium">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-lg sm:text-xl font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatPrice(cartTotal)}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 sm:p-6 pt-0">
              <Button asChild size="lg" className="w-full bg-primary text-primary-foreground h-12 sm:h-14 text-base sm:text-lg touch-manipulation">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
