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
        const response = await apiRequest<any>('/api/menu-items');
        console.log('📋 Menu items response:', response);
        
        // Extract menuItems array from response - handle multiple formats
        // Render backend returns: { success: true, data: [...] }
        // Vercel serverless returns: { success: true, menuItems: [...] }
        // Fallback: direct array or response itself
        let items: any[] = [];
        if (Array.isArray(response)) {
          items = response;
        } else if (response?.data && Array.isArray(response.data)) {
          items = response.data;
        } else if (response?.menuItems && Array.isArray(response.menuItems)) {
          items = response.menuItems;
        } else {
          console.error('❌ Invalid menu items response format:', response);
          throw new Error('Invalid menu items response format');
        }
        
        // Transform the response to match MenuItem interface
        const transformedItems: MenuItem[] = items.map((item: any, index: number) => {
          console.log(`Processing item ${index}:`, item);
          
          const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0));
          const megaPrice = item.megaPrice ? (typeof item.megaPrice === 'number' ? item.megaPrice : parseFloat(String(item.megaPrice))) : undefined;
          
          const transformed = {
            id: String(item._id || item.id || ''),
            name: String(item.name || 'Unknown Item'),
            category: String(item.category || 'Pizza') as MenuItemCategory,
            price: isNaN(price) ? 0 : price,
            megaPrice: (megaPrice !== null && megaPrice !== undefined && !isNaN(megaPrice)) ? megaPrice : undefined,
            description: String(item.description || ''),
            imageId: String(item.imageId || ''),
            imageUrl: String(item.imageUrl || ''),
            isActive: item.isActive === true || item.isActive === 'TRUE' || String(item.isActive).toUpperCase() === 'TRUE'
          };
          
          console.log(`Transformed item ${index}:`, transformed);
          return transformed;
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
