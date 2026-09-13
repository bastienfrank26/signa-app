import { money, initials, stageColor, useAppActions, useAppState } from '../AppContext';
import { useAuth } from '@signa/sdk';
import { formatNextFollowUp, formatRelativeTime } from '../features/crm/domain/format';
import { useOrgMembers } from '../features/crm/presentation/useOrgMembers';
import { avatarStyle, tag } from '../ui';

export default function ProspectDrawer() {
  const { prospects, stages, selectedId, note, activity } = useAppState();
  const { closeDrawer, move, setStageOf, setNote, addNote } = useAppActions();
  const { session } = useAuth();
  const { emailOf } = useOrgMembers(session?.memberships[0]?.organizationId ?? null);
  const sel = prospects.find((p) => p.id === selectedId);
  if (!sel) return null;

  const ordered = [...stages].sort((a, b) => a.position - b.position);
  const stage = stages.find((s) => s.id === sel.stageId);
  const stageIndex = ordered.findIndex((s) => s.id === sel.stageId);

  const advLabel = stage?.isWon ? 'Déjà gagné' : stage?.isLost ? 'Réactiver le dossier' : 'Avancer à l’étape suivante';
  const advance = () => {
    if (stage?.isLost) {
      setStageOf(sel.id, ordered[0].id);
    } else if (!stage?.isWon) {
      move(sel.id, 1);
    }
  };
  const lostStage = ordered.find((s) => s.isLost);

  const selHistory = activity.filter((a) => a.opportunityId === sel.id);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,45,.42)', display: 'flex', justifyContent: 'flex-end', zIndex: 40 }}
      onClick={closeDrawer}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(420px,92vw)',
          background: '#fff',
          height: '100%',
          overflowY: 'auto',
          padding: '26px 24px 34px',
          animation: 'sgSlide .22s ease both',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
            <span style={avatarStyle(stageIndex, 44)}>{initials(sel.company === 'Particulier' ? sel.name : sel.company)}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>{sel.name}</div>
              <div style={{ fontSize: 13, color: '#7A8899' }}>{sel.company}</div>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            style={{ minWidth: 36, minHeight: 36, borderRadius: 9, border: '1px solid var(--sg-border)', background: '#fff', fontSize: 15, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {stage && <span style={tag(stageColor(stage.key))}>{stage.label}</span>}
          {sel.lifecycleStatus === 'client' && <span style={tag('#1F7A5C')}>Client</span>}
          <span style={{ fontSize: 19, fontWeight: 800 }}>{money(sel.valueCents)}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InfoBox label="SOURCE" value={sel.source || '—'} />
          <InfoBox label="PROCHAIN SUIVI" value={formatNextFollowUp(sel.nextFollowUpAt)} />
          <InfoBox label="COURRIEL" value={sel.email || '—'} wrap />
          <InfoBox label="TÉLÉPHONE" value={sel.phone || '—'} />
          <InfoBox label="RESPONSABLE" value={emailOf(sel.ownerUserId) ?? 'Non assigné'} wrap />
          {sel.utmSource && <InfoBox label="SOURCE UTM" value={[sel.utmSource, sel.utmCampaign].filter(Boolean).join(' · ')} wrap />}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={advance}
            style={{ flex: 1, minHeight: 44, padding: '0 16px', borderRadius: 10, border: 'none', background: '#0F1B2D', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
          >
            {advLabel}
          </button>
          {lostStage && (
            <button
              onClick={() => setStageOf(sel.id, lostStage.id)}
              style={{ minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid #E7D3CF', background: '#fff', color: '#C0392B', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
            >
              Marquer perdu
            </button>
          )}
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
            onClick={addNote}
            style={{ marginTop: 8, minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
          >
            Enregistrer l'activité
          </button>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Historique</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selHistory.map((h) => (
              <div key={h.id} style={{ display: 'flex', gap: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9C2B5', marginTop: 6, flex: 'none' }} />
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{h.note}</div>
                  <div style={{ fontSize: 11.5, color: '#9AA6B2' }}>{formatRelativeTime(h.createdAt)}</div>
                </div>
              </div>
            ))}
            {selHistory.length === 0 && <div style={{ fontSize: 12.5, color: '#9AA6B2' }}>Aucune activité pour ce prospect.</div>}
          </div>
        </div>
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
