'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type StaffUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  isAuthenticated: boolean;
};

type StaffAuthContextType = {
  user: StaffUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
};

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const StaffAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('staff_token');
        if (token) {
          // In a real app, you'd validate the token with your backend
          // For now, we'll just check if it exists
          const userData = localStorage.getItem('staff_user');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('staff_token');
        localStorage.removeItem('staff_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simple hardcoded credentials for demo purposes
      // In production, this should call your backend API
      const validCredentials = [
        { email: 'admin@chouieur.com', password: 'admin123', role: 'admin' as const, name: 'Admin User' },
        { email: 'staff@chouieur.com', password: 'staff123', role: 'staff' as const, name: 'Staff User' }
      ];

      const credential = validCredentials.find(
        cred => cred.email === email && cred.password === password
      );

      if (credential) {
        const userData: StaffUser = {
          id: credential.email,
          email: credential.email,
          name: credential.name,
          role: credential.role,
          isAuthenticated: true
        };

        setUser(userData);
        localStorage.setItem('staff_token', 'demo_token_' + Date.now());
        localStorage.setItem('staff_user', JSON.stringify(userData));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('staff_token');
    localStorage.removeItem('staff_user');
    router.push('/');
  };

  const isAuthenticated = user?.isAuthenticated || false;

  return (
    <StaffAuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isAuthenticated
    }}>
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
