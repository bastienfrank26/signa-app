import { money, useAppActions, useAppState } from '../AppContext';
import { pill, chipTag } from '../ui';
import { STAGES } from '../data/seed';
import ProspectCard from './ProspectCard';

const cardStyle = {
  borderRadius: 14,
  background: '#fff',
  border: '1px solid var(--sg-border)',
  padding: '16px 18px',
} as const;

function ActivityList() {
  const { activity } = useAppState();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {activity.map((a, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              flex: 'none',
              marginTop: 6,
              background: a.color,
            }}
          />
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{a.title}</div>
            <div style={{ fontSize: 12.5, color: '#6B7888' }}>{a.sub}</div>
          </div>
          <span style={{ fontSize: 11.5, color: '#9AA6B2', whiteSpace: 'nowrap' }}>{a.time}</span>
        </div>
      ))}
    </div>
  );
}

function SitePreview({ compact }: { compact?: boolean }) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--sg-border)', background: '#EFEBE3' }}>
      {!compact && (
        <div style={{ height: 26, display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', background: '#E4DFD5' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C9C2B5' }} />
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C9C2B5' }} />
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C9C2B5' }} />
        </div>
      )}
      <div
        style={{
          padding: compact ? '22px 16px 26px' : '26px 18px 30px',
          background: 'linear-gradient(160deg,#1D2E42,#0F1B2D)',
          color: '#F5F2EC',
        }}
      >
        <div style={{ fontSize: compact ? 9 : 10, letterSpacing: '.22em', color: '#8899AA' }}>ATELIER</div>
        <div style={{ marginTop: compact ? 22 : 26, fontSize: compact ? 16 : 19, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-.02em' }}>
          Des espaces qui{!compact && <br />} vous ressemblent
        </div>
      </div>
      {compact && (
        <div style={{ padding: 8, fontSize: 11.5, color: '#7A8899', textAlign: 'center', background: '#FAF8F4' }}>
          Aperçu de votre site
        </div>
      )}
    </div>
  );
}

function TasksCard() {
  const { tasks } = useAppState();
  const { toggleTask } = useAppActions();
  const left = tasks.filter((t) => !t.done).length;
  return (
    <section style={{ borderRadius: 16, background: '#fff', border: '1px solid var(--sg-border)', padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, letterSpacing: '-.01em' }}>Vos tâches</h3>
        <span style={{ fontSize: 13, color: '#7A8899' }}>{left} à faire</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tasks.map((t) => (
          <div
            key={t.id}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', borderRadius: 10, borderBottom: '1px solid #F1EDE5' }}
          >
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
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
              <div style={{ fontSize: 14, fontWeight: 600, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#9AA6B2' : undefined }}>
                {t.label}
              </div>
              <div style={{ fontSize: 12, color: '#7A8899' }}>{t.sub}</div>
            </div>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
                whiteSpace: 'nowrap',
                color: t.urgent ? '#C0392B' : '#6B7888',
                background: t.urgent ? '#C0392B18' : '#F1EDE5',
              }}
            >
              {t.due}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function VariantA() {
  const { prospects } = useAppState();
  const { setScreen } = useAppActions();
  const active = prospects.filter((p) => p.stage !== 'Gagné' && p.stage !== 'Perdu');
  const activeTotal = active.reduce((a, b) => a + b.value, 0);
  const overdue = prospects.find((p) => p.next.startsWith('En retard'));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 18, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
        <section
          style={{
            borderRadius: 16,
            background: '#0F1B2D',
            color: '#F5F2EC',
            padding: 26,
            display: 'flex',
            gap: 22,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'var(--sg-accent)' }}>PROCHAINE ACTION</div>
            <h2 style={{ margin: '8px 0 6px', fontSize: 24, fontWeight: 800, letterSpacing: '-.02em' }}>
              Approuver la page « À propos »
            </h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#B9C4CF', maxWidth: '46ch' }}>
              Votre version privée est prête depuis 2 jours. L'approbation débloque la mise en ligne prévue le 30 septembre.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <ApproveButton />
              <AskRevisionButton />
            </div>
          </div>
          <div style={{ width: 190, flex: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 38, fontWeight: 800 }}>80</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#8899AA' }}>%</span>
            </div>
            <div style={{ fontSize: 12, color: '#8899AA', marginBottom: 10 }}>Projet web complété</div>
            <div style={{ height: 8, borderRadius: 999, background: '#22364C', overflow: 'hidden' }}>
              <div style={{ width: '80%', height: '100%', background: 'var(--sg-accent)' }} />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#B9C4CF' }}>Étape : révision privée</div>
          </div>
        </section>

        <TasksCard />

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14 }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: '#7A8899', fontWeight: 600 }}>Nouveaux prospects</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em' }}>
              {prospects.filter((p) => p.stage === 'Nouveau').length}
            </div>
            <button
              onClick={() => setScreen('prospects')}
              style={{ marginTop: 4, padding: 0, border: 'none', background: 'none', color: 'var(--sg-accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Voir les prospects →
            </button>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: '#7A8899', fontWeight: 600 }}>Pipeline actif</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em', whiteSpace: 'nowrap' }}>{money(activeTotal)}</div>
            <button
              onClick={() => setScreen('pipeline')}
              style={{ marginTop: 4, padding: 0, border: 'none', background: 'none', color: 'var(--sg-accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Voir le pipeline →
            </button>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: '#7A8899', fontWeight: 600 }}>Suivis en retard</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em', color: '#C0392B' }}>{overdue ? 1 : 0}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: '#7A8899' }}>{overdue ? `${overdue.name} · 7 jours` : 'Aucun'}</div>
          </div>
        </section>
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
        <section style={{ borderRadius: 16, background: '#fff', border: '1px solid var(--sg-border)', padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800, letterSpacing: '-.01em' }}>Activité récente</h3>
          <ActivityList />
        </section>
        <section style={{ borderRadius: 16, background: '#FFF', border: '1px solid var(--sg-border)', padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, letterSpacing: '-.01em' }}>Votre site</h3>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6B7888' }}>Version privée · mise à jour il y a 2 h</p>
          <SitePreview />
        </section>
      </aside>
    </div>
  );
}

function ApproveButton() {
  const { approve } = useAppActions();
  return (
    <button
      onClick={approve}
      style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
    >
      Approuver la version
    </button>
  );
}
function AskRevisionButton() {
  const { askRevision } = useAppActions();
  return (
    <button
      onClick={askRevision}
      style={{ padding: '11px 18px', borderRadius: 10, border: '1px solid #35495F', background: 'transparent', color: '#F5F2EC', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
    >
      Demander une correction
    </button>
  );
}

function VariantB() {
  const { prospects, tasks } = useAppState();
  const { setScreen } = useAppActions();
  const active = prospects.filter((p) => p.stage !== 'Gagné' && p.stage !== 'Perdu');
  const activeTotal = active.reduce((a, b) => a + b.value, 0);
  const tasksLeft = tasks.filter((t) => !t.done).length;

  const kpis = [
    { chip: 'CRM', value: String(prospects.filter((p) => p.stage === 'Nouveau').length), label: 'Nouveaux prospects', cta: 'Voir les prospects →', screen: 'prospects' as const, color: '#2B6CB0' },
    { chip: 'À FAIRE', value: String(tasksLeft), label: 'Tâches à faire', cta: 'Voir mes tâches →', screen: 'taches' as const, color: '#B4740E' },
    { chip: 'PIPELINE', value: money(activeTotal), label: 'Valeur active ce mois-ci', cta: 'Voir le pipeline →', screen: 'pipeline' as const, color: '#E8521A' },
    { chip: 'SITE', value: '80 %', label: 'Projet web complété', cta: 'Voir le projet →', screen: 'projet' as const, color: '#1F7A5C' },
  ];

  const stepNames = ['Informations', 'Fichiers', 'Création', 'Révision', 'Approbation', 'En ligne'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 14 }}>
        {kpis.map((k) => (
          <div key={k.chip} style={{ borderRadius: 14, background: '#fff', border: '1px solid var(--sg-border)', padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={chipTag(k.color)}>{k.chip}</span>
            <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-.025em', whiteSpace: 'nowrap' }}>{k.value}</div>
            <div style={{ fontSize: 13, color: '#6B7888' }}>{k.label}</div>
            <button
              onClick={() => setScreen(k.screen)}
              style={{ marginTop: 2, alignSelf: 'flex-start', padding: 0, border: 'none', background: 'none', color: 'var(--sg-accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              {k.cta}
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 18, alignItems: 'start' }}>
        <section style={{ borderRadius: 16, background: '#fff', border: '1px solid var(--sg-border)', padding: 22 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 800 }}>Suivi de votre site</h3>
          <div style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>Votre site est presque prêt</div>
              <p style={{ margin: '6px 0 18px', fontSize: 13.5, color: '#6B7888', maxWidth: '44ch' }}>
                Nous finalisons les dernières sections. Il ne manque que votre approbation.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16 }}>
                {stepNames.map((n, i) => {
                  const done = i < 4;
                  return (
                    <div key={n} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          margin: '0 auto 6px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#fff',
                          background: done ? '#0F1B2D' : '#DCD6CA',
                        }}
                      >
                        {done ? '✓' : ''}
                      </div>
                      <div style={{ fontSize: 10.5, fontWeight: done ? 700 : 500, color: done ? '#0F1B2D' : '#9AA6B2' }}>{n}</div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setScreen('projet')}
                style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: '#0F1B2D', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Voir les détails du projet →
              </button>
            </div>
            <div style={{ width: 210, flex: 'none', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--sg-border)' }}>
              <SitePreview compact />
            </div>
          </div>
        </section>
        <section style={{ borderRadius: 16, background: '#fff', border: '1px solid var(--sg-border)', padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800 }}>Activité récente</h3>
          <ActivityList />
        </section>
      </div>

      <MiniPipeline />
    </div>
  );
}

function MiniPipeline() {
  const { prospects } = useAppState();
  const { setScreen, openProspect } = useAppActions();
  return (
    <section style={{ borderRadius: 16, background: '#fff', border: '1px solid var(--sg-border)', padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Pipeline des ventes</h3>
        <button
          onClick={() => setScreen('pipeline')}
          style={{ padding: 0, border: 'none', background: 'none', color: 'var(--sg-accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Voir le pipeline →
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        {STAGES.slice(0, 4).map((st) => {
          const items = prospects.filter((p) => p.stage === st.key).slice(0, 3);
          const total = prospects.filter((p) => p.stage === st.key).reduce((a, b) => a + b.value, 0);
          return (
            <div key={st.key} style={{ borderRadius: 12, background: '#FAF8F4', border: '1px solid #EEE9E0', padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{st.key}</span>
                <span style={{ fontSize: 12, color: '#7A8899', fontWeight: 600 }}>{money(total)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((c, i) => (
                  <MiniCard key={c.id} name={c.name} sub={c.sub} amount={money(c.value)} onOpen={() => openProspect(c.id)} idx={c.id + i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MiniCard({ name, sub, amount, onOpen }: { name: string; sub: string; amount: string; onOpen: () => void; idx: number }) {
  return (
    <button
      onClick={onOpen}
      style={{ textAlign: 'left', border: '1px solid var(--sg-border)', background: '#fff', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}
    >
      <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
      <div style={{ fontSize: 11.5, color: '#7A8899' }}>{sub}</div>
      <div style={{ marginTop: 4, fontSize: 12.5, fontWeight: 700 }}>{amount}</div>
    </button>
  );
}

export default function HomeScreen() {
  const { variant } = useAppState();
  const { setVariant, openNew } = useAppActions();

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#7A8899', letterSpacing: '.02em' }}>Mercredi 24 septembre</div>
          <h1 style={{ margin: '4px 0 2px', fontSize: 34, fontWeight: 800, letterSpacing: '-.03em' }}>Bonjour Francis,</h1>
          <p style={{ margin: 0, fontSize: 15, color: '#5D6B7B' }}>Voici ce qui demande votre attention aujourd'hui.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 10, background: '#EBE6DC' }}>
            <button onClick={() => setVariant('A')} style={pill(variant === 'A')}>
              Option A · Focus
            </button>
            <button onClick={() => setVariant('B')} style={pill(variant === 'B')}>
              Option B · Vue d'ensemble
            </button>
          </div>
          <button
            onClick={openNew}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 10, border: 'none', background: '#0F1B2D', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            + Nouveau prospect
          </button>
        </div>
      </div>

      {variant === 'A' ? <VariantA /> : <VariantB />}
    </div>
  );
}
