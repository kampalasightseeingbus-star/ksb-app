import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, getUser, removeToken, removeUser } from '../lib/api';

interface User {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  // Check phone storage for saved user on app start
  const loadUser = async () => {
    try {
      const savedUser = await getUser();
      if (savedUser) setUser(savedUser);
    } catch (err) {
      console.error('Load user error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch latest user data from server
  const refreshUser = async () => {
    try {
      const data = await authAPI.getProfile();
      setUser(data.user);
      // Update saved user in phone storage
      const { saveUser } = require('../lib/api');
      await saveUser(data.user);
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  // Clear everything on logout
  const logout = async () => {
    await removeToken();
    await removeUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, isLoading, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);