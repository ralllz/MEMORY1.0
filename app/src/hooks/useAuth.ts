import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';

const VALID_PHONES = ['082339503532', '085339951848'];
const VALID_PASSWORD = '20052006';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('memory_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((phone: string, password: string): boolean => {
    if (VALID_PHONES.includes(phone) && password === VALID_PASSWORD) {
      const newUser = { phone, isLoggedIn: true };
      setUser(newUser);
      localStorage.setItem('memory_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('memory_user');
  }, []);

  const isAuthenticated = useCallback(() => {
    return user?.isLoggedIn === true;
  }, [user]);

  return {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };
}
