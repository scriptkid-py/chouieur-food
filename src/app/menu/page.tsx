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
      <header className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">Our Menu</h1>
        <p className="mt-2 text-lg text-muted-foreground">Explore our delicious offerings, crafted with the freshest ingredients.</p>
      </header>

      <div className="mb-8 flex flex-wrap justify-center gap-2 md:gap-4">
        <Button
          onClick={() => setActiveCategory('All')}
          variant={activeCategory === 'All' ? 'default' : 'outline'}
          className={cn(
            "rounded-full transition-all duration-300",
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
                "rounded-full transition-all duration-300",
                activeCategory === name && 'bg-primary text-primary-foreground'
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {name}
          </Button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Utensils className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-lg font-semibold text-muted-foreground">No menu items found</p>
          <p className="text-sm text-muted-foreground mt-2">
            {activeCategory !== 'All' 
              ? `No items in the "${activeCategory}" category`
              : 'The menu is currently empty. Please check back later.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
