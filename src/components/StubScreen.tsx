import { useAppActions, useAppState } from '../AppContext';

const TITLES: Record<string, string> = {
  fichiers: 'Fichiers',
};

export default function StubScreen() {
  const { screen } = useAppState();
  const { setScreen } = useAppActions();
  const title = TITLES[screen] ?? '';

  return (
    <div style={{ maxWidth: 620, margin: '60px auto', textAlign: 'center', background: '#fff', border: '1px solid var(--sg-border)', borderRadius: 16, padding: '44px 30px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: 'var(--sg-accent)' }}>PROTOTYPE</div>
      <h2 style={{ margin: '10px 0 8px', fontSize: 24, fontWeight: 800, letterSpacing: '-.02em' }}>{title}</h2>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6B7888' }}>
        Cet écran fait partie du produit, mais n'est pas maquetté dans ce prototype. L'accent est mis sur l'accueil et le CRM.
      </p>
      <button
        onClick={() => setScreen('accueil')}
        style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: '#0F1B2D', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
      >
        Retour à l'accueil
      </button>
    </div>
  );
}
