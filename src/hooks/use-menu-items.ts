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
          id: item.id || item.id,
          name: item.name || item.name,
          category: item.category || item.category,
          price: parseFloat(item.price || item.price) || 0,
          megaPrice: item.megaprice ? parseFloat(item.megaprice) : undefined,
          description: item.description || item.description,
          imageId: item.imageid || item.imageId,
          imageUrl: item.imageurl || item.imageUrl, // New field for actual image URLs
          isActive: item.isactive === 'TRUE' || item.isActive === true
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
