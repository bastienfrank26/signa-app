import { Outlet } from 'react-router-dom';
import { useAuth } from './features/auth/presentation/useAuth';
import CreateOrganizationPage from './features/organizations/presentation/CreateOrganizationPage';

export default function RequireOrganization() {
  const { session } = useAuth();
  if (session && session.memberships.length === 0) {
    return <CreateOrganizationPage />;
  }
  return <Outlet />;
}
