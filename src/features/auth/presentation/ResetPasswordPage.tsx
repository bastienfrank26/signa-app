import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../infrastructure/supabase/client';
import AuthLayout from './AuthLayout';
import { fieldStyle, labelStyle, primaryButtonStyle } from './formStyles';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw new Error(updateError.message);
      setDone(true);
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la mise à jour.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Mot de passe mis à jour</h1>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--sg-text-muted)' }}>Redirection…</p>
      </AuthLayout>
    );
  }

  if (!ready) {
    return (
      <AuthLayout>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Lien invalide ou expiré</h1>
        <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--sg-text-muted)' }}>
          Ce lien de réinitialisation n'est plus valide. Demandez-en un nouveau.
        </p>
        <Link to="/mot-de-passe-oublie" style={{ fontSize: 13.5 }}>
          Demander un nouveau lien
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Nouveau mot de passe</h1>
      <p style={{ margin: '0 0 20px', fontSize: 13.5, color: 'var(--sg-text-muted)' }}>Choisissez un nouveau mot de passe.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={labelStyle}>
          Mot de passe
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={fieldStyle} />
        </label>
        {error && <div style={{ fontSize: 12.5, color: 'var(--sg-danger)', fontWeight: 600 }}>{error}</div>}
        <button type="submit" disabled={submitting} style={primaryButtonStyle}>
          {submitting ? 'Enregistrement…' : 'Mettre à jour'}
        </button>
      </form>
    </AuthLayout>
  );
}
