// Auth provider - initializes auth state globally
'use client';

import { useAuth } from '../hooks/useAuth';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth provider that sets up Firebase auth state listener globally
 * This ensures auth state persists across page refreshes
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Simply calling useAuth here sets up the onAuthStateChanged listener
  useAuth();
  
  return <>{children}</>;
}


