'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type StaffRole = 'admin' | 'kitchen';

interface StaffAuthContextType {
  isAuthenticated: boolean;
  role: StaffRole | null;
  login: (username: string, password: string) => { success: boolean; role: StaffRole | null };
  logout: () => void;
  isLoading: boolean;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const StaffAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<StaffRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
        const storedRole = localStorage.getItem('staffRole');
        if (storedRole && (storedRole === 'admin' || storedRole === 'kitchen')) {
            setIsAuthenticated(true);
            setRole(storedRole);
        }
    } catch (error) {
        console.error("Could not access localStorage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = (username: string, password: string): { success: boolean; role: StaffRole | null } => {
    let loggedInRole: StaffRole | null = null;

    if (username === 'admin' && password === 'admin') {
      loggedInRole = 'admin';
    } else if (username === 'kitchen' && password === 'kitchen') {
      loggedInRole = 'kitchen';
    }

    if (loggedInRole) {
      try {
        localStorage.setItem('staffRole', loggedInRole);
      } catch (error) {
        console.error("Could not access localStorage", error);
      }
      setIsAuthenticated(true);
      setRole(loggedInRole);
      return { success: true, role: loggedInRole };
    }

    return { success: false, role: null };
  };

  const logout = () => {
    try {
        localStorage.removeItem('staffRole');
    } catch (error) {
        console.error("Could not access localStorage", error);
    }
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <StaffAuthContext.Provider value={{ isAuthenticated, role, login, logout, isLoading }}>
      {children}
    </StaffAuthContext.Provider>
  );
};

export const useStaffAuth = () => {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
};
