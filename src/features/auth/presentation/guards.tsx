import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function AuthLoadingState() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sg-slate-400)', fontSize: 14 }}>
      Validation de votre accès…
    </div>
  );
}

export function RequireAuth() {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoadingState />;
  if (!session) {
    return <Navigate to="/connexion" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return <Outlet />;
}

export function RequireNoAuth() {
  const { session, loading } = useAuth();
  if (loading) return <AuthLoadingState />;
  if (session) return <Navigate to="/" replace />;
  return <Outlet />;
}
