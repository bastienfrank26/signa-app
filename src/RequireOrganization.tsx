import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from './features/auth/presentation/useAuth';
import { supabase } from './infrastructure/supabase/client';
import { AuthLoadingState } from './features/auth/presentation/guards';
import NoOrganizationPage from './features/organizations/presentation/NoOrganizationPage';

function useIsStaff(enabled: boolean): { isStaff: boolean; loading: boolean } {
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void Promise.resolve(supabase.rpc('current_staff_role'))
      .then(({ data }) => {
        if (active) setIsStaff(Boolean(data));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return { isStaff, loading };
}

export default function RequireOrganization() {
  const { session } = useAuth();
  const hasNoOrganization = Boolean(session && session.memberships.length === 0);
  const { isStaff, loading } = useIsStaff(hasNoOrganization);

  if (hasNoOrganization) {
    // Le personnel Signa n'a jamais d'organisation cliente — l'écran de
    // création d'entreprise ne s'applique qu'aux clients. L'administration
    // vit maintenant dans un repo/domaine séparé (signa-admin), donc la
    // redirection sort de cette SPA (voir signa-docs Phase 4).
    if (loading) return <AuthLoadingState />;
    if (isStaff) {
      window.location.replace('https://admin.signaweb.ca/');
      return <AuthLoadingState />;
    }
    return <NoOrganizationPage />;
  }
  return <Outlet />;
}
