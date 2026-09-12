import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import ReasonDialog from './ReasonDialog';
import SitesSection from './SitesSection';
import { adminRepository } from './useStaffRole';
import type { OrganizationDetail } from '../domain/admin';
import { projectStatuses, projectStatusLabels } from '../../portal/domain/project';

const cardStyle = { borderRadius: 14, background: '#fff', border: '1px solid var(--sg-border)', padding: 20 } as const;

export default function OrganizationDetailPage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [detail, setDetail] = useState<OrganizationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | { kind: 'suspend' | 'reactivate' }>(null);
  const [statusDraft, setStatusDraft] = useState<string>('');
  const [statusReasonOpen, setStatusReasonOpen] = useState(false);

  async function reload() {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const next = await adminRepository.getOrganizationDetail(organizationId);
      setDetail(next);
      setStatusDraft(next?.project?.status ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  if (loading) return <AdminLayout><div style={{ color: 'var(--sg-text-muted)' }}>Chargement…</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ color: 'var(--sg-danger)' }}>{error}</div></AdminLayout>;
  if (!detail) return <AdminLayout><div style={{ color: 'var(--sg-text-muted)' }}>Organisation introuvable.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>{detail.name}</h1>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 999, color: detail.status === 'active' ? '#1F7A5C' : '#C0392B', background: detail.status === 'active' ? '#1F7A5C1A' : '#C0392B1A' }}>
            {detail.status === 'active' ? 'Active' : 'Suspendue'}
          </span>
        </div>
        {detail.status === 'active' ? (
          <button onClick={() => setDialog({ kind: 'suspend' })} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #E7D3CF', background: '#fff', color: '#C0392B', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
            Suspendre le compte
          </button>
        ) : (
          <button onClick={() => setDialog({ kind: 'reactivate' })} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#1F7A5C', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
            Rétablir le compte
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section style={cardStyle}>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800 }}>Membres</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {detail.memberships.map((m) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid #F1EDE5', fontSize: 13.5 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{m.email}</div>
                  <div style={{ fontSize: 12, color: 'var(--sg-text-muted)' }}>{m.role} · {m.status}</div>
                </div>
              </div>
            ))}
            {detail.memberships.length === 0 && <div style={{ color: 'var(--sg-text-muted)', fontSize: 13 }}>Aucun membre.</div>}
          </div>
        </section>

        {detail.project && (
          <section style={cardStyle}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800 }}>Projet web</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)} style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', fontSize: 13.5 }}>
                {projectStatuses.map((s) => (
                  <option key={s} value={s}>
                    {projectStatusLabels[s]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setStatusReasonOpen(true)}
                disabled={statusDraft === detail.project?.status}
                style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#0F1B2D', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Changer le statut
              </button>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Étapes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {detail.steps.map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5 }}>
                  <span>{s.label}</span>
                  <select
                    value={s.status}
                    onChange={(e) => {
                      void adminRepository.setStepStatus(s.id, e.target.value).then(reload);
                    }}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--sg-border-strong)', fontSize: 12.5 }}
                  >
                    <option value="pending">À faire</option>
                    <option value="in_progress">En cours</option>
                    <option value="done">Terminée</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        )}

        <SitesSection organizationId={detail.id} />
      </div>

      {dialog?.kind === 'suspend' && (
        <ReasonDialog
          title="Suspendre le compte"
          confirmLabel="Suspendre"
          onCancel={() => setDialog(null)}
          onConfirm={async (reason) => {
            await adminRepository.setOrganizationStatus(detail.id, 'suspended', reason);
            setDialog(null);
            await reload();
          }}
        />
      )}
      {dialog?.kind === 'reactivate' && (
        <ReasonDialog
          title="Rétablir le compte"
          confirmLabel="Rétablir"
          onCancel={() => setDialog(null)}
          onConfirm={async (reason) => {
            await adminRepository.setOrganizationStatus(detail.id, 'active', reason);
            setDialog(null);
            await reload();
          }}
        />
      )}
      {statusReasonOpen && detail.project && (
        <ReasonDialog
          title="Changer le statut du projet"
          confirmLabel="Confirmer"
          onCancel={() => setStatusReasonOpen(false)}
          onConfirm={async (reason) => {
            await adminRepository.setProjectStatus(detail.project!.id, statusDraft, reason);
            setStatusReasonOpen(false);
            await reload();
          }}
        />
      )}
    </AdminLayout>
  );
}
