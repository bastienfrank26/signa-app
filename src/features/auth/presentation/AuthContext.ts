import { createContext } from 'react';
import type { AppSession, LoginCredentials } from '../domain/auth';

export interface AuthContextValue {
  session: AppSession | null;
  loading: boolean;
  signUp: (credentials: LoginCredentials) => Promise<void>;
  signIn: (credentials: LoginCredentials) => Promise<AppSession>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
