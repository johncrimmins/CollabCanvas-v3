// Auth feature types

export interface AuthFormData {
  email: string;
  password: string;
  displayName?: string;
}

export type AuthMode = 'signin' | 'signup';

