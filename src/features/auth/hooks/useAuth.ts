// Auth hook - manages authentication state
'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../lib/authStore';
import { User } from '../types';

/**
 * Hook to manage authentication state
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  
  useEffect(() => {
    if (!auth) {
      console.warn('[Auth] Firebase auth not initialized');
      return;
    }
    
    console.log('[Auth] Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        console.log('[Auth] User authenticated:', firebaseUser.email);
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
          photoURL: firebaseUser.photoURL,
        };
        setUser(user);
      } else {
        console.log('[Auth] User not authenticated');
        setUser(null);
      }
    });
    
    return () => unsubscribe();
  }, [setUser]);
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading: false, // You can add loading state if needed
  };
}

