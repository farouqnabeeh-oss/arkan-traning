'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean; email?: string }>;
  register: (name: string, email: string, password: string, referralCode?: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean; email?: string }>;
  logout: () => Promise<void>;
  getFingerprint: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // useRouter is safe in a 'use client' component but we keep a ref
  // to avoid stale closure issues inside async callbacks.
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => { routerRef.current = router; });

  // Generate a simple persistent device fingerprint
  const getFingerprint = () => {
    if (typeof window === 'undefined') return 'server';
    
    let fingerprint = localStorage.getItem('arkan_device_id');
    if (!fingerprint) {
      // Generate a simple UUID-like string
      const randomPart = Math.random().toString(36).substring(2, 15);
      const agentPart = navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
      fingerprint = `dev_${randomPart}_${agentPart}`;
      localStorage.setItem('arkan_device_id', fingerprint);
    }
    return fingerprint;
  };

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error('Failed checking authentication session:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const fingerprint = getFingerprint();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fingerprint }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsVerification) {
          return { success: false, error: data.error, needsVerification: true, email: data.email };
        }
        return { success: false, error: data.error || 'حدث خطأ ما' };
      }

      setUser(data.user);
      router.refresh();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'تعذر الاتصال بالخادم. يرجى مراجعة الشبكة.' };
    }
  };

  const register = async (name: string, email: string, password: string, referralCode?: string) => {
    try {
      const fingerprint = getFingerprint();
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, fingerprint, referralCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'حدث خطأ ما' };
      }

      if (data.needsVerification) {
        return { success: true, needsVerification: true, email: data.email };
      }

      setUser(data.user);
      router.refresh();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'تعذر الاتصال بالخادم. يرجى مراجعة الشبكة.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getFingerprint }}>
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
