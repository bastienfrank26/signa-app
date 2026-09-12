import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/presentation/useAuth';
import { initials } from '../AppContext';

const roleLabels: Record<string, string> = {
  owner: 'Propriétaire',
  admin: 'Administrateur',
  member: 'Employé',
  readonly: 'Lecture seule',
};

export default function Header() {
  const { session, signOut } = useAuth();
  const membership = session?.memberships[0];

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '14px 28px',
        background: '#FFFFFF',
        borderBottom: '1px solid var(--sg-border)',
      }}
    >
      <div
        style={{
          flex: 1,
          maxWidth: 460,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 14px',
          borderRadius: 10,
          background: 'var(--sg-cream-50)',
          border: '1px solid var(--sg-border)',
          color: 'var(--sg-slate-400)',
          fontSize: 13,
        }}
      >
        <span style={{ fontSize: 13 }}>⌕</span> Rechercher un contact, une tâche, un fichier…
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#0F1B2D',
              color: '#F5F2EC',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {session ? initials(session.email) : '—'}
          </span>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{session?.email ?? '—'}</div>
            <div style={{ fontSize: 11, color: '#7A8899' }}>{membership ? roleLabels[membership.role] ?? membership.role : ''}</div>
          </div>
        </div>
        <Link to="/parametres/securite" style={{ fontSize: 12.5, color: 'var(--sg-slate-400)' }}>
          Sécurité
        </Link>
        <button
          onClick={() => void signOut()}
          style={{ padding: 0, border: 'none', background: 'none', fontSize: 12.5, color: 'var(--sg-slate-400)', cursor: 'pointer' }}
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
