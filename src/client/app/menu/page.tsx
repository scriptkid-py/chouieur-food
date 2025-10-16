'use client';

import { useState } from 'react';
import { MENU_ITEMS } from '@/lib/menu-data';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import type { MenuItemCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sandwich, Pizza, Drumstick, Ham, Wheat, Utensils } from 'lucide-react';

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

  const filteredItems = activeCategory === 'All'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(item => item.category === activeCategory);

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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map(item => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
