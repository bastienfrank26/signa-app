import { Outlet } from 'react-router-dom';
import { useStaffRole } from './useStaffRole';

export default function RequireStaff() {
  const { role, loading } = useStaffRole();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sg-slate-400)', fontSize: 14 }}>
        Validation de votre accès…
      </div>
    );
  }

  if (!role) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Accès refusé</div>
        <p style={{ fontSize: 13.5, color: 'var(--sg-text-muted)' }}>Cette section est réservée au personnel Signa.</p>
        <a href="/" style={{ fontSize: 13.5 }}>Retour à l'application</a>
      </div>
    );
  }

  return <Outlet />;
}
