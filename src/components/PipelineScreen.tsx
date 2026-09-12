import { money, useAppActions, useAppState } from '../AppContext';
import { STAGES } from '../data/seed';
import ProspectCard from './ProspectCard';

export default function PipelineScreen() {
  const { prospects } = useAppState();
  const { openNew } = useAppActions();
  const active = prospects.filter((p) => p.stage !== 'Gagné' && p.stage !== 'Perdu');
  const activeTotal = active.reduce((a, b) => a + b.value, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 2px', fontSize: 30, fontWeight: 800, letterSpacing: '-.03em' }}>Pipeline</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#5D6B7B' }}>
            {active.length} dossiers actifs · {money(activeTotal)}
          </p>
        </div>
        <button
          onClick={openNew}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
        >
          + Ajouter un prospect
        </button>
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 12 }}>
        {STAGES.map((st) => {
          const items = prospects.filter((p) => p.stage === st.key);
          const total = items.reduce((a, b) => a + b.value, 0);
          return (
            <div key={st.key} style={{ width: 252, flex: 'none', borderRadius: 14, background: '#fff', border: '1px solid var(--sg-border)', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: st.color }} />
                  <span style={{ fontSize: 13.5, fontWeight: 800 }}>{st.key}</span>
                  <span style={{ fontSize: 12, color: '#9AA6B2', fontWeight: 700 }}>{items.length}</span>
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#5D6B7B' }}>{money(total)}</span>
              </div>
              <div style={{ height: 3, borderRadius: 2, marginBottom: 12, background: st.color + '33' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minHeight: 60 }}>
                {items.map((p, i) => (
                  <ProspectCard key={p.id} p={p} idx={p.id + i} />
                ))}
                {items.length === 0 && (
                  <div style={{ border: '1px dashed var(--sg-border-strong)', borderRadius: 11, padding: '18px 12px', textAlign: 'center', fontSize: 12.5, color: '#9AA6B2' }}>
                    Aucun dossier
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
