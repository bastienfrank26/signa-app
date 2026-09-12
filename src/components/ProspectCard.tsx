import { money, initials, useAppActions, useAppState } from '../AppContext';
import { avatarStyle } from '../ui';
import type { Prospect } from '../features/crm/domain/crm';

export default function ProspectCard({ p, idx, mobile }: { p: Prospect; idx: number; mobile?: boolean }) {
  const { openProspect, move } = useAppActions();
  const { stages } = useAppState();
  const ordered = [...stages].sort((a, b) => a.position - b.position);
  const i = ordered.findIndex((s) => s.id === p.stageId);
  const atStart = i <= 0;
  const atEnd = i >= ordered.length - 1;

  const fwdStyle = {
    flex: 1,
    minHeight: 32,
    borderRadius: 8,
    border: '1px solid var(--sg-border-strong)',
    background: '#FAF8F4',
    fontSize: 11.5,
    fontWeight: 700,
    color: atEnd ? '#B6BEC8' : '#0F1B2D',
    cursor: 'pointer',
  } as const;
  const backStyle = {
    width: 34,
    minHeight: 32,
    borderRadius: 8,
    border: '1px solid var(--sg-border-strong)',
    background: '#fff',
    fontSize: 12,
    color: atStart ? '#B6BEC8' : '#0F1B2D',
    cursor: 'pointer',
  } as const;
  const mFwdStyle = {
    marginTop: 10,
    width: '100%',
    minHeight: 44,
    borderRadius: 10,
    border: '1px solid var(--sg-border-strong)',
    background: '#FAF8F4',
    fontSize: 13,
    fontWeight: 700,
    color: '#0F1B2D',
    cursor: 'pointer',
  } as const;

  return (
    <div
      style={{
        border: '1px solid var(--sg-border)',
        borderRadius: 11,
        padding: 12,
        background: '#fff',
        animation: 'sgIn .22s ease both',
      }}
    >
      <button
        onClick={() => openProspect(p.id)}
        style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
      >
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{p.name}</div>
        <div style={{ fontSize: 11.5, color: '#7A8899', marginTop: 1 }}>{p.need}</div>
        <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 800 }}>{money(p.valueCents)}</span>
          <span style={avatarStyle(idx, 24)}>{initials(p.company === 'Particulier' ? p.name : p.company)}</span>
        </div>
      </button>
      {mobile ? (
        <button onClick={() => move(p.id, 1)} style={mFwdStyle} disabled={atEnd}>
          Avancer →
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button onClick={() => move(p.id, -1)} style={backStyle} disabled={atStart}>
            ←
          </button>
          <button onClick={() => move(p.id, 1)} style={fwdStyle} disabled={atEnd}>
            Avancer →
          </button>
        </div>
      )}
    </div>
  );
}
