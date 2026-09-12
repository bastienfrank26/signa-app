import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthFailure } from '../domain/auth';
import { useAuth } from './useAuth';
import AuthLayout from './AuthLayout';
import { fieldStyle, labelStyle, primaryButtonStyle } from './formStyles';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof AuthFailure ? err.message : 'La connexion a échoué. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Connexion</h1>
      <p style={{ margin: '0 0 20px', fontSize: 13.5, color: 'var(--sg-text-muted)' }}>Accédez à votre espace Signa.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={labelStyle}>
          Courriel
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
        </label>
        <label style={labelStyle}>
          Mot de passe
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={fieldStyle} />
        </label>
        {error && <div style={{ fontSize: 12.5, color: 'var(--sg-danger)', fontWeight: 600 }}>{error}</div>}
        <button type="submit" disabled={submitting} style={primaryButtonStyle}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
        <Link to="/inscription">Créer un compte</Link>
        <Link to="/mot-de-passe-oublie">Mot de passe oublié</Link>
      </div>
    </AuthLayout>
  );
}
