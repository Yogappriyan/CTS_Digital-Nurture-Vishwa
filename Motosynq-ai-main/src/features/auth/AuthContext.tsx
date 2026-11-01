import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, testFirestoreConnection } from '../../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User as FirebaseUser } from 'firebase/auth';
import { IS_DEMO_CONFIGURED } from '../../demo/sampleData';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  isFirebaseConfigured: boolean;
  loginWithGoogle: () => Promise<{ error?: string }>;
  loginWithEmailLocal: (email: string, displayName?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  toggleDemoMode: (enabled?: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'user-demo',
  email: 'rider.demo@motosynq.internal',
  displayName: 'MotoSynq Field Tester',
  avatarUrl: '',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('motosynq_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return IS_DEMO_CONFIGURED ? DEMO_USER : null;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('motosynq_demo_mode');
    if (saved !== null) return saved === 'true';
    return IS_DEMO_CONFIGURED;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Test Firestore connection on app mount
    testFirestoreConnection();

    // Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const u: UserProfile = {
          id: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Rider',
          avatarUrl: fbUser.photoURL || undefined,
        };
        setUser(u);
        localStorage.setItem('motosynq_user', JSON.stringify(u));
        setIsDemoMode(false);
      } else {
        if (!isDemoMode) {
          const savedUser = localStorage.getItem('motosynq_user');
          if (!savedUser) {
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const toggleDemoMode = (enabled?: boolean) => {
    const nextVal = enabled !== undefined ? enabled : !isDemoMode;
    setIsDemoMode(nextVal);
    localStorage.setItem('motosynq_demo_mode', String(nextVal));
    if (nextVal) {
      setUser(DEMO_USER);
      localStorage.setItem('motosynq_user', JSON.stringify(DEMO_USER));
    } else {
      if (!auth.currentUser) {
        setUser(null);
        localStorage.removeItem('motosynq_user');
      }
    }
  };

  const loginWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const u: UserProfile = {
          id: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Rider',
          avatarUrl: result.user.photoURL || undefined,
        };
        setUser(u);
        localStorage.setItem('motosynq_user', JSON.stringify(u));
        setIsDemoMode(false);
      }
      return {};
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      return { error: err?.message || 'Google Sign-In was cancelled or failed.' };
    }
  };

  const loginWithEmailLocal = async (email: string, displayName?: string): Promise<{ error?: string }> => {
    if (!email) return { error: 'Email is required' };
    const mockUser: UserProfile = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      email,
      displayName: displayName || email.split('@')[0],
    };
    setUser(mockUser);
    localStorage.setItem('motosynq_user', JSON.stringify(mockUser));
    return {};
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.warn('Firebase signout error:', err);
    }
    setUser(null);
    localStorage.removeItem('motosynq_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemoMode,
        isFirebaseConfigured: true,
        loginWithGoogle,
        loginWithEmailLocal,
        logout,
        toggleDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
