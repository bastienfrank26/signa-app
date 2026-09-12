import { money, initials, useAppActions, useAppState } from '../AppContext';
import { avatarStyle, tag } from '../ui';

export default function ProspectDrawer() {
  const { prospects, selectedId, note, history } = useAppState();
  const { closeDrawer, move, setStageOf, setNote, addNote } = useAppActions();
  const sel = prospects.find((p) => p.id === selectedId);
  if (!sel) return null;

  const advLabel = sel.stage === 'Gagné' ? 'Déjà gagné' : sel.stage === 'Perdu' ? 'Réactiver le dossier' : 'Avancer à l’étape suivante';
  const advance = () => {
    if (sel.stage === 'Perdu') setStageOf(sel.id, 'Nouveau');
    else if (sel.stage !== 'Gagné') move(sel.id, 1);
  };
  const selHistory = [
    ...(history[sel.id] ?? []),
    { text: 'Prospect créé depuis ' + sel.source.toLowerCase(), time: '24 sept. · 9 h 12' },
  ];

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
            <span style={avatarStyle(sel.id, 44)}>{initials(sel.company === 'Particulier' ? sel.name : sel.company)}</span>
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
          <span style={tag(sel.stage)}>{sel.stage}</span>
          <span style={{ fontSize: 19, fontWeight: 800 }}>{money(sel.value)}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InfoBox label="SOURCE" value={sel.source} />
          <InfoBox label="PROCHAIN SUIVI" value={sel.next} />
          <InfoBox label="COURRIEL" value={sel.email} wrap />
          <InfoBox label="TÉLÉPHONE" value={sel.phone} />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={advance}
            style={{ flex: 1, minHeight: 44, padding: '0 16px', borderRadius: 10, border: 'none', background: '#0F1B2D', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
          >
            {advLabel}
          </button>
          <button
            onClick={() => setStageOf(sel.id, 'Perdu')}
            style={{ minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid #E7D3CF', background: '#fff', color: '#C0392B', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
          >
            Marquer perdu
          </button>
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
            {selHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9C2B5', marginTop: 6, flex: 'none' }} />
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{h.text}</div>
                  <div style={{ fontSize: 11.5, color: '#9AA6B2' }}>{h.time}</div>
                </div>
              </div>
            ))}
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
