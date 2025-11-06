'use client';

import { useState } from 'react';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { useMenuItems } from '@/hooks/use-menu-items';
import type { MenuItemCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sandwich, Pizza, Drumstick, Ham, Wheat, Utensils, Loader2 } from 'lucide-react';

const categories: { name: MenuItemCategory; icon: React.ElementType }[] = [
  { name: 'Sandwiches', icon: Sandwich },
  { name: 'Pizza', icon: Pizza },
  { name: 'Tacos', icon: Wheat },
  { name: 'Poulet', icon: Drumstick },
  { name: 'Hamburgers', icon: Ham },
  { name: 'Panini / Fajitas', icon: Wheat },
  { name: 'Plats', icon: Utensils },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<MenuItemCategory | 'All'>('All');
  const { menuItems, isLoading, error } = useMenuItems();

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading menu...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="text-center">
          <p className="text-red-500">Error loading menu: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <header className="mb-6 sm:mb-8 text-center px-2">
        <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-primary">Our Menu</h1>
        <p className="mt-2 text-sm sm:text-base md:text-lg text-muted-foreground">Explore our delicious offerings, crafted with the freshest ingredients.</p>
      </header>

      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 px-2">
          <Button
            onClick={() => setActiveCategory('All')}
            variant={activeCategory === 'All' ? 'default' : 'outline'}
            className={cn(
              "rounded-full transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 touch-manipulation",
              activeCategory === 'All' && 'bg-primary text-primary-foreground'
            )}
          >
            All
          </Button>
          {categories.map(({ name, icon: Icon }) => (
            <Button
              key={name}
              onClick={() => setActiveCategory(name)}
              variant={activeCategory === name ? 'default' : 'outline'}
              className={cn(
                  "rounded-full transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 touch-manipulation",
                  activeCategory === name && 'bg-primary text-primary-foreground'
              )}
            >
              <Icon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{name}</span>
              <span className="sm:hidden">{name.split(' ')[0]}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map(item => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
