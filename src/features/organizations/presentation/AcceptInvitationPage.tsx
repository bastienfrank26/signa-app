import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../infrastructure/supabase/client';
import { createSupabaseOrganizationRepository } from '../infrastructure/supabase/SupabaseOrganizationRepository';
import { useAuth } from '@signa/sdk';
import { primaryButtonStyle } from '../../auth/presentation/formStyles';

const repository = createSupabaseOrganizationRepository(supabase);

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { refreshSession } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error' | 'done'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Lien d’invitation invalide : aucun jeton fourni.');
      return;
    }
    let cancelled = false;
    void repository
      .acceptInvitation(token)
      .then(async () => {
        await refreshSession();
        if (!cancelled) setStatus('done');
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'L’invitation n’a pas pu être acceptée.');
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (status === 'done') {
      const t = setTimeout(() => navigate('/', { replace: true }), 1200);
      return () => clearTimeout(t);
    }
  }, [status, navigate]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sg-cream-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 'min(420px,100%)', background: '#fff', border: '1px solid var(--sg-border)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <h1 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>Traitement de l'invitation…</h1>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--sg-text-muted)' }}>Un instant.</p>
          </>
        )}
        {status === 'done' && (
          <>
            <h1 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>Bienvenue chez Signa !</h1>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--sg-text-muted)' }}>Accès accordé. Redirection…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>Invitation impossible</h1>
            <p style={{ margin: '0 0 20px', fontSize: 13.5, color: 'var(--sg-danger)' }}>{error}</p>
            <button onClick={() => navigate('/')} style={primaryButtonStyle}>
              Retour à l'accueil
            </button>
          </>
        )}
      </div>
    </div>
  );
}
