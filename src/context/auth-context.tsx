
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signInWithPopup, signOut, User, GoogleAuthProvider, OAuthCredential } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  signInWithGoogle: () => Promise<string | null>;
  logout: () => Promise<void>;
  clearAccessToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      const savedToken = localStorage.getItem('google_access_token');
      if (savedToken) setAccessToken(savedToken);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<string | null> => {
    setLoading(true);
    let token: string | null = null;
    try {
        googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
            token = credential.accessToken || null;
            setAccessToken(token);
            if (token) localStorage.setItem('google_access_token', token);
        }
        setUser(result.user);
    } catch (error) {
      console.error("Authentication failed:", error);
    } finally {
      setLoading(false);
    }
    return token;
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('google_access_token');
    } catch (error) {
        console.error("Sign out failed:", error)
    } finally {
        setLoading(false);
    }
  };

  const clearAccessToken = () => {
    setAccessToken(null);
    localStorage.removeItem('google_access_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, signInWithGoogle, logout, clearAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading || (!user && pathname !== '/login')) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
