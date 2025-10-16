// User profile component - displays user info and sign out
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../services/authService';
import { generateUserColor } from '@/features/presence/types';

export function UserProfile() {
  const { user } = useAuth();
  const router = useRouter();
  
  if (!user) return null;
  
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };
  
  const userColor = generateUserColor(user.id);
  
  return (
    <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm border border-gray-200">
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
          style={{ backgroundColor: userColor }}
        >
          {user.displayName.charAt(0).toUpperCase()}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.displayName}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {user.email}
        </p>
      </div>
      
      <button
        onClick={handleSignOut}
        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}

