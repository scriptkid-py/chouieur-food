'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import type { MenuItem } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatPrice } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

type MenuItemCardProps = {
  item: MenuItem;
};

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem } = useCart();
  const [size, setSize] = useState<'Normal' | 'Mega'>('Normal');
  
  // Use actual image URL if available, otherwise fall back to placeholder
  const imageUrl = item.imageUrl || (() => {
    const placeholder = PlaceHolderImages.find(p => p.id === item.imageId);
    return placeholder?.imageUrl;
  })();
  
  const hasSizeOption = item.megaPrice !== undefined;

  const handleAddToCart = () => {
    addItem(item, size);
  };
  
  const currentPrice = size === 'Mega' && item.megaPrice ? item.megaPrice : item.price;

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          {imageUrl ? (
             <Image
                src={imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  // Fallback to a simple placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="flex h-full w-full items-center justify-center bg-secondary"><span class="text-muted-foreground">No Image</span></div>';
                  }
                }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
                <span className="text-muted-foreground">No Image</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="mb-1 text-xl font-headline">{item.name}</CardTitle>
        <CardDescription className="text-sm">{item.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">{formatPrice(currentPrice)}</span>
            {hasSizeOption && (
                 <Select value={size} onValueChange={(value: 'Normal' | 'Mega') => setSize(value)}>
                    <SelectTrigger className="mt-2 h-8 w-[100px] text-xs">
                        <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Mega">Mega</SelectItem>
                    </SelectContent>
                </Select>
            )}
        </div>
        <Button onClick={handleAddToCart} size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add
        </Button>
      </CardFooter>
    </Card>
  );
}
