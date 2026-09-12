import { useState } from 'react';
import { useAuth } from '../features/auth/presentation/useAuth';
import { useProjectBundle } from '../features/portal/presentation/useProjectBundle';

const categoryLabels: Record<string, string> = {
  logo: 'Logo',
  photo: 'Photo',
  text: 'Texte',
  other: 'Autre',
};

function formatSize(bytes: number | null): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function FilesScreen() {
  const { session } = useAuth();
  const organizationId = session?.memberships[0]?.organizationId ?? null;
  const { bundle, loading, error, reload, repository } = useProjectBundle(organizationId);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !organizationId || !bundle) return;
    setUploading(true);
    setActionError(null);
    try {
      await repository.uploadFile(organizationId, bundle.project.id, file);
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Le téléversement a échoué.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDownload(fileId: string, storagePath: string) {
    setDownloadingId(fileId);
    setActionError(null);
    try {
      const url = await repository.getFileUrl(storagePath);
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Le téléchargement a échoué.');
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 2px', fontSize: 30, fontWeight: 800, letterSpacing: '-.03em' }}>Fichiers</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#5D6B7B' }}>Documents partagés avec Signa pour votre projet web.</p>
        </div>
        <label style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
          {uploading ? 'Envoi…' : '+ Téléverser un fichier'}
          <input type="file" onChange={(e) => void handleFileChange(e)} disabled={uploading} style={{ display: 'none' }} />
        </label>
      </div>

      {loading && <div style={{ color: 'var(--sg-text-muted)' }}>Chargement…</div>}
      {error && <div style={{ color: 'var(--sg-danger)' }}>{error}</div>}
      {actionError && <div style={{ color: 'var(--sg-danger)', marginBottom: 12 }}>{actionError}</div>}
      {!loading && !error && !bundle && <div style={{ color: 'var(--sg-text-muted)' }}>Aucun projet web trouvé pour votre organisation.</div>}

      {bundle && (
        <div style={{ borderRadius: 14, background: '#fff', border: '1px solid var(--sg-border)' }}>
          {bundle.files.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Aucun fichier envoyé</div>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: '#7A8899' }}>Téléversez un logo, une photo ou un texte pour votre projet.</p>
            </div>
          ) : (
            bundle.files.map((f) => (
              <div
                key={f.id}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: '1px solid #F1EDE5' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.fileName}</div>
                  <div style={{ fontSize: 12, color: '#7A8899' }}>
                    {categoryLabels[f.category] ?? f.category} · {formatSize(f.sizeBytes)} · {new Date(f.createdAt).toLocaleDateString('fr-CA')}
                  </div>
                </div>
                <button
                  onClick={() => void handleDownload(f.id, f.storagePath)}
                  disabled={downloadingId === f.id}
                  style={{ minHeight: 40, padding: '0 16px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13, fontWeight: 700, cursor: downloadingId === f.id ? 'not-allowed' : 'pointer', flex: 'none' }}
                >
                  {downloadingId === f.id ? 'Ouverture…' : 'Télécharger'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
