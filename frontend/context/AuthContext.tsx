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
  is_verified: boolean;
  is_admin: boolean;
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
        const userData = res.data;
        setUser(userData);
      } catch (err) {
        console.error("Auth check failed:", err);
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

    // Redirection Logic
    if (!userData.is_verified && !userData.is_admin && userData.role !== 'student') {
      router.push('/pending-approval');
    } else if (userData.is_admin || userData.role === 'admin') {
      router.push('/dashboard/admin');
    } else if (userData.role === 'instructor') {
      router.push('/dashboard/instructor');
    } else if (userData.role === 'assistant') {
      router.push('/dashboard/assistant');
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
