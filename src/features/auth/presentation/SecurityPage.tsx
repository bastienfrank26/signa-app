import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../infrastructure/supabase/client';
import { fieldStyle, labelStyle, primaryButtonStyle } from './formStyles';

interface Factor {
  id: string;
  friendlyName?: string;
  status: string;
}

export default function SecurityPage() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    setLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []).map((f) => ({ id: f.id, friendlyName: f.friendly_name, status: f.status })));
    setLoading(false);
  }

  useEffect(() => {
    void reload();
  }, []);

  async function startEnroll() {
    setError(null);
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (enrollError || !data) {
      setError(enrollError?.message ?? 'Impossible de démarrer l’activation.');
      return;
    }
    setEnrolling({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  }

  async function confirmEnroll() {
    if (!enrolling) return;
    setBusy(true);
    setError(null);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: enrolling.factorId });
      if (challengeError || !challenge) throw new Error(challengeError?.message ?? 'Échec.');
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrolling.factorId,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (verifyError) throw new Error('Code invalide. Réessayez.');
      setEnrolling(null);
      setCode('');
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la vérification.');
    } finally {
      setBusy(false);
    }
  }

  async function removeFactor(factorId: string) {
    setBusy(true);
    try {
      await supabase.auth.mfa.unenroll({ factorId });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  const verifiedFactor = factors.find((f) => f.status === 'verified');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sg-cream-50)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <Link to="/" style={{ fontSize: 13, color: 'var(--sg-text-muted)' }}>
          ← Retour
        </Link>
        <h1 style={{ margin: '10px 0 20px', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>Sécurité du compte</h1>

        <div style={{ background: '#fff', border: '1px solid var(--sg-border)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800 }}>Authentification à deux facteurs</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--sg-text-muted)' }}>
            Ajoute une étape de vérification (application d'authentification) à la connexion.
          </p>

          {loading ? (
            <div style={{ color: 'var(--sg-text-muted)', fontSize: 13 }}>Chargement…</div>
          ) : verifiedFactor ? (
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1F7A5C', marginBottom: 12 }}>Activée</div>
              <button
                onClick={() => void removeFactor(verifiedFactor.id)}
                disabled={busy}
                style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #E7D3CF', background: '#fff', color: '#C0392B', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Désactiver
              </button>
            </div>
          ) : enrolling ? (
            <div>
              <p style={{ fontSize: 13, marginBottom: 10 }}>Scannez ce code avec votre application (Google Authenticator, 1Password, etc.) :</p>
              <img src={enrolling.qrCode} alt="Code QR d'activation" style={{ display: 'block', marginBottom: 12, width: 200, height: 200 }} />
              <p style={{ fontSize: 12, color: 'var(--sg-text-muted)', marginBottom: 12 }}>
                Ou entrez cette clé manuellement : <code>{enrolling.secret}</code>
              </p>
              <label style={labelStyle}>
                Code à 6 chiffres
                <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} style={fieldStyle} />
              </label>
              {error && <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--sg-danger)', fontWeight: 600 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button onClick={() => void confirmEnroll()} disabled={busy || code.length !== 6} style={primaryButtonStyle}>
                  Confirmer
                </button>
                <button
                  onClick={() => {
                    setEnrolling(null);
                    setError(null);
                  }}
                  style={{ padding: '0 16px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => void startEnroll()} style={primaryButtonStyle}>
              Activer
            </button>
          )}
          {error && !enrolling && <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--sg-danger)' }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
