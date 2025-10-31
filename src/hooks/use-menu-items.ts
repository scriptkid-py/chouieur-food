import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api-config';
import type { MenuItem, MenuItemCategory } from '@/lib/types';

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expose refetch function
  const fetchMenuItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Fetching menu items...');
      
      const response = await apiRequest<any>('/api/menu-items');
      console.log('📦 Menu items response:', response);
      
      let items: any[] = [];
      
      // Handle different response formats
      if (Array.isArray(response)) {
        items = response;
        console.log(`✅ Got ${items.length} items directly from array`);
      } else if (response?.data && Array.isArray(response.data)) {
        items = response.data;
        console.log(`✅ Got ${items.length} items from response.data`);
      } else if (response?.menuItems && Array.isArray(response.menuItems)) {
        items = response.menuItems;
        console.log(`✅ Got ${items.length} items from response.menuItems`);
      } else if (response && typeof response === 'object') {
        // Check if response has error
        if (response.error || response.success === false) {
          console.error('❌ API returned error:', response);
          throw new Error(response.message || response.error || 'Failed to fetch menu items');
        }
        // If response exists but no items found, use empty array
        if (response.count === 0 || (response.data && response.data.length === 0)) {
          items = [];
          console.log('⚠️ No menu items found in response');
        } else {
          console.error('❌ Invalid menu items response format:', response);
          throw new Error('Invalid menu items response format');
        }
      } else {
        console.error('❌ Unexpected response type:', typeof response, response);
        throw new Error('Unexpected response format');
      }
      
      // Transform items
      const transformedItems: MenuItem[] = items.map((item: any, index: number) => {
        const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0));
        const megaPrice = item.megaPrice ? (typeof item.megaPrice === 'number' ? item.megaPrice : parseFloat(String(item.megaPrice))) : undefined;
        return {
          id: String(item._id || item.id || `item-${index}`),
          name: String(item.name || 'Unknown Item'),
          category: String(item.category || 'Pizza') as MenuItemCategory,
          price: isNaN(price) ? 0 : price,
          megaPrice: (megaPrice !== null && megaPrice !== undefined && !isNaN(megaPrice)) ? megaPrice : undefined,
          description: String(item.description || ''),
          imageId: String(item.imageId || ''),
          imageUrl: String(item.imageUrl || ''),
          isActive: item.isActive === true || item.isActive === 'TRUE' || String(item.isActive).toUpperCase() === 'TRUE'
        };
      });
      
      console.log(`✅ Transformed ${transformedItems.length} menu items`);
      setMenuItems(transformedItems);
    } catch (err) {
      console.error('❌ Error fetching menu items:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load menu items';
      setError(errorMessage);
      setMenuItems([]); // Set empty array on error
    } finally {
      setIsLoading(false);
      console.log('✅ Finished loading menu items');
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  return { menuItems, isLoading, error, refetch: fetchMenuItems };
}
