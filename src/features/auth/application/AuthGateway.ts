import type { AppSession, LoginCredentials } from '../domain/auth';

export interface AuthGateway {
  getSession: () => Promise<AppSession | null>;
  signUp: (credentials: LoginCredentials) => Promise<void>;
  signIn: (credentials: LoginCredentials) => Promise<AppSession>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string, redirectUrl: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  subscribe: (listener: () => void) => () => void;
}
