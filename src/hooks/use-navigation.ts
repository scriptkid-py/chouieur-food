'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api-config';
import type { NavigationItem } from '@/lib/types';

interface UseNavigationOptions {
  menuType?: 'public' | 'admin';
  visible?: boolean;
  requiresAuth?: boolean;
}

/**
 * Hook to fetch and manage navigation items
 */
export function useNavigation(options: UseNavigationOptions = {}) {
  const { menuType = 'public', visible = true } = options;
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          menuType,
          visible: String(visible),
        });
        
        const response = await apiRequest<{
          success: boolean;
          data: NavigationItem[];
          count: number;
        }>(`/api/navigation?${params.toString()}`);
        
        if (response.success && response.data) {
          // Filter by requiresAuth if user auth state is needed
          // For now, return all items - filtering by auth happens in component
          setNavigationItems(response.data);
        } else {
          throw new Error('Failed to fetch navigation items');
        }
      } catch (err) {
        console.error('Error fetching navigation items:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch navigation');
        setNavigationItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNavigation();
  }, [menuType, visible]);

  return {
    navigationItems,
    isLoading,
    error,
    refetch: () => {
      // Trigger refetch by toggling a dependency
      const fetchNavigation = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          const params = new URLSearchParams({
            menuType,
            visible: String(visible),
          });
          
          const response = await apiRequest<{
            success: boolean;
            data: NavigationItem[];
            count: number;
          }>(`/api/navigation?${params.toString()}`);
          
          if (response.success && response.data) {
            setNavigationItems(response.data);
          }
        } catch (err) {
          console.error('Error fetching navigation items:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch navigation');
        } finally {
          setIsLoading(false);
        }
      };
      fetchNavigation();
    }
  };
}

/**
 * Load navigation items (for SSR or initial load)
 */
export async function loadNavigationItems(
  menuType: 'public' | 'admin' = 'public',
  visible: boolean = true
): Promise<NavigationItem[]> {
  try {
    const params = new URLSearchParams({
      menuType,
      visible: String(visible),
    });
    
    const response = await apiRequest<{
      success: boolean;
      data: NavigationItem[];
      count: number;
    }>(`/api/navigation?${params.toString()}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to load navigation items:', error);
    return [];
  }
}

