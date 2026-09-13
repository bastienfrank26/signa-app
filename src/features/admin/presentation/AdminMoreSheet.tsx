import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/presentation/useAuth';
import { useStaffRole } from './useStaffRole';

/** Feuille mobile « Plus » de l'admin — même patron que MobileMoreSheet.tsx (shell client). */
export default function AdminMoreSheet({ onClose }: { onClose: () => void }) {
  const { session, signOut } = useAuth();
  const { role } = useStaffRole();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sg-mobile-only" role="dialog" aria-modal="true" aria-label="Plus d'options" style={{ position: 'fixed', inset: 0, zIndex: 30 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,27,45,.45)' }} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '80vh',
          overflowY: 'auto',
          background: 'var(--sg-cream-50)',
          borderRadius: '20px 20px 0 0',
          padding: '10px 18px calc(20px + var(--sg-safe-bottom))',
          animation: 'sgIn .18s ease-out',
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--sg-border-strong)', margin: '6px auto 14px' }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            borderRadius: 12,
            background: '#fff',
            border: '1px solid var(--sg-border)',
            marginBottom: 14,
          }}
        >
          <div style={{ minWidth: 0, lineHeight: 1.25 }}>
            <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session?.email ?? '—'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--sg-text-muted)' }}>Rôle : {role}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link
            to="/"
            onClick={onClose}
            style={{ minHeight: 44, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 14, fontWeight: 600, color: 'var(--sg-navy-900)' }}
          >
            Espace client
          </Link>
          <button
            onClick={() => void signOut()}
            style={{ minHeight: 44, padding: '0 12px', borderRadius: 10, border: 'none', background: 'none', textAlign: 'left', fontSize: 14, fontWeight: 600, color: 'var(--sg-slate-400)', cursor: 'pointer' }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
