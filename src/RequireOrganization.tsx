import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './features/auth/presentation/useAuth';
import { useStaffRole } from './features/admin/presentation/useStaffRole';
import { AuthLoadingState } from './features/auth/presentation/guards';
import NoOrganizationPage from './features/organizations/presentation/NoOrganizationPage';

export default function RequireOrganization() {
  const { session } = useAuth();
  const { role, loading } = useStaffRole();

  if (session && session.memberships.length === 0) {
    // Le personnel Signa n'a jamais d'organisation cliente — l'écran de
    // création d'entreprise ne s'applique qu'aux clients.
    if (loading) return <AuthLoadingState />;
    if (role) return <Navigate to="/admin/organisations" replace />;
    return <NoOrganizationPage />;
  }
  return <Outlet />;
}
