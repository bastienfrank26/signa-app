import { useAuth } from '../../auth/presentation/useAuth';

/**
 * DEC-020 : plus d'inscription libre — seul le personnel Signa crée une
 * organisation (avec invitation). Un compte authentifié sans organisation
 * et sans invitation en attente n'a rien à faire ici.
 */
export default function NoOrganizationPage() {
  const { session, signOut } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sg-cream-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 'min(420px,100%)', background: '#fff', border: '1px solid var(--sg-border)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>Aucun accès pour l'instant</h1>
        <p style={{ margin: '0 0 4px', fontSize: 13.5, color: 'var(--sg-text-muted)' }}>
          {session?.email ?? 'Ce compte'} n'est associé à aucune organisation Signa.
        </p>
        <p style={{ margin: '0 0 20px', fontSize: 13.5, color: 'var(--sg-text-muted)' }}>
          Si vous attendez une invitation, vérifiez le lien reçu. Sinon, contactez Signa.
        </p>
        <button
          onClick={() => void signOut()}
          style={{ padding: 0, border: 'none', background: 'none', color: 'var(--sg-text-muted)', fontSize: 12.5, cursor: 'pointer' }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
