import { Link } from 'react-router-dom';
import { useModules } from './useModules';
import type { SignaModule } from '../domain/module';

const internalRouteBySlug: Record<string, string> = {
  crm: '/crm',
};

function ModuleTile({ module: m }: { module: SignaModule }) {
  const internalRoute = internalRouteBySlug[m.slug];
  const clickable = m.included && (internalRoute || m.appUrl);

  const card = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 16,
        borderRadius: 14,
        border: '1px solid var(--sg-border)',
        background: '#fff',
        opacity: m.included ? 1 : 0.6,
        height: '100%',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</div>
      {m.description && <div style={{ fontSize: 12.5, color: 'var(--sg-slate-400)' }}>{m.description}</div>}
      <div style={{ marginTop: 'auto', fontSize: 11.5, fontWeight: 700, color: m.included ? 'var(--sg-accent)' : 'var(--sg-slate-400)' }}>
        {m.included ? 'Actif' : 'Non inclus'}
      </div>
    </div>
  );

  if (clickable && internalRoute) {
    return (
      <Link to={internalRoute} style={{ textDecoration: 'none', color: 'inherit' }}>
        {card}
      </Link>
    );
  }
  if (clickable && m.appUrl) {
    return (
      <a href={m.appUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
        {card}
      </a>
    );
  }
  return card;
}

export default function AppLauncher() {
  const { modules, loading, error } = useModules();

  if (loading) return <div style={{ padding: 20, fontSize: 13, color: 'var(--sg-slate-400)' }}>Chargement des applications…</div>;
  if (error) return <div style={{ padding: 20, fontSize: 13, color: 'var(--sg-danger)' }}>{error}</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, padding: 20 }}>
      {modules.map((m) => (
        <ModuleTile key={m.id} module={m} />
      ))}
    </div>
  );
}
