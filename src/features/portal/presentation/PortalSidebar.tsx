import { NavLink } from 'react-router-dom';
import { initials } from '../../../AppContext';
import { useAuth } from '../../auth/presentation/useAuth';

const roleLabels: Record<string, string> = {
  owner: 'Propriétaire',
  admin: 'Administrateur',
  member: 'Employé',
  readonly: 'Lecture seule',
};

function navLinkStyle(isActive: boolean) {
  return {
    display: 'block',
    padding: '9px 12px',
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: 600,
    textDecoration: 'none',
    color: isActive ? '#fff' : 'var(--sg-side-fg)',
    background: isActive ? 'var(--sg-side-active)' : 'transparent',
  } as const;
}

export default function PortalSidebar() {
  const { session } = useAuth();
  const membership = session?.memberships[0];

  return (
    <aside
      className="sg-desktop-only"
      style={{
        width: 248,
        flex: 'none',
        background: 'var(--sg-side-bg)',
        color: 'var(--sg-side-fg)',
        padding: '22px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 26,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            borderRadius: 9,
            background: 'var(--sg-accent)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          S
        </span>
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>Signa</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <NavLink to="/" end style={({ isActive }) => navLinkStyle(isActive)}>
          Tableau de bord
        </NavLink>
        <NavLink to="/applications" style={({ isActive }) => navLinkStyle(isActive)}>
          Applications
        </NavLink>
        <NavLink to="/parametres/securite" style={({ isActive }) => navLinkStyle(isActive)}>
          Compte et sécurité
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 12,
            borderRadius: 12,
            background: 'var(--sg-side-active)',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'var(--sg-accent)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {membership ? initials(membership.organizationName) : '—'}
          </span>
          <div style={{ lineHeight: 1.25, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {membership?.organizationName ?? '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--sg-side-muted)' }}>{membership ? roleLabels[membership.role] ?? membership.role : ''}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
