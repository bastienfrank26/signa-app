import { useEffect, useState } from 'react';
import { useAppActions, useAppState } from '../AppContext';
import { useAuth } from '@signa/sdk';
import { createSupabaseCrmRepository } from '../features/crm/infrastructure/supabase/SupabaseCrmRepository';
import { supabase } from '../infrastructure/supabase/client';
import type { DuplicateContactMatch, OrgMember } from '../features/crm/domain/crm';

const repository = createSupabaseCrmRepository(supabase);

const inputStyle = {
  padding: '11px 13px',
  borderRadius: 10,
  border: '1px solid var(--sg-border-strong)',
  fontSize: 14,
  fontWeight: 500,
  color: '#0F1B2D',
} as const;

const labelStyle = { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 700 } as const;

export default function NewProspectModal() {
  const { newOpen } = useAppState();
  const { closeNew, reload, showToast, setScreen } = useAppActions();
  const { session } = useAuth();
  const organizationId = session?.memberships[0]?.organizationId ?? null;

  const [name, setName] = useState('');
  const [need, setNeed] = useState('');
  const [value, setValue] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [duplicate, setDuplicate] = useState<DuplicateContactMatch | null>(null);

  useEffect(() => {
    if (!newOpen || !organizationId) return;
    void repository.listOrgMembers(organizationId).then(setMembers);
  }, [newOpen, organizationId]);

  if (!newOpen) return null;

  function resetAndClose() {
    setName('');
    setNeed('');
    setValue('');
    setEmail('');
    setPhone('');
    setOwnerUserId('');
    setError(null);
    setDuplicate(null);
    closeNew();
  }

  async function create() {
    if (!name.trim() || !organizationId) {
      setError('Le nom du contact est requis.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await repository.createProspect(organizationId, {
        name: name.trim(),
        need: need.trim(),
        valueCents: (parseInt(value.replace(/\D/g, ''), 10) || 0) * 100,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        ownerUserId: ownerUserId || undefined,
      });
      showToast('Prospect ajouté à « Nouveau »');
      await reload();
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !organizationId) {
      setError('Le nom du contact est requis.');
      return;
    }
    setError(null);
    if (!duplicate) {
      const match = await repository.findDuplicateContact(organizationId, email.trim() || undefined, phone.trim() || undefined);
      if (match) {
        setDuplicate(match);
        return;
      }
    }
    await create();
  }

  return (
    <div
      onClick={resetAndClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,45,.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 50 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(420px,100%)', background: '#fff', borderRadius: 16, padding: 24, animation: 'sgIn .18s ease both' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>Ajouter un prospect</h3>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: '#7A8899' }}>Il arrivera à l'étape « Nouveau ».</p>

        {duplicate ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ border: '1px solid #E7D3CF', background: '#FFF7ED', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>Ce prospect existe peut-être déjà.</div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{duplicate.name}</div>
              <div style={{ fontSize: 12.5, color: '#7A8899' }}>
                {duplicate.email || '—'} {duplicate.phone ? '· ' + duplicate.phone : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  resetAndClose();
                  setScreen('contacts');
                }}
                style={{ minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Ouvrir la fiche
              </button>
              <button
                onClick={() => void create()}
                disabled={submitting}
                style={{ minHeight: 44, padding: '0 18px', borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Ajout…' : 'Créer quand même'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={labelStyle}>
                Nom du contact
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Marie Tremblay" style={inputStyle} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={labelStyle}>
                  Courriel
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optionnel" style={inputStyle} />
                </label>
                <label style={labelStyle}>
                  Téléphone
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optionnel" style={inputStyle} />
                </label>
              </div>
              <label style={labelStyle}>
                Besoin
                <input value={need} onChange={(e) => setNeed(e.target.value)} placeholder="Refonte du site" style={inputStyle} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={labelStyle}>
                  Valeur estimée ($)
                  <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="2500" style={inputStyle} />
                </label>
                <label style={labelStyle}>
                  Responsable
                  <select value={ownerUserId} onChange={(e) => setOwnerUserId(e.target.value)} style={inputStyle}>
                    <option value="">Non assigné</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.email}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {error && <div style={{ fontSize: 12.5, color: '#C0392B', fontWeight: 600 }}>{error}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button
                onClick={resetAndClose}
                style={{ minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={() => void handleSubmit()}
                disabled={submitting}
                style={{ minHeight: 44, padding: '0 18px', borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Vérification…' : 'Ajouter le prospect'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
