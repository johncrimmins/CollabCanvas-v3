// Auth service - handles Firebase authentication
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { getAuth } from '../lib/firebase';
import { AuthFormData } from '../types';

/**
 * Sign up a new user with email and password
 */
export async function signUp(data: AuthFormData): Promise<void> {
  const { email, password, displayName } = data;
  
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  const auth = getAuth();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update display name if provided
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, {
      displayName,
    });
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(data: AuthFormData): Promise<void> {
  const { email, password } = data;
  
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  const auth = getAuth();
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const auth = getAuth();
  await firebaseSignOut(auth);
}

