'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { QuantitySelector } from './QuantitySelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUPPLEMENTS } from '@/lib/menu-data';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

type CartItemCardProps = {
  item: CartItem;
};

export function CartItemCard({ item }: CartItemCardProps) {
  const { removeItem, updateQuantity, updateSize, toggleSupplement } = useCart();
  const image = PlaceHolderImages.find(p => p.id === item.menuItem.imageId);
  const hasSizeOption = item.menuItem.megaPrice !== undefined;

  return (
    <Card className="overflow-hidden shadow-md">
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-start">
        <div className="relative h-32 w-full flex-shrink-0 md:h-40 md:w-40">
          {image && (
            <Image
              src={image.imageUrl}
              alt={item.menuItem.name}
              data-ai-hint={image.imageHint}
              fill
              className="rounded-md object-cover"
            />
          )}
        </div>
        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <h3 className="font-headline text-xl font-semibold">{item.menuItem.name}</h3>
            <Button variant="ghost" size="icon" onClick={() => removeItem(item.cartId)}>
              <Trash2 className="h-5 w-5 text-destructive" />
              <span className="sr-only">Remove item</span>
            </Button>
          </div>
          <div className="mt-2 flex items-center gap-4">
            <QuantitySelector
              quantity={item.quantity}
              onQuantityChange={(newQuantity) => updateQuantity(item.cartId, newQuantity)}
            />
            {hasSizeOption && (
              <Select value={item.size} onValueChange={(value: 'Normal' | 'Mega') => updateSize(item.cartId, value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal ({formatPrice(item.menuItem.price)})</SelectItem>
                  <SelectItem value="Mega">Mega ({formatPrice(item.menuItem.megaPrice!)})</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <Accordion type="single" collapsible className="mt-4 w-full">
            <AccordionItem value="supplements">
              <AccordionTrigger className="text-sm font-medium">Add Supplements</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 md:grid-cols-3">
                    {SUPPLEMENTS.map(supplement => (
                        <div key={supplement.id} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`${item.cartId}-${supplement.id}`}
                                checked={item.supplements.some(s => s.id === supplement.id)}
                                onCheckedChange={() => toggleSupplement(item.cartId, supplement)}
                            />
                            <Label htmlFor={`${item.cartId}-${supplement.id}`} className="flex-grow text-sm">
                                {supplement.name} (+{formatPrice(supplement.price)})
                            </Label>
                        </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
        </div>
        <div className="mt-4 text-right font-bold text-lg text-primary md:mt-0 md:text-xl">
          {formatPrice(item.totalPrice)}
        </div>
      </CardContent>
    </Card>
  );
}
