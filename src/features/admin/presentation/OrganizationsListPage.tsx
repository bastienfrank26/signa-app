import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminRepository } from './useStaffRole';
import type { OrganizationSummary } from '../domain/admin';
import { projectStatusLabels } from '../../portal/domain/project';

export default function OrganizationsListPage() {
  const [orgs, setOrgs] = useState<OrganizationSummary[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void adminRepository
      .listOrganizations()
      .then(setOrgs)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orgs.filter((o) => o.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <AdminLayout>
      <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>Organisations</h1>
      <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'var(--sg-text-muted)' }}>{orgs.length} organisation(s)</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher par nom…"
        style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', fontSize: 13.5, width: '100%', maxWidth: 340 }}
      />

      {loading && <div style={{ color: 'var(--sg-text-muted)' }}>Chargement…</div>}
      {error && <div style={{ color: 'var(--sg-danger)' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ borderRadius: 14, background: '#fff', border: '1px solid var(--sg-border)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: '12px 18px', background: '#FAF8F4', fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', color: '#7A8899' }}>
            <div>ORGANISATION</div>
            <div>STATUT</div>
            <div>MEMBRES</div>
            <div>PROJET</div>
          </div>
          {filtered.map((o) => (
            <Link
              key={o.id}
              to={`/admin/organisations/${o.id}`}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: '13px 18px', borderTop: '1px solid #F1EDE5', fontSize: 13.5, color: 'var(--sg-navy-900)', textDecoration: 'none' }}
            >
              <div style={{ fontWeight: 700 }}>{o.name}</div>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, color: o.status === 'active' ? '#1F7A5C' : '#C0392B', background: o.status === 'active' ? '#1F7A5C1A' : '#C0392B1A' }}>
                  {o.status === 'active' ? 'Active' : 'Suspendue'}
                </span>
              </div>
              <div>{o.memberCount}</div>
              <div style={{ color: '#5D6B7B' }}>{o.projectStatus ? projectStatusLabels[o.projectStatus as keyof typeof projectStatusLabels] ?? o.projectStatus : '—'}</div>
            </Link>
          ))}
          {filtered.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--sg-text-muted)' }}>Aucune organisation trouvée.</div>}
        </div>
      )}
    </AdminLayout>
  );
}
