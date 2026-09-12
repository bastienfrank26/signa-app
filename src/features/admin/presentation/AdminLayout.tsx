import type { PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/presentation/useAuth';
import { useStaffRole } from './useStaffRole';

const navItemStyle = (active: boolean) =>
  ({
    padding: '9px 14px',
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: 700,
    color: active ? '#fff' : 'var(--sg-side-muted)',
    background: active ? 'var(--sg-side-active)' : 'transparent',
    textDecoration: 'none',
  }) as const;

export default function AdminLayout({ children }: PropsWithChildren) {
  const { signOut } = useAuth();
  const { role } = useStaffRole();
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sg-cream-50)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '12px 24px',
          background: 'var(--sg-navy-900)',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 15 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'var(--sg-accent)',
              fontSize: 12,
            }}
          >
            S
          </span>
          Administration Signa
        </div>
        <nav style={{ display: 'flex', gap: 6 }}>
          <Link to="/admin/organisations" style={navItemStyle(location.pathname.startsWith('/admin/organisations'))}>
            Organisations
          </Link>
          <Link to="/admin/audit" style={navItemStyle(location.pathname.startsWith('/admin/audit'))}>
            Journal d'audit
          </Link>
          <Link to="/admin/indicateurs" style={navItemStyle(location.pathname.startsWith('/admin/indicateurs'))}>
            Indicateurs
          </Link>
        </nav>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, fontSize: 12.5, color: 'var(--sg-side-muted)' }}>
          <span>Rôle : {role}</span>
          <Link to="/" style={{ color: 'var(--sg-side-muted)' }}>
            Espace client
          </Link>
          <button
            onClick={() => void signOut()}
            style={{ padding: 0, border: 'none', background: 'none', color: 'var(--sg-side-muted)', fontSize: 12.5, cursor: 'pointer' }}
          >
            Déconnexion
          </button>
        </div>
      </header>
      <main style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>{children}</main>
    </div>
  );
}
