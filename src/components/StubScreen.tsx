import { useAppActions } from '../AppContext';

/** Filet de sécurité : tous les écrans de `Screen` sont construits, ceci ne devrait pas s'afficher. */
export default function StubScreen() {
  const { setScreen } = useAppActions();

  return (
    <div style={{ maxWidth: 620, margin: '60px auto', textAlign: 'center', background: '#fff', border: '1px solid var(--sg-border)', borderRadius: 16, padding: '44px 30px' }}>
      <h2 style={{ margin: '10px 0 8px', fontSize: 24, fontWeight: 800, letterSpacing: '-.02em' }}>Écran introuvable</h2>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6B7888' }}>Cette section n'existe pas encore.</p>
      <button
        onClick={() => setScreen('accueil')}
        style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: '#0F1B2D', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
      >
        Retour à l'accueil
      </button>
    </div>
  );
}
