import { initials, useAppActions, useAppState } from '../AppContext';
import { useAuth } from '../features/auth/presentation/useAuth';
import { navStyle } from '../ui';
import { NAV_SECTIONS } from '../navigation';
import type { Screen } from '../types';

const roleLabels: Record<string, string> = {
  owner: 'Propriétaire',
  admin: 'Administrateur',
  member: 'Employé',
  readonly: 'Lecture seule',
};

const badgeStyle = {
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
} as const;

function NavButton({ label, screen, badge }: { label: string; screen: Screen; badge?: number }) {
  const { screen: current } = useAppState();
  const { setScreen } = useAppActions();
  const active = current === screen;
  return (
    <button onClick={() => setScreen(screen)} style={navStyle(active)}>
      <span>{label}</span>
      {badge != null && <span style={badgeStyle}>{badge}</span>}
    </button>
  );
}

export default function Sidebar() {
  const { prospects, stages, tasks } = useAppState();
  const { session } = useAuth();
  const membership = session?.memberships[0];
  const newStage = [...stages].sort((a, b) => a.position - b.position)[0];
  const newCount = newStage ? prospects.filter((p) => p.stageId === newStage.id).length : 0;
  const tasksLeft = tasks.filter((t) => !t.done).length;

  return (
    <aside
      className="sg-desktop-only"
      style={{
        width: 248,
        flex: 'none',
        background: 'var(--sg-side-bg)',
        color: 'var(--sg-side-fg)',
        padding: '22px 14px',
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

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div
              style={{
                padding: '0 8px 6px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.09em',
                color: 'var(--sg-side-muted)',
              }}
            >
              {section.label}
            </div>
            {section.items.map((item) => (
              <NavButton
                key={item.screen}
                label={item.label}
                screen={item.screen}
                badge={item.badgeKey === 'newProspects' ? newCount || undefined : item.badgeKey === 'tasksLeft' ? tasksLeft || undefined : undefined}
              />
            ))}
          </div>
        ))}
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
        <div style={{ padding: 12, borderRadius: 12, border: '1px solid #24384f', lineHeight: 1.35 }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Besoin d'aide ?</div>
          <div style={{ fontSize: 11, color: 'var(--sg-side-muted)' }}>Discutez avec notre équipe</div>
        </div>
      </div>
    </aside>
  );
}
