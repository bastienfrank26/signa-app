import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthFailure, useAuth } from '@signa/sdk';
import AuthLayout from './AuthLayout';
import { fieldStyle, labelStyle, primaryButtonStyle } from './formStyles';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUp({ email, password });
      setDone(true);
    } catch (err) {
      setError(err instanceof AuthFailure ? err.message : 'La création du compte a échoué. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Vérifiez votre courriel</h1>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--sg-text-muted)' }}>
          Un lien de confirmation a été envoyé à {email}. Cliquez dessus pour activer votre compte, puis connectez-vous.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Créer un compte</h1>
      <p style={{ margin: '0 0 20px', fontSize: 13.5, color: 'var(--sg-text-muted)' }}>Accès Signa pour votre entreprise.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={labelStyle}>
          Courriel
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
        </label>
        <label style={labelStyle}>
          Mot de passe
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={fieldStyle} />
        </label>
        {error && <div style={{ fontSize: 12.5, color: 'var(--sg-danger)', fontWeight: 600 }}>{error}</div>}
        <button type="submit" disabled={submitting} style={primaryButtonStyle}>
          {submitting ? 'Création…' : 'Créer le compte'}
        </button>
      </form>
      <div style={{ marginTop: 18, fontSize: 12.5 }}>
        <Link to="/connexion">J'ai déjà un compte</Link>
      </div>
    </AuthLayout>
  );
}
