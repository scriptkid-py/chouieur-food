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
        const transformedItems: MenuItem[] = items.map((item: any) => ({
          id: item._id || item.id || '',
          name: item.name || '',
          category: item.category || 'Pizza',
          price: parseFloat(item.price) || 0,
          megaPrice: item.megaPrice ? parseFloat(item.megaPrice) : undefined,
          description: item.description || '',
          imageId: item.imageId || '',
          imageUrl: item.imageUrl || '', // New field for actual image URLs
          isActive: item.isActive === true
        }));

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
