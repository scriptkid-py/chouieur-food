'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface StaffAuthContextType {
  isAuthenticated: boolean;
  role: 'admin' | 'kitchen' | null;
  isLoading: boolean;
  login: (role: 'admin' | 'kitchen') => void;
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

  const login = (newRole: 'admin' | 'kitchen') => {
    setIsAuthenticated(true);
    setRole(newRole);
    localStorage.setItem('staffAuth', JSON.stringify({ isAuthenticated: true, role: newRole }));
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