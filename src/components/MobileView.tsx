import { money, useAppActions, useAppState } from '../AppContext';
import { mTabStyle } from '../ui';
import { STAGES } from '../data/seed';
import ProspectCard from './ProspectCard';

export default function MobileView() {
  const { mTab } = useAppState();
  const { setMTab, openNew } = useAppActions();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '36px 16px 60px' }}>
      <div
        style={{
          width: 320,
          flex: 'none',
          borderRadius: 34,
          border: '9px solid #0F1B2D',
          background: 'var(--sg-cream-50)',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(15,27,45,.22)',
          display: 'flex',
          flexDirection: 'column',
          height: 680,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px 4px', fontSize: 11, fontWeight: 700, color: '#0F1B2D' }}>
          <span>9:41</span>
          <span>▮▮▮ ⌁</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 8,
                background: 'var(--sg-accent)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              S
            </span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>Signa</span>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#0F1B2D',
              color: '#F5F2EC',
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            FR
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 14px 16px' }}>
          {mTab === 'home' ? <MobileHome /> : <MobilePipeline />}
        </div>

        <div style={{ display: 'flex', borderTop: '1px solid var(--sg-border)', background: '#fff' }}>
          <button onClick={() => setMTab('home')} style={mTabStyle(mTab === 'home')}>
            Accueil
          </button>
          <button onClick={() => setMTab('pipe')} style={mTabStyle(mTab === 'pipe')}>
            Pipeline
          </button>
          <button onClick={openNew} style={{ flex: 1, minHeight: 56, border: 'none', background: 'none', fontSize: 12, fontWeight: 700, color: 'var(--sg-accent)', cursor: 'pointer' }}>
            + Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileHome() {
  const { prospects, tasks } = useAppState();
  const { approve, toggleTask } = useAppActions();
  const active = prospects.filter((p) => p.stage !== 'Gagné' && p.stage !== 'Perdu');
  const activeTotal = active.reduce((a, b) => a + b.value, 0);
  const newCount = prospects.filter((p) => p.stage === 'Nouveau').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, color: '#7A8899', fontWeight: 600 }}>Mercredi 24 septembre</div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.03em' }}>Bonjour Francis,</div>
      </div>
      <div style={{ borderRadius: 14, background: '#0F1B2D', color: '#F5F2EC', padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: 'var(--sg-accent)' }}>PROCHAINE ACTION</div>
        <div style={{ margin: '6px 0 4px', fontSize: 16, fontWeight: 800, lineHeight: 1.25 }}>Approuver la page « À propos »</div>
        <div style={{ fontSize: 12, color: '#B9C4CF', marginBottom: 12 }}>Version privée prête depuis 2 jours.</div>
        <button
          onClick={approve}
          style={{ width: '100%', minHeight: 44, borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          Approuver la version
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ borderRadius: 12, background: '#fff', border: '1px solid var(--sg-border)', padding: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{newCount}</div>
          <div style={{ fontSize: 11.5, color: '#7A8899' }}>Nouveaux prospects</div>
        </div>
        <div style={{ borderRadius: 12, background: '#fff', border: '1px solid var(--sg-border)', padding: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{money(activeTotal)}</div>
          <div style={{ fontSize: 11.5, color: '#7A8899' }}>Pipeline actif</div>
        </div>
      </div>
      <div style={{ borderRadius: 14, background: '#fff', border: '1px solid var(--sg-border)', padding: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Vos tâches</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tasks.map((t) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #F1EDE5' }}>
              <button
                onClick={() => toggleTask(t.id)}
                style={{
                  width: 22,
                  height: 22,
                  flex: 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid ' + (t.done ? '#1F7A5C' : '#CFC8BB'),
                  background: t.done ? '#1F7A5C' : '#fff',
                  color: '#fff',
                }}
              >
                {t.done ? '✓' : ''}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#9AA6B2' : undefined }}>
                  {t.label}
                </div>
                <div style={{ fontSize: 11, color: '#7A8899' }}>{t.due}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobilePipeline() {
  const { prospects, mStage } = useAppState();
  const { setMStage } = useAppActions();
  const items = prospects.filter((p) => p.stage === mStage);
  const total = items.reduce((a, b) => a + b.value, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.03em' }}>Pipeline</div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {STAGES.map((st) => (
          <button
            key={st.key}
            onClick={() => setMStage(st.key)}
            style={{
              flex: 'none',
              minHeight: 36,
              padding: '0 14px',
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              border: '1px solid ' + (mStage === st.key ? '#0F1B2D' : 'var(--sg-border-strong)'),
              background: mStage === st.key ? '#0F1B2D' : '#fff',
              color: mStage === st.key ? '#fff' : '#5D6B7B',
            }}
          >
            {st.key}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#7A8899', fontWeight: 600 }}>
        <span>
          {items.length} dossier{items.length > 1 ? 's' : ''}
        </span>
        <span>{money(total)}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((p, i) => (
          <ProspectCard key={p.id} p={p} idx={p.id + i} mobile />
        ))}
        {items.length === 0 && (
          <div style={{ border: '1px dashed var(--sg-border-strong)', borderRadius: 12, padding: '26px 12px', textAlign: 'center', fontSize: 12.5, color: '#9AA6B2' }}>
            Aucun dossier à cette étape
          </div>
        )}
      </div>
    </div>
  );
}
