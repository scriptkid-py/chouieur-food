'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface StaffAuthContextType {
  isAuthenticated: boolean;
  role: 'admin' | 'kitchen' | null;
  isLoading: boolean;
  login: (username: string, password: string) => { success: boolean; role?: 'admin' | 'kitchen' };
  logout: () => void;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export function StaffAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<'admin' | 'kitchen' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication on mount
    const storedAuth = localStorage.getItem('staffAuth');
    if (storedAuth) {
      const { isAuthenticated: stored, role: storedRole } = JSON.parse(storedAuth);
      setIsAuthenticated(stored);
      setRole(storedRole);
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string) => {
    // Simple hardcoded credentials for demo purposes
    // In production, this should be replaced with proper authentication
    const credentials = {
      admin: { username: 'admin', password: 'admin123' },
      kitchen: { username: 'kitchen', password: 'kitchen123' }
    };

    // Check admin credentials
    if (username === credentials.admin.username && password === credentials.admin.password) {
      setIsAuthenticated(true);
      setRole('admin');
      localStorage.setItem('staffAuth', JSON.stringify({ isAuthenticated: true, role: 'admin' }));
      return { success: true, role: 'admin' };
    }

    // Check kitchen credentials
    if (username === credentials.kitchen.username && password === credentials.kitchen.password) {
      setIsAuthenticated(true);
      setRole('kitchen');
      localStorage.setItem('staffAuth', JSON.stringify({ isAuthenticated: true, role: 'kitchen' }));
      return { success: true, role: 'kitchen' };
    }

    // Invalid credentials
    return { success: false };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    localStorage.removeItem('staffAuth');
  };

  return (
    <StaffAuthContext.Provider
      value={{
        isAuthenticated,
        role,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
}