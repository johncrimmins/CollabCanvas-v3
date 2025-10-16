// Auth hook - manages authentication state
'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/shared/lib/firebase';
import { useStore } from '@/shared/lib/store';
import { User } from '@/shared/types';

/**
 * Hook to manage authentication state
 */
export function useAuth() {
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
          photoURL: firebaseUser.photoURL,
        };
        setUser(user);
      } else {
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

