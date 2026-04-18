"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '@/services/api';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  track: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (access_token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/users/me');
        setUser(res.data);
      } catch (err) {
        console.error("Auth check failed:", err);
        // Only wipe token if it's a definitive 401/403
        if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
          localStorage.removeItem('access_token');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('access_token', token);
    setUser(userData);
    if (userData.role === 'instructor') {
      router.push('/dashboard/instructor');
    } else {
      router.push('/dashboard/student');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
