import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@signa/sdk';
import AuthLayout from './AuthLayout';
import { fieldStyle, labelStyle, primaryButtonStyle } from './formStyles';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  }

  return (
    <AuthLayout>
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Mot de passe oublié</h1>
      {sent ? (
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--sg-text-muted)' }}>
          Si un compte existe pour {email}, un lien de réinitialisation a été envoyé.
        </p>
      ) : (
        <>
          <p style={{ margin: '0 0 20px', fontSize: 13.5, color: 'var(--sg-text-muted)' }}>
            Entrez votre courriel pour recevoir un lien de réinitialisation.
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={labelStyle}>
              Courriel
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
            </label>
            <button type="submit" disabled={submitting} style={primaryButtonStyle}>
              {submitting ? 'Envoi…' : 'Envoyer le lien'}
            </button>
          </form>
        </>
      )}
      <div style={{ marginTop: 18, fontSize: 12.5 }}>
        <Link to="/connexion">Retour à la connexion</Link>
      </div>
    </AuthLayout>
  );
}
