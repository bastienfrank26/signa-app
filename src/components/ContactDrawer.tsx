import { useCallback, useEffect, useState } from 'react';
import { initials, money, stageColor } from '../AppContext';
import { useAuth } from '../features/auth/presentation/useAuth';
import { createSupabaseCrmRepository } from '../features/crm/infrastructure/supabase/SupabaseCrmRepository';
import { supabase } from '../infrastructure/supabase/client';
import { formatRelativeTime } from '../features/crm/domain/format';
import { avatarStyle, tag } from '../ui';
import type { ContactDetail } from '../features/crm/domain/crm';

const repository = createSupabaseCrmRepository(supabase);

export default function ContactDrawer({ contactId, onClose }: { contactId: string; onClose: () => void }) {
  const { session } = useAuth();
  const organizationId = session?.memberships[0]?.organizationId ?? null;
  const [detail, setDetail] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDetail(await repository.getContactDetail(contactId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le contact n’a pas pu être chargé.');
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addNote() {
    if (!organizationId || !note.trim()) return;
    setSaving(true);
    try {
      await repository.addContactNote(organizationId, contactId, note.trim());
      setNote('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'L’activité n’a pas pu être enregistrée.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,45,.42)', display: 'flex', justifyContent: 'flex-end', zIndex: 40 }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(420px,92vw)', background: '#fff', height: '100%', overflowY: 'auto', padding: '26px 24px 34px', animation: 'sgSlide .22s ease both', display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        {loading && <div style={{ color: 'var(--sg-text-muted)' }}>Chargement…</div>}
        {error && <div style={{ color: 'var(--sg-danger)' }}>{error}</div>}

        {detail && (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                <span style={avatarStyle(0, 44)}>{initials(detail.companyName || detail.name)}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>{detail.name}</div>
                  <div style={{ fontSize: 13, color: '#7A8899' }}>{detail.companyName || '—'}</div>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ minWidth: 36, minHeight: 36, borderRadius: 9, border: '1px solid var(--sg-border)', background: '#fff', fontSize: 15, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <InfoBox label="COURRIEL" value={detail.email || '—'} wrap />
              <InfoBox label="TÉLÉPHONE" value={detail.phone || '—'} />
              <InfoBox label="SOURCE" value={detail.source || '—'} />
              <InfoBox label="AJOUTÉ" value={formatRelativeTime(detail.createdAt)} />
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Occasions liées</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {detail.opportunities.map((o) => (
                  <div key={o.id} style={{ border: '1px solid var(--sg-border)', borderRadius: 11, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{o.need || 'Sans description'}</div>
                      <span style={tag(stageColor(o.stageId))}>{money(o.valueCents)}</span>
                    </div>
                  </div>
                ))}
                {detail.opportunities.length === 0 && <div style={{ fontSize: 12.5, color: '#9AA6B2' }}>Aucune occasion pour ce contact.</div>}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Ajouter une activité</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex. Appel de suivi, message laissé…"
                style={{ width: '100%', minHeight: 74, padding: '11px 13px', borderRadius: 11, border: '1px solid var(--sg-border-strong)', fontSize: 13.5, resize: 'vertical', color: '#0F1B2D' }}
              />
              <button
                onClick={() => void addNote()}
                disabled={saving}
                style={{ marginTop: 8, minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13.5, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
              >
                Enregistrer l'activité
              </button>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Historique</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {detail.activities.map((h) => (
                  <div key={h.id} style={{ display: 'flex', gap: 11 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9C2B5', marginTop: 6, flex: 'none' }} />
                    <div style={{ lineHeight: 1.35 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{h.note}</div>
                      <div style={{ fontSize: 11.5, color: '#9AA6B2' }}>{formatRelativeTime(h.createdAt)}</div>
                    </div>
                  </div>
                ))}
                {detail.activities.length === 0 && <div style={{ fontSize: 12.5, color: '#9AA6B2' }}>Aucune activité pour ce contact.</div>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value, wrap }: { label: string; value: string; wrap?: boolean }) {
  return (
    <div style={{ border: '1px solid var(--sg-border)', borderRadius: 11, padding: '11px 13px' }}>
      <div style={{ fontSize: 11, color: '#7A8899', fontWeight: 700, letterSpacing: '.05em' }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, wordBreak: wrap ? 'break-all' : undefined }}>{value}</div>
    </div>
  );
}
