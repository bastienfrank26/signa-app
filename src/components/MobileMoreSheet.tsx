import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initials, useAppActions, useAppState } from '../AppContext';
import { useAuth } from '@signa/sdk';
import { ALL_NAV_ITEMS, MOBILE_PRIMARY_SCREENS } from '../navigation';
import Button from './ui/Button';
import type { Screen } from '../types';

const roleLabels: Record<string, string> = {
  owner: 'Propriétaire',
  admin: 'Administrateur',
  member: 'Employé',
  readonly: 'Lecture seule',
};

/**
 * Feuille mobile « Plus » : sections secondaires de navigation + compte + déconnexion.
 * Complète la barre d'onglets (MobileNav) sans dupliquer les écrans.
 */
export default function MobileMoreSheet({ onClose }: { onClose: () => void }) {
  const { screen, prospects, stages, tasks } = useAppState();
  const { setScreen } = useAppActions();
  const { session, signOut } = useAuth();
  const membership = session?.memberships[0];
  const secondaryItems = ALL_NAV_ITEMS.filter((i) => !MOBILE_PRIMARY_SCREENS.includes(i.screen));

  const newStage = [...stages].sort((a, b) => a.position - b.position)[0];
  const newCount = newStage ? prospects.filter((p) => p.stageId === newStage.id).length : 0;
  const tasksLeft = tasks.filter((t) => !t.done).length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function go(s: Screen) {
    setScreen(s);
    onClose();
  }

  return (
    <div
      className="sg-mobile-only"
      role="dialog"
      aria-modal="true"
      aria-label="Plus d'options"
      style={{ position: 'fixed', inset: 0, zIndex: 30 }}
    >
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,27,45,.45)' }}
      />
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
            gap: 10,
            padding: 12,
            borderRadius: 12,
            background: '#fff',
            border: '1px solid var(--sg-border)',
            marginBottom: 14,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--sg-navy-900)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {session ? initials(session.email) : '—'}
          </span>
          <div style={{ minWidth: 0, lineHeight: 1.25 }}>
            <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session?.email ?? '—'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--sg-text-muted)' }}>
              {membership ? `${membership.organizationName} · ${roleLabels[membership.role] ?? membership.role}` : ''}
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 14 }}>
          {secondaryItems.map((item) => (
            <button
              key={item.screen}
              onClick={() => go(item.screen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 44,
                padding: '10px 12px',
                borderRadius: 10,
                border: 'none',
                textAlign: 'left',
                fontSize: 14,
                fontWeight: screen === item.screen ? 700 : 600,
                background: screen === item.screen ? '#fff' : 'transparent',
                color: 'var(--sg-navy-900)',
                cursor: 'pointer',
              }}
            >
              <span>{item.label}</span>
              {item.badgeKey === 'newProspects' && newCount > 0 && <Badge n={newCount} />}
              {item.badgeKey === 'tasksLeft' && tasksLeft > 0 && <Badge n={tasksLeft} />}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/parametres/securite" onClick={onClose} style={{ minHeight: 44, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 14, fontWeight: 600, color: 'var(--sg-navy-900)' }}>
            Sécurité
          </Link>
          <Button variant="ghost" onClick={() => void signOut()} style={{ justifyContent: 'flex-start' }}>
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span
      style={{
        minWidth: 20,
        height: 20,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        background: 'var(--sg-accent)',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        padding: '0 6px',
      }}
    >
      {n}
    </span>
  );
}
