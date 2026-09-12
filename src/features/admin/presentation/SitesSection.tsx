import { useEffect, useState, type FormEvent } from 'react';
import { adminRepository } from './useStaffRole';
import ReasonDialog from './ReasonDialog';
import { fieldStyle, labelStyle, primaryButtonStyle } from '../../auth/presentation/formStyles';
import type { Site } from '../domain/admin';

const cardStyle = { borderRadius: 14, background: '#fff', border: '1px solid var(--sg-border)', padding: 20 } as const;
const FUNCTION_URL = 'https://mnadbkbdbjmugvsadeen.supabase.co/functions/v1/site-submissions';

const statusLabels: Record<Site['status'], string> = { active: 'Actif', suspended: 'Suspendu', revoked: 'Révoqué' };
const statusColors: Record<Site['status'], string> = { active: '#1F7A5C', suspended: '#B4740E', revoked: '#C0392B' };

function integrationSnippet(siteId: string, secret: string): string {
  return `fetch("${FUNCTION_URL}/${siteId}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-signa-site-key": "${secret}"
  },
  body: JSON.stringify({
    formKey: "contact-principal",
    idempotencyKey: crypto.randomUUID(),
    contact: { name: "...", email: "...", phone: "..." },
    message: "...",
    consent: { privacy: true }
  })
});`;
}

function NewSecretBox({ siteId, secret, onDone }: { siteId: string; secret: string; onDone: () => void }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  async function runTest() {
    setTesting(true);
    setTestResult(null);
    try {
      await adminRepository.testSiteIntegration(siteId);
      setTestResult('Succès — un prospect de test a été créé dans le CRM de cette organisation.');
    } catch (err) {
      setTestResult(err instanceof Error ? `Échec — ${err.message}` : 'Échec du test.');
    } finally {
      setTesting(false);
    }
  }

  return (
    <div style={{ border: '1px solid #E7D3CF', background: '#FFF7ED', borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Clé secrète — affichée une seule fois</div>
      <code style={{ display: 'block', fontSize: 12.5, wordBreak: 'break-all', background: '#fff', border: '1px solid var(--sg-border)', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
        {secret}
      </code>
      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Extrait d'intégration (à utiliser depuis le site client)</div>
      <pre style={{ fontSize: 11.5, background: '#0F1B2D', color: '#F5F2EC', borderRadius: 8, padding: 12, overflowX: 'auto', marginBottom: 10 }}>
        {integrationSnippet(siteId, secret)}
      </pre>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => void runTest()} disabled={testing} style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#0F1B2D', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {testing ? 'Envoi…' : 'Créer un prospect de test'}
        </button>
        <button onClick={onDone} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          J'ai copié la clé
        </button>
      </div>
      {testResult && <div style={{ marginTop: 10, fontSize: 12.5 }}>{testResult}</div>}
    </div>
  );
}

export default function SitesSection({ organizationId }: { organizationId: string }) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [origins, setOrigins] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [newSecret, setNewSecret] = useState<{ siteId: string; secret: string } | null>(null);
  const [statusDialog, setStatusDialog] = useState<null | { siteId: string; status: Site['status'] }>(null);

  async function reload() {
    setLoading(true);
    try {
      setSites(await adminRepository.listSites(organizationId));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const originsList = origins.split(',').map((o) => o.trim()).filter(Boolean);
      const result = await adminRepository.createSite(organizationId, name.trim(), originsList);
      setNewSecret(result);
      setShowCreate(false);
      setName('');
      setOrigins('');
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La création a échoué.');
    }
  }

  async function handleRotate(siteId: string) {
    const result = await adminRepository.rotateSiteKey(siteId);
    setNewSecret({ siteId, secret: result.secret });
    await reload();
  }

  return (
    <section style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Sites</h3>
        <button
          onClick={() => setShowCreate((v) => !v)}
          style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          + Créer un site
        </button>
      </div>

      {newSecret && <NewSecretBox siteId={newSecret.siteId} secret={newSecret.secret} onDone={() => setNewSecret(null)} />}

      {showCreate && (
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, padding: 14, border: '1px dashed var(--sg-border-strong)', borderRadius: 12 }}>
          <label style={labelStyle}>
            Nom du site
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Site vitrine exemple.ca" style={fieldStyle} />
          </label>
          <label style={labelStyle}>
            Origines autorisées (séparées par des virgules)
            <input value={origins} onChange={(e) => setOrigins(e.target.value)} placeholder="https://exemple.ca, https://www.exemple.ca" style={fieldStyle} />
          </label>
          {error && <div style={{ fontSize: 12.5, color: 'var(--sg-danger)', fontWeight: 600 }}>{error}</div>}
          <button type="submit" style={{ ...primaryButtonStyle, alignSelf: 'flex-start' }}>
            Créer
          </button>
        </form>
      )}

      {loading ? (
        <div style={{ color: 'var(--sg-text-muted)', fontSize: 13 }}>Chargement…</div>
      ) : sites.length === 0 ? (
        <div style={{ color: 'var(--sg-text-muted)', fontSize: 13 }}>Aucun site relié.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sites.map((s) => (
            <div key={s.id} style={{ border: '1px solid var(--sg-border)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--sg-text-muted)' }}>
                    {s.allowedOrigins.join(', ') || 'Aucune origine déclarée'} · clé {s.keyPrefix ?? '—'}…
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, color: statusColors[s.status], background: statusColors[s.status] + '1A' }}>
                    {statusLabels[s.status]}
                  </span>
                  <button onClick={() => void handleRotate(s.id)} style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--sg-border-strong)', background: '#fff', cursor: 'pointer' }}>
                    Faire pivoter la clé
                  </button>
                  {s.status !== 'suspended' && s.status !== 'revoked' && (
                    <button onClick={() => setStatusDialog({ siteId: s.id, status: 'suspended' })} style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, border: '1px solid #E7D3CF', background: '#fff', color: '#C0392B', cursor: 'pointer' }}>
                      Suspendre
                    </button>
                  )}
                  {s.status === 'suspended' && (
                    <button onClick={() => setStatusDialog({ siteId: s.id, status: 'active' })} style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, border: 'none', background: '#1F7A5C', color: '#fff', cursor: 'pointer' }}>
                      Réactiver
                    </button>
                  )}
                  {s.status !== 'revoked' && (
                    <button onClick={() => setStatusDialog({ siteId: s.id, status: 'revoked' })} style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, border: '1px solid #E7D3CF', background: '#fff', color: '#C0392B', cursor: 'pointer' }}>
                      Révoquer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {statusDialog && (
        <ReasonDialog
          title={statusDialog.status === 'active' ? 'Réactiver le site' : statusDialog.status === 'suspended' ? 'Suspendre le site' : 'Révoquer le site'}
          confirmLabel="Confirmer"
          onCancel={() => setStatusDialog(null)}
          onConfirm={async (reason) => {
            await adminRepository.setSiteStatus(statusDialog.siteId, statusDialog.status, reason);
            setStatusDialog(null);
            await reload();
          }}
        />
      )}
    </section>
  );
}
