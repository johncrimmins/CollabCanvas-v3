// Auth feature types

/**
 * User information
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

/**
 * Auth form data for sign in/sign up
 */
export interface AuthFormData {
  email: string;
  password: string;
  displayName?: string;
}

/**
 * Auth mode for form
 */
export type AuthMode = 'signin' | 'signup';
