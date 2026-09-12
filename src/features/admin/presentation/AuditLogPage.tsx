import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { adminRepository } from './useStaffRole';
import type { AuditEvent } from '../domain/admin';

export default function AuditLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void adminRepository
      .listAuditEvents()
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>Journal d'audit</h1>
      <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'var(--sg-text-muted)' }}>{events.length} événement(s) récents</p>

      {loading && <div style={{ color: 'var(--sg-text-muted)' }}>Chargement…</div>}
      {error && <div style={{ color: 'var(--sg-danger)' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.map((e) => (
            <div key={e.id} style={{ borderRadius: 12, background: '#fff', border: '1px solid var(--sg-border)', padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5 }}>
                <span style={{ fontWeight: 700 }}>{e.action}</span>
                <span style={{ color: 'var(--sg-text-muted)', fontSize: 12 }}>{new Date(e.createdAt).toLocaleString('fr-CA')}</span>
              </div>
              <div style={{ fontSize: 12.5, color: '#5D6B7B', marginTop: 2 }}>
                {e.targetType} · {e.targetId}
              </div>
              {e.reason && <div style={{ fontSize: 13, marginTop: 6 }}>{e.reason}</div>}
            </div>
          ))}
          {events.length === 0 && <div style={{ color: 'var(--sg-text-muted)' }}>Aucun événement.</div>}
        </div>
      )}
    </AdminLayout>
  );
}
