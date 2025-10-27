import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api-config';
import type { MenuItem } from '@/lib/types';

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🍽️ Fetching menu items...');
        const response = await apiRequest<{ success: boolean; menuItems: any[] }>('/api/menu-items');
        console.log('📋 Menu items response:', response);
        
        // Extract menuItems array from response
        const items = response.menuItems || response;
        
        // Transform the response to match MenuItem interface
        const transformedItems: MenuItem[] = items.map((item: any) => {
          const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0));
          const megaPrice = item.megaPrice ? (typeof item.megaPrice === 'number' ? item.megaPrice : parseFloat(String(item.megaPrice))) : undefined;
          
          return {
            id: String(item._id || item.id || ''),
            name: String(item.name || 'Unknown Item'),
            category: String(item.category || 'Pizza'),
            price: isNaN(price) ? 0 : price,
            megaPrice: megaPrice && !isNaN(megaPrice) ? megaPrice : undefined,
            description: String(item.description || ''),
            imageId: String(item.imageId || ''),
            imageUrl: String(item.imageUrl || ''),
            isActive: item.isActive === true || item.isActive === 'TRUE' || item.isActive === true
          };
        });

        setMenuItems(transformedItems);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  return { menuItems, isLoading, error };
}
