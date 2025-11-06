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
import { getApiBaseUrl } from '@/lib/api-config';

type MenuItemCardProps = {
  item: MenuItem;
};

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem } = useCart();
  const [size, setSize] = useState<'Normal' | 'Mega'>('Normal');
  
  // Use actual image URL if available, otherwise fall back to placeholder
  // Construct full URL for /uploads/ paths
  const imageUrl = (() => {
    if (item.imageUrl) {
      // If it's a relative path (/uploads/...), construct full URL
      if (item.imageUrl.startsWith('/uploads/')) {
        return `${getApiBaseUrl()}${item.imageUrl}`;
      }
      // If it's already a full URL (Cloudinary, data URL, etc.), use as-is
      return item.imageUrl;
    }
    // Fallback to placeholder
    const placeholder = PlaceHolderImages.find(p => p.id === item.imageId);
    return placeholder?.imageUrl;
  })();
  
  const hasSizeOption = item.megaPrice !== undefined;

  const handleAddToCart = () => {
    addItem(item, size);
  };
  
  const currentPrice = size === 'Mega' && item.megaPrice ? item.megaPrice : item.price;

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl active:scale-100">
      <CardHeader className="p-0">
        <div className="relative h-40 sm:h-48 w-full">
          {imageUrl ? (
             <Image
                src={imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={(e) => {
                  // Fallback to a simple placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="flex h-full w-full items-center justify-center bg-secondary"><span class="text-muted-foreground text-sm">No Image</span></div>';
                  }
                }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
                <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-3 sm:p-4">
        <CardTitle className="mb-1 text-lg sm:text-xl font-headline line-clamp-2">{item.name}</CardTitle>
        <CardDescription className="text-xs sm:text-sm line-clamp-2">{item.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-3 sm:p-4 pt-0 gap-2">
        <div className="flex flex-col min-w-0 flex-1">
            <span className="text-base sm:text-lg font-bold text-primary">{formatPrice(currentPrice)}</span>
            {hasSizeOption && (
                 <Select value={size} onValueChange={(value: 'Normal' | 'Mega') => setSize(value)}>
                    <SelectTrigger className="mt-2 h-8 sm:h-9 w-full max-w-[120px] text-xs touch-manipulation">
                        <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Mega">Mega</SelectItem>
                    </SelectContent>
                </Select>
            )}
        </div>
        <Button onClick={handleAddToCart} size="sm" className="gap-1.5 sm:gap-2 px-3 sm:px-4 h-9 sm:h-10 touch-manipulation flex-shrink-0">
            <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs sm:text-sm">Add</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
