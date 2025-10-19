import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api-config';

export interface AdminStats {
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    ready: number;
    delivered: number;
    growth: number;
  };
  revenue: {
    total: number;
    growth: number;
  };
  menu: {
    total: number;
    active: number;
    withImages: number;
    categories: number;
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    total: number;
    status: string;
    time: string;
    items: any[];
  }>;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest<{ success: boolean; data: AdminStats }>('/api/admin/stats');
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = () => {
    fetchStats();
  };

  return {
    stats,
    isLoading,
    error,
    refetch
  };
}
