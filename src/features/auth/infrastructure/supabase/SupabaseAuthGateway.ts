import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthGateway } from '../../application/AuthGateway';
import { AuthFailure, membershipRoles, type AppSession, type LoginCredentials, type MembershipRole } from '../../domain/auth';

const knownRoles = new Set<string>(membershipRoles);

function parseSession(data: unknown): AppSession | null {
  if (data == null) return null;
  const raw = data as Record<string, unknown>;
  const memberships = Array.isArray(raw.memberships) ? raw.memberships : [];
  return {
    authUserId: String(raw.authUserId),
    email: String(raw.email),
    memberships: memberships
      .map((m) => m as Record<string, unknown>)
      .filter((m) => knownRoles.has(m.role as string))
      .map((m) => ({
        organizationId: String(m.organizationId),
        organizationName: String(m.organizationName),
        role: m.role as MembershipRole,
      })),
  };
}

async function resolveAppSession(client: SupabaseClient): Promise<AppSession | null> {
  const { data, error } = await client.rpc('current_app_session');
  if (error) {
    throw new AuthFailure('UNEXPECTED', 'Votre session n’a pas pu être lue. Rechargez la page.');
  }
  return parseSession(data);
}

export function createSupabaseAuthGateway(client: SupabaseClient): AuthGateway {
  return {
    async getSession() {
      const { data } = await client.auth.getSession();
      return data.session ? resolveAppSession(client) : null;
    },
    async signUp({ email, password }: LoginCredentials) {
      const { error } = await client.auth.signUp({ email, password });
      if (error) {
        throw new AuthFailure('UNEXPECTED', 'La création du compte a échoué. Réessayez dans un instant.');
      }
    },
    async signIn({ email, password }: LoginCredentials) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error?.status === 429) {
        throw new AuthFailure('UNEXPECTED', 'Trop de tentatives. Patientez quelques minutes avant de réessayer.');
      }
      if (error) {
        throw new AuthFailure('INVALID_CREDENTIALS', 'Courriel ou mot de passe invalide.');
      }
      if (!data.session) {
        throw new AuthFailure('INVALID_CREDENTIALS', 'Courriel ou mot de passe invalide.');
      }
      const session = await resolveAppSession(client);
      if (!session) {
        await client.auth.signOut();
        throw new AuthFailure('UNEXPECTED', 'Votre profil n’a pas pu être chargé.');
      }
      return session;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw new AuthFailure('UNEXPECTED', 'La déconnexion n’a pas pu être terminée.');
    },
    async requestPasswordReset(email, redirectUrl) {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
      if (error) throw new AuthFailure('UNEXPECTED', 'La demande ne peut pas être traitée pour le moment.');
    },
    async updatePassword(password) {
      const { error } = await client.auth.updateUser({ password });
      if (error) throw new AuthFailure('UNEXPECTED', 'Le mot de passe n’a pas pu être modifié.');
    },
    subscribe(listener) {
      const { data } = client.auth.onAuthStateChange(() => {
        listener();
      });
      return () => {
        data.subscription.unsubscribe();
      };
    },
  };
}
