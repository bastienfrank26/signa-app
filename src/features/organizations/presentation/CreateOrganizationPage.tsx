import { useState, type FormEvent } from 'react';
import { supabase } from '../../../infrastructure/supabase/client';
import { createSupabaseOrganizationRepository } from '../infrastructure/supabase/SupabaseOrganizationRepository';
import { useAuth } from '../../auth/presentation/useAuth';
import { fieldStyle, labelStyle, primaryButtonStyle } from '../../auth/presentation/formStyles';

const repository = createSupabaseOrganizationRepository(supabase);

export default function CreateOrganizationPage() {
  const { refreshSession, signOut } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await repository.create(name.trim());
      await refreshSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La création a échoué.');
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sg-cream-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 'min(420px,100%)', background: '#fff', border: '1px solid var(--sg-border)', borderRadius: 16, padding: 28 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Votre entreprise</h1>
        <p style={{ margin: '0 0 20px', fontSize: 13.5, color: 'var(--sg-text-muted)' }}>
          Nommez votre organisation pour accéder à votre espace Signa.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={labelStyle}>
            Nom de l'entreprise
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Entreprise ABC" style={fieldStyle} />
          </label>
          {error && <div style={{ fontSize: 12.5, color: 'var(--sg-danger)', fontWeight: 600 }}>{error}</div>}
          <button type="submit" disabled={submitting || !name.trim()} style={primaryButtonStyle}>
            {submitting ? 'Création…' : 'Continuer'}
          </button>
        </form>
        <button
          onClick={() => void signOut()}
          style={{ marginTop: 14, padding: 0, border: 'none', background: 'none', color: 'var(--sg-text-muted)', fontSize: 12.5, cursor: 'pointer' }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
