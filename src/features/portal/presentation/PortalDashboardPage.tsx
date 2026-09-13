import { Link } from 'react-router-dom';
import ProjectDashboardPage from './ProjectDashboardPage';
import { useModules } from '../../launcher/presentation/useModules';

export default function PortalDashboardPage() {
  const { modules, loading } = useModules();
  const included = modules.filter((m) => m.included);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {!loading && (
        <section
          style={{
            maxWidth: 900,
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 16,
            background: '#fff',
            border: '1px solid var(--sg-border)',
            padding: '16px 22px',
          }}
        >
          <div style={{ fontSize: 13.5 }}>
            <strong>{included.length}</strong> application{included.length > 1 ? 's' : ''} active{included.length > 1 ? 's' : ''}
          </div>
          <Link to="/applications" style={{ fontSize: 13, fontWeight: 700, color: 'var(--sg-accent)', textDecoration: 'none' }}>
            Voir toutes les applications →
          </Link>
        </section>
      )}
      <ProjectDashboardPage />
    </div>
  );
}
