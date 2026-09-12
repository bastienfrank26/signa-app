import { useAppActions, useAppState } from '../AppContext';

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
  const { newOpen, fName, fSub, fValue, formError } = useAppState();
  const { closeNew, setFName, setFSub, setFValue, submitNew } = useAppActions();
  if (!newOpen) return null;

  return (
    <div
      onClick={closeNew}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,45,.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 50 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(420px,100%)', background: '#fff', borderRadius: 16, padding: 24, animation: 'sgIn .18s ease both' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>Ajouter un prospect</h3>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: '#7A8899' }}>Il arrivera à l'étape « Nouveau ».</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={labelStyle}>
            Nom du contact
            <input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Marie Tremblay" style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Besoin
            <input value={fSub} onChange={(e) => setFSub(e.target.value)} placeholder="Refonte du site" style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Valeur estimée ($)
            <input value={fValue} onChange={(e) => setFValue(e.target.value)} placeholder="2500" style={inputStyle} />
          </label>
          {formError && <div style={{ fontSize: 12.5, color: '#C0392B', fontWeight: 600 }}>Le nom du contact est requis.</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button
            onClick={closeNew}
            style={{ minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button
            onClick={submitNew}
            style={{ minHeight: 44, padding: '0 18px', borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
          >
            Ajouter le prospect
          </button>
        </div>
      </div>
    </div>
  );
}
