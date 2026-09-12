import { money, stageColor, useAppActions, useAppState } from '../AppContext';
import { pill, chipTag } from '../ui';
import { formatRelativeTime, formatNextFollowUp } from '../features/crm/domain/format';
import ProjectStatusCard from '../features/portal/presentation/ProjectStatusCard';
import { useProjectBundle } from '../features/portal/presentation/useProjectBundle';
import { projectStatusLabels } from '../features/portal/domain/project';
import { useAuth } from '../features/auth/presentation/useAuth';

const cardStyle = {
  borderRadius: 14,
  background: '#fff',
  border: '1px solid var(--sg-border)',
  padding: '16px 18px',
} as const;

const activityColor: Record<string, string> = { won: '#1F7A5C', lost: '#8899AA', note: '#2B6CB0' };

function ActivityList() {
  const { activity } = useAppState();
  if (activity.length === 0) {
    return <div style={{ fontSize: 13, color: 'var(--sg-text-muted)' }}>Aucune activité pour l'instant.</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {activity.slice(0, 6).map((a) => (
        <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              flex: 'none',
              marginTop: 6,
              background: activityColor[a.activityType] ?? activityColor.note,
            }}
          />
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{a.contactName ?? 'Activité'}</div>
            <div style={{ fontSize: 12.5, color: '#6B7888' }}>{a.note}</div>
          </div>
          <span style={{ fontSize: 11.5, color: '#9AA6B2', whiteSpace: 'nowrap' }}>{formatRelativeTime(a.createdAt)}</span>
        </div>
      ))}
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
      {tasks.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--sg-text-muted)' }}>Aucune tâche pour l'instant.</div>
      ) : (
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
                <div style={{ fontSize: 12, color: '#7A8899' }}>{t.description}</div>
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
                {formatNextFollowUp(t.dueDate)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function useOrganizationId(): string | null {
  const { session } = useAuth();
  return session?.memberships[0]?.organizationId ?? null;
}

function VariantA() {
  const { prospects, stages } = useAppState();
  const { setScreen } = useAppActions();
  const active = prospects.filter((p) => {
    const stage = stages.find((s) => s.id === p.stageId);
    return stage && !stage.isWon && !stage.isLost;
  });
  const activeTotal = active.reduce((a, b) => a + b.valueCents, 0);
  const overdue = prospects.find((p) => p.nextFollowUpAt && new Date(p.nextFollowUpAt) < new Date(new Date().toDateString()));
  const newStage = [...stages].sort((a, b) => a.position - b.position)[0];
  const newCount = newStage ? prospects.filter((p) => p.stageId === newStage.id).length : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 18, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
        <ProjectStatusCard />

        <TasksCard />

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14 }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: '#7A8899', fontWeight: 600 }}>Nouveaux prospects</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em' }}>{newCount}</div>
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
            <div style={{ marginTop: 4, fontSize: 13, color: '#7A8899' }}>{overdue ? overdue.name : 'Aucun'}</div>
          </div>
        </section>
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
        <section style={{ borderRadius: 16, background: '#fff', border: '1px solid var(--sg-border)', padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800, letterSpacing: '-.01em' }}>Activité récente</h3>
          <ActivityList />
        </section>
      </aside>
    </div>
  );
}

function VariantB() {
  const { prospects, stages, tasks } = useAppState();
  const { setScreen } = useAppActions();
  const active = prospects.filter((p) => {
    const stage = stages.find((s) => s.id === p.stageId);
    return stage && !stage.isWon && !stage.isLost;
  });
  const activeTotal = active.reduce((a, b) => a + b.valueCents, 0);
  const tasksLeft = tasks.filter((t) => !t.done).length;
  const newStage = [...stages].sort((a, b) => a.position - b.position)[0];
  const newCount = newStage ? prospects.filter((p) => p.stageId === newStage.id).length : 0;
  const { bundle } = useProjectBundle(useOrganizationId());
  const doneSteps = bundle ? bundle.steps.filter((s) => s.status === 'done').length : 0;

  const kpis = [
    { chip: 'CRM', value: String(newCount), label: 'Nouveaux prospects', cta: 'Voir les prospects →', screen: 'prospects' as const, color: '#2B6CB0' },
    { chip: 'À FAIRE', value: String(tasksLeft), label: 'Tâches à faire', cta: 'Voir mes tâches →', screen: 'taches' as const, color: '#B4740E' },
    { chip: 'PIPELINE', value: money(activeTotal), label: 'Valeur active ce mois-ci', cta: 'Voir le pipeline →', screen: 'pipeline' as const, color: '#E8521A' },
    { chip: 'SITE', value: bundle ? projectStatusLabels[bundle.project.status] : '—', label: 'Statut du projet web', cta: 'Voir le projet →', screen: 'projet' as const, color: '#1F7A5C' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 14 }}>
        {kpis.map((k) => (
          <div key={k.chip} style={{ borderRadius: 14, background: '#fff', border: '1px solid var(--sg-border)', padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={chipTag(k.color)}>{k.chip}</span>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.025em' }}>{k.value}</div>
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
          {bundle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16 }}>
              {bundle.steps.map((s) => (
                <div key={s.id} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
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
                      background: s.status === 'done' ? '#0F1B2D' : '#DCD6CA',
                    }}
                  >
                    {s.status === 'done' ? '✓' : ''}
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: s.status === 'done' ? 700 : 500, color: s.status === 'done' ? '#0F1B2D' : '#9AA6B2' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
          <p style={{ margin: '0 0 18px', fontSize: 13.5, color: '#6B7888' }}>
            {doneSteps} étape{doneSteps > 1 ? 's' : ''} complétée{doneSteps > 1 ? 's' : ''} sur {bundle?.steps.length ?? 0}.
          </p>
          <button
            onClick={() => setScreen('projet')}
            style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: '#0F1B2D', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Voir les détails du projet →
          </button>
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
  const { prospects, stages } = useAppState();
  const { setScreen, openProspect } = useAppActions();
  const ordered = [...stages].sort((a, b) => a.position - b.position);
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
        {ordered.slice(0, 4).map((st) => {
          const stageItems = prospects.filter((p) => p.stageId === st.id);
          const total = stageItems.reduce((a, b) => a + b.valueCents, 0);
          return (
            <div key={st.id} style={{ borderRadius: 12, background: '#FAF8F4', border: '1px solid #EEE9E0', padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{st.label}</span>
                <span style={{ fontSize: 12, color: '#7A8899', fontWeight: 600 }}>{money(total)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stageItems.slice(0, 3).map((c) => (
                  <MiniCard key={c.id} name={c.name} sub={c.need} amount={money(c.valueCents)} onOpen={() => openProspect(c.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MiniCard({ name, sub, amount, onOpen }: { name: string; sub: string; amount: string; onOpen: () => void }) {
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
  const { variant, loading, loadError } = useAppState();
  const { setVariant, openNew } = useAppActions();

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: '4px 0 2px', fontSize: 34, fontWeight: 800, letterSpacing: '-.03em' }}>Bonjour,</h1>
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

      {loading && <div style={{ color: 'var(--sg-text-muted)' }}>Chargement…</div>}
      {loadError && <div style={{ color: 'var(--sg-danger)' }}>{loadError}</div>}
      {!loading && !loadError && (variant === 'A' ? <VariantA /> : <VariantB />)}
    </div>
  );
}
