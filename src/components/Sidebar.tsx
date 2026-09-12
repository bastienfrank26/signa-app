import { useAppActions, useAppState } from '../AppContext';
import { navStyle } from '../ui';
import type { Screen } from '../types';

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
  return (
    <aside
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

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div
            style={{
              padding: '0 8px 6px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.09em',
              color: 'var(--sg-side-muted)',
            }}
          >
            MON SITE
          </div>
          <NavButton label="Accueil" screen="accueil" />
          <NavButton label="Suivi du projet" screen="projet" badge={2} />
          <NavButton label="Fichiers" screen="fichiers" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div
            style={{
              padding: '0 8px 6px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.09em',
              color: 'var(--sg-side-muted)',
            }}
          >
            CRM
          </div>
          <NavButton label="Prospects" screen="prospects" badge={3} />
          <NavButton label="Pipeline" screen="pipeline" />
          <NavButton label="Contacts" screen="contacts" />
          <NavButton label="Tâches" screen="taches" badge={2} />
        </div>
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
            E
          </span>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Entreprise ABC</div>
            <div style={{ fontSize: 11, color: 'var(--sg-side-muted)' }}>Forfait Entreprise</div>
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
