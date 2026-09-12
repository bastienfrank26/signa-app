import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { adminRepository } from './useStaffRole';
import type { PilotMetrics } from '../domain/admin';

const cardStyle = { borderRadius: 14, background: '#fff', border: '1px solid var(--sg-border)', padding: '18px 20px' } as const;

function StatCard({ label, value, warn }: { label: string; value: number | string; warn?: boolean }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, color: 'var(--sg-text-muted)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em', color: warn ? '#C0392B' : undefined }}>{value}</div>
    </div>
  );
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data);
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{title}</div>
      {entries.length === 0 ? (
        <div style={{ fontSize: 12.5, color: 'var(--sg-text-muted)' }}>Aucune donnée.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {entries.map(([key, count]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span>{key}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PilotMetricsPage() {
  const [metrics, setMetrics] = useState<PilotMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void adminRepository
      .getPilotMetrics()
      .then(setMetrics)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>Indicateurs</h1>
      <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'var(--sg-text-muted)' }}>
        Suivi du pilote (doc 13-ROADMAP.md). Ne remplace pas le contact humain avec les entreprises pilotes.
      </p>

      {loading && <div style={{ color: 'var(--sg-text-muted)' }}>Chargement…</div>}
      {error && <div style={{ color: 'var(--sg-danger)' }}>{error}</div>}

      {metrics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
            <StatCard label="Organisations" value={metrics.organizationsTotal} />
            <StatCard label="Actives" value={metrics.organizationsActive} />
            <StatCard label="Suspendues" value={metrics.organizationsSuspended} warn={metrics.organizationsSuspended > 0} />
            <StatCard label="Organisations actives (7 derniers jours)" value={metrics.orgsWithActivityLast7d} />
            <StatCard label="Soumissions de site (30 jours)" value={metrics.submissionsLast30d} />
            <StatCard label="Suivis en retard" value={metrics.overdueFollowUps} warn={metrics.overdueFollowUps > 0} />
            <StatCard label="Sites actifs" value={metrics.sitesActive} />
            <StatCard label="Actions admin (7 derniers jours)" value={metrics.auditEventsLast7d} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
            <BreakdownCard title="Projets par statut" data={metrics.projectsByStatus} />
            <BreakdownCard title="Abonnements par statut" data={metrics.subscriptionsByStatus} />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
