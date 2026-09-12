import { useState } from 'react';
import { adminRepository } from './useStaffRole';

const inputStyle = {
  padding: '11px 13px',
  borderRadius: 10,
  border: '1px solid var(--sg-border-strong)',
  fontSize: 14,
  fontWeight: 500,
  color: '#0F1B2D',
} as const;

const labelStyle = { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 700 } as const;

export default function CreateClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit() {
    if (!name.trim() || !email.trim()) {
      setError('Le nom de l’organisation et le courriel du client sont requis.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { invitationToken } = await adminRepository.createOrganizationWithInvitation(name.trim(), email.trim());
      setLink(`${window.location.origin}/accepter-invitation?token=${invitationToken}`);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La création a échoué.');
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,45,.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 50 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(460px,100%)', background: '#fff', borderRadius: 16, padding: 24 }}>
        {!link ? (
          <>
            <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>Créer un client</h3>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: '#7A8899' }}>
              Crée l'organisation et une invitation. Aucun courriel automatique n'est envoyé — le lien devra être transmis manuellement.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={labelStyle}>
                Nom de l'organisation
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Entreprise ABC" style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Courriel du client
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@entreprise.ca" style={inputStyle} />
              </label>
              {error && <div style={{ fontSize: 12.5, color: '#C0392B', fontWeight: 600 }}>{error}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{ minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={() => void submit()}
                disabled={submitting}
                style={{ minHeight: 44, padding: '0 18px', borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Création…' : 'Créer'}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>Client créé</h3>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#7A8899' }}>Envoyez ce lien à {email} — valide 7 jours.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input readOnly value={link} style={{ ...inputStyle, flex: 1, color: '#5D6B7B' }} onFocus={(e) => e.target.select()} />
              <button
                onClick={() => void copyLink()}
                style={{ minHeight: 44, padding: '0 16px', borderRadius: 10, border: 'none', background: '#0F1B2D', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
              >
                {copied ? 'Copié' : 'Copier'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={onClose}
                style={{ minHeight: 44, padding: '0 18px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Fermer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
