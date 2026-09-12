import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { supabase } from '../../../infrastructure/supabase/client';
import { createSupabaseAuthGateway } from '../infrastructure/supabase/SupabaseAuthGateway';
import type { AuthGateway } from '../application/AuthGateway';
import type { AppSession } from '../domain/auth';
import { AuthContext, type AuthContextValue } from './AuthContext';

export interface AuthProviderProps extends PropsWithChildren {
  gateway?: AuthGateway;
}

export function AuthProvider({ children, gateway: providedGateway }: AuthProviderProps) {
  const gateway = useMemo(() => providedGateway ?? createSupabaseAuthGateway(supabase), [providedGateway]);
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () => {
      void gateway
        .getSession()
        .then((nextSession) => {
          if (active) setSession(nextSession);
        })
        .catch(() => {
          if (active) setSession(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };
    load();
    const unsubscribe = gateway.subscribe(load);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [gateway]);

  const refreshSession = useMemo(
    () => async () => {
      const nextSession = await gateway.getSession();
      setSession(nextSession);
    },
    [gateway],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      async signUp(credentials) {
        await gateway.signUp(credentials);
      },
      async signIn(credentials) {
        const nextSession = await gateway.signIn(credentials);
        setSession(nextSession);
        return nextSession;
      },
      async signOut() {
        await gateway.signOut();
        setSession(null);
      },
      requestPasswordReset(email) {
        return gateway.requestPasswordReset(email, `${window.location.origin}/reinitialiser-mot-de-passe`);
      },
      updatePassword(password) {
        return gateway.updatePassword(password);
      },
      refreshSession,
    }),
    [gateway, loading, session, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
