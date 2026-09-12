import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/presentation/useAuth';
import { useProjectBundle } from './useProjectBundle';
import { projectStatusLabels, revisionStatusLabels, type RevisionPriority } from '../domain/project';
import { fieldStyle, labelStyle, primaryButtonStyle } from '../../auth/presentation/formStyles';

const cardStyle = { borderRadius: 16, background: '#fff', border: '1px solid var(--sg-border)', padding: '22px' } as const;

function StepsProgress({ steps }: { steps: { label: string; status: string }[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {steps.map((s, i) => {
        const done = s.status === 'done';
        const active = s.status === 'in_progress';
        return (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div
              style={{
                width: 24,
                height: 24,
                margin: '0 auto 6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
                color: '#fff',
                background: done ? '#1F7A5C' : active ? 'var(--sg-accent)' : '#DCD6CA',
              }}
            >
              {done ? '✓' : ''}
            </div>
            <div style={{ fontSize: 10.5, fontWeight: done || active ? 700 : 500, color: done || active ? '#0F1B2D' : '#9AA6B2' }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function RevisionForm({ onSubmit }: { onSubmit: (pageOrUrl: string, description: string, priority: RevisionPriority) => Promise<void> }) {
  const [pageOrUrl, setPageOrUrl] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<RevisionPriority>('normal');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(pageOrUrl, description.trim(), priority);
      setPageOrUrl('');
      setDescription('');
      setPriority('normal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={labelStyle}>
        Page ou URL concernée (optionnel)
        <input value={pageOrUrl} onChange={(e) => setPageOrUrl(e.target.value)} placeholder="/accueil" style={fieldStyle} />
      </label>
      <label style={labelStyle}>
        Description
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex. Le logo est trop petit dans l'en-tête."
          style={{ ...fieldStyle, minHeight: 74, resize: 'vertical' }}
        />
      </label>
      <label style={labelStyle}>
        Priorité
        <select value={priority} onChange={(e) => setPriority(e.target.value as RevisionPriority)} style={fieldStyle}>
          <option value="low">Basse</option>
          <option value="normal">Normale</option>
          <option value="high">Haute</option>
        </select>
      </label>
      {error && <div style={{ fontSize: 12.5, color: 'var(--sg-danger)', fontWeight: 600 }}>{error}</div>}
      <button type="submit" disabled={submitting || !description.trim()} style={{ ...primaryButtonStyle, alignSelf: 'flex-start' }}>
        {submitting ? 'Envoi…' : 'Envoyer la demande'}
      </button>
    </form>
  );
}

export default function ProjectDashboardPage() {
  const { session } = useAuth();
  const organizationId = session?.memberships[0]?.organizationId ?? null;
  const isAdmin = session?.memberships[0]?.role === 'owner' || session?.memberships[0]?.role === 'admin';
  const { bundle, loading, error, reload, repository } = useProjectBundle(organizationId);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (loading) return <div style={{ padding: 24, color: 'var(--sg-text-muted)' }}>Chargement du projet…</div>;
  if (error) return <div style={{ padding: 24, color: 'var(--sg-danger)' }}>{error}</div>;
  if (!bundle) return <div style={{ padding: 24, color: 'var(--sg-text-muted)' }}>Aucun projet web trouvé pour votre organisation.</div>;

  const { project, steps, files, revisions, approvals } = bundle;

  async function handleApprove() {
    if (!organizationId) return;
    setApproving(true);
    setApproveError(null);
    try {
      await repository.approveVersion(project.id, 'v1', 'J’approuve cette version pour mise en ligne.');
      await reload();
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : 'Approbation impossible.');
    } finally {
      setApproving(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !organizationId) return;
    setUploading(true);
    try {
      await repository.uploadFile(organizationId, project.id, file);
      await reload();
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ margin: '0 0 4px', fontSize: 30, fontWeight: 800, letterSpacing: '-.03em' }}>Suivi du projet web</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#5D6B7B' }}>Statut actuel : {projectStatusLabels[project.status]}</p>
      </div>

      <section style={cardStyle}>
        <h3 style={{ margin: '0 0 18px', fontSize: 17, fontWeight: 800 }}>Progression</h3>
        <StepsProgress steps={steps.map((s) => ({ label: s.label, status: s.status }))} />
      </section>

      {project.status === 'private_review' && (
        <section style={{ ...cardStyle, background: '#0F1B2D', color: '#F5F2EC', border: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'var(--sg-accent)' }}>VERSION PRIVÉE PRÊTE</div>
          <p style={{ margin: '8px 0 16px', fontSize: 14, color: '#B9C4CF' }}>
            {project.privatePreviewUrl ? (
              <>
                Consultez votre site à <a href={project.privatePreviewUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--sg-accent)' }}>{project.privatePreviewUrl}</a>.{' '}
              </>
            ) : null}
            Approuvez la version pour débloquer la mise en ligne, ou envoyez une demande de correction ci-dessous.
          </p>
          {isAdmin ? (
            <>
              <button onClick={() => void handleApprove()} disabled={approving} style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {approving ? 'Approbation…' : 'Approuver la version'}
              </button>
              {approveError && <div style={{ marginTop: 10, fontSize: 12.5, color: '#F3B4A6' }}>{approveError}</div>}
            </>
          ) : (
            <div style={{ fontSize: 12.5, color: '#8899AA' }}>Seul un propriétaire ou administrateur peut approuver.</div>
          )}
        </section>
      )}

      {project.status === 'approved' && (
        <section style={{ ...cardStyle, borderColor: '#1F7A5C', background: '#1F7A5C0F' }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1F7A5C' }}>Version approuvée — mise en ligne planifiée.</div>
        </section>
      )}

      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Fichiers</h3>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--sg-accent)', cursor: 'pointer' }}>
            {uploading ? 'Envoi…' : '+ Téléverser un fichier'}
            <input type="file" onChange={(e) => void handleFileChange(e)} disabled={uploading} style={{ display: 'none' }} />
          </label>
        </div>
        {files.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--sg-text-muted)' }}>Aucun fichier envoyé pour l'instant.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {files.map((f) => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1EDE5', fontSize: 13.5 }}>
                <span>{f.fileName}</span>
                <span style={{ color: 'var(--sg-text-muted)', fontSize: 12 }}>{new Date(f.createdAt).toLocaleDateString('fr-CA')}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={cardStyle}>
        <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800 }}>Demander une correction</h3>
        <RevisionForm
          onSubmit={async (pageOrUrl, description, priority) => {
            await repository.submitRevisionRequest(project.id, { pageOrUrl, description, priority });
            await reload();
          }}
        />
      </section>

      <section style={cardStyle}>
        <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800 }}>Historique des corrections</h3>
        {revisions.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--sg-text-muted)' }}>Aucune demande envoyée.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {revisions.map((r) => (
              <div key={r.id} style={{ borderBottom: '1px solid #F1EDE5', paddingBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700 }}>{r.pageOrUrl || 'Page non précisée'}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--sg-text-muted)' }}>{revisionStatusLabels[r.status]}</span>
                </div>
                <div style={{ fontSize: 13, color: '#5D6B7B' }}>{r.description}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {approvals.length > 0 && (
        <section style={cardStyle}>
          <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800 }}>Approbations</h3>
          {approvals.map((a) => (
            <div key={a.id} style={{ fontSize: 13.5 }}>
              Version {a.versionLabel} approuvée le {new Date(a.createdAt).toLocaleString('fr-CA')}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
