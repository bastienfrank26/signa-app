import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdminMoreSheet from './AdminMoreSheet';

const TABS = [
  { label: 'Organisations', to: '/admin/organisations', icon: '⌂' },
  { label: 'Audit', to: '/admin/audit', icon: '≡' },
  { label: 'Indicateurs', to: '/admin/indicateurs', icon: '◐' },
];

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
    textDecoration: 'none',
    color: active ? 'var(--sg-navy-900)' : '#9AA6B2',
  };
}

/** Barre d'onglets mobile de l'admin — même patron que MobileNav.tsx (shell client). */
export default function AdminMobileNav() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        className="sg-mobile-only"
        aria-label="Navigation administration"
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
        {TABS.map((tab) => (
          <Link key={tab.to} to={tab.to} style={tabStyle(location.pathname.startsWith(tab.to))}>
            <span aria-hidden style={{ fontSize: 16 }}>
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        ))}
        <button onClick={() => setMoreOpen(true)} style={tabStyle(false)}>
          <span aria-hidden style={{ fontSize: 16 }}>
            ⋯
          </span>
          Plus
        </button>
      </nav>
      {moreOpen && <AdminMoreSheet onClose={() => setMoreOpen(false)} />}
    </>
  );
}
