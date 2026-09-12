import { useAppActions } from '../../../AppContext';
import { useAuth } from '../../auth/presentation/useAuth';
import { useProjectBundle } from './useProjectBundle';
import { projectStatusLabels } from '../domain/project';

export default function ProjectStatusCard({ compact }: { compact?: boolean }) {
  const { session } = useAuth();
  const organizationId = session?.memberships[0]?.organizationId ?? null;
  const { bundle, loading } = useProjectBundle(organizationId);
  const { setScreen } = useAppActions();

  if (loading || !bundle) return null;
  const { project, steps } = bundle;
  const isPrivateReview = project.status === 'private_review';
  const doneSteps = steps.filter((s) => s.status === 'done').length;
  const pct = steps.length > 0 ? Math.round((doneSteps / steps.length) * 100) : 0;

  return (
    <div
      style={{
        borderRadius: compact ? 14 : 16,
        background: '#0F1B2D',
        color: '#F5F2EC',
        padding: compact ? 16 : 26,
        display: 'flex',
        gap: 22,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: compact ? undefined : 260 }}>
        <div style={{ fontSize: compact ? 10 : 11, fontWeight: 700, letterSpacing: '.1em', color: 'var(--sg-accent)' }}>
          {isPrivateReview ? 'PROCHAINE ACTION' : 'PROJET WEB'}
        </div>
        <div style={{ margin: compact ? '6px 0 4px' : '8px 0 6px', fontSize: compact ? 16 : 24, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-.02em' }}>
          {isPrivateReview ? 'Votre version privée est prête' : projectStatusLabels[project.status]}
        </div>
        <div style={{ fontSize: compact ? 12 : 14, color: '#B9C4CF', marginBottom: compact ? 12 : 18, maxWidth: compact ? undefined : '46ch' }}>
          {isPrivateReview
            ? 'Consultez-la et approuvez-la pour débloquer la mise en ligne.'
            : 'Suivez la progression et les prochaines étapes de votre site.'}
        </div>
        <button
          onClick={() => setScreen('projet')}
          style={{
            width: compact ? '100%' : undefined,
            padding: compact ? undefined : '11px 18px',
            minHeight: compact ? 44 : undefined,
            borderRadius: 10,
            border: 'none',
            background: 'var(--sg-accent)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isPrivateReview ? 'Voir la version privée' : 'Voir le projet'}
        </button>
      </div>
      {!compact && (
        <div style={{ width: 190, flex: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 38, fontWeight: 800 }}>{pct}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#8899AA' }}>%</span>
          </div>
          <div style={{ fontSize: 12, color: '#8899AA', marginBottom: 10 }}>Projet web complété</div>
          <div style={{ height: 8, borderRadius: 999, background: '#22364C', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--sg-accent)' }} />
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#B9C4CF' }}>Étape : {projectStatusLabels[project.status]}</div>
        </div>
      )}
    </div>
  );
}
