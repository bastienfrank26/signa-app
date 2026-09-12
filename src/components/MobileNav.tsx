import { useState } from 'react';
import { useAppActions, useAppState } from '../AppContext';
import { MOBILE_PRIMARY_SCREENS, NAV_SECTIONS } from '../navigation';
import MobileMoreSheet from './MobileMoreSheet';
import type { Screen } from '../types';

const ICONS: Partial<Record<Screen, string>> = {
  accueil: '⌂',
  prospects: '◐',
  pipeline: '≡',
};

function tabStyle(active: boolean) {
  return {
    flex: 1,
    minHeight: 44,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    border: 'none',
    background: 'none',
    fontSize: 10.5,
    fontWeight: 700,
    cursor: 'pointer',
    color: active ? 'var(--sg-navy-900)' : '#9AA6B2',
  };
}

/**
 * Navigation mobile réelle (barre d'onglets fixe, pilotée par media query CSS,
 * pas par un état JS de démonstration). Visible seulement sous 768 px via .sg-mobile-only.
 */
export default function MobileNav() {
  const { screen } = useAppState();
  const { setScreen } = useAppActions();
  const [moreOpen, setMoreOpen] = useState(false);
  const allItems = NAV_SECTIONS.flatMap((s) => s.items);
  const primaryItems = MOBILE_PRIMARY_SCREENS.map((s) => allItems.find((i) => i.screen === s)!).filter(Boolean);
  const isOnMoreScreen = !MOBILE_PRIMARY_SCREENS.includes(screen);

  return (
    <>
      <nav
        className="sg-mobile-only"
        aria-label="Navigation principale"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
          display: 'flex',
          background: '#fff',
          borderTop: '1px solid var(--sg-border)',
          paddingBottom: 'var(--sg-safe-bottom)',
          height: 'calc(var(--sg-mobile-nav-height) + var(--sg-safe-bottom))',
        }}
      >
        {primaryItems.map((item) => (
          <button key={item.screen} onClick={() => setScreen(item.screen)} style={tabStyle(screen === item.screen)}>
            <span aria-hidden style={{ fontSize: 16 }}>
              {ICONS[item.screen] ?? '•'}
            </span>
            {item.label}
          </button>
        ))}
        <button onClick={() => setMoreOpen(true)} style={tabStyle(isOnMoreScreen)}>
          <span aria-hidden style={{ fontSize: 16 }}>
            ⋯
          </span>
          Plus
        </button>
      </nav>
      {moreOpen && <MobileMoreSheet onClose={() => setMoreOpen(false)} />}
    </>
  );
}
