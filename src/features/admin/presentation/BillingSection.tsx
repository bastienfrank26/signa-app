import { useEffect, useState } from 'react';
import { adminRepository } from './useStaffRole';
import type { PlanPrice, Subscription } from '../domain/admin';

const cardStyle = { borderRadius: 14, background: '#fff', border: '1px solid var(--sg-border)', padding: 20 } as const;

const statusLabels: Record<string, string> = {
  incomplete: 'Incomplet',
  incomplete_expired: 'Incomplet (expiré)',
  trialing: 'Période d’essai',
  active: 'Actif',
  past_due: 'Paiement en retard',
  canceled: 'Annulé',
  unpaid: 'Impayé',
  paused: 'En pause',
};

function money(cents: number): string {
  return (cents / 100).toLocaleString('fr-CA') + ' $';
}

export default function BillingSection({ organizationId }: { organizationId: string }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [prices, setPrices] = useState<PlanPrice[]>([]);
  const [selectedPriceId, setSelectedPriceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([adminRepository.getSubscription(organizationId), adminRepository.listPlanPrices()])
      .then(([sub, planPrices]) => {
        setSubscription(sub);
        setPrices(planPrices);
        setSelectedPriceId(planPrices[0]?.id ?? '');
      })
      .finally(() => setLoading(false));
  }, [organizationId]);

  async function handleCreateLink() {
    const price = prices.find((p) => p.id === selectedPriceId);
    if (!price) return;
    setCreating(true);
    setError(null);
    setLink(null);
    try {
      const url = await adminRepository.createCheckoutLink(organizationId, price.stripePriceId);
      setLink(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <section style={cardStyle}>
      <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800 }}>Abonnement</h3>
      {loading ? (
        <div style={{ color: 'var(--sg-text-muted)', fontSize: 13 }}>Chargement…</div>
      ) : subscription ? (
        <div style={{ fontSize: 13.5, marginBottom: 16 }}>
          <div>
            Statut : <strong>{statusLabels[subscription.status] ?? subscription.status}</strong>
          </div>
          {subscription.unitAmountCents != null && (
            <div style={{ color: 'var(--sg-text-muted)' }}>
              {money(subscription.unitAmountCents)}/mois · {subscription.commitment === 'annual' ? 'engagement annuel' : 'sans engagement'}
            </div>
          )}
          {subscription.currentPeriodEnd && (
            <div style={{ color: 'var(--sg-text-muted)' }}>
              Prochaine facturation : {new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-CA')}
              {subscription.cancelAtPeriodEnd ? ' (annulation prévue)' : ''}
            </div>
          )}
        </div>
      ) : (
        <div style={{ color: 'var(--sg-text-muted)', fontSize: 13, marginBottom: 16 }}>Aucun abonnement.</div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={selectedPriceId} onChange={(e) => setSelectedPriceId(e.target.value)} style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', fontSize: 13.5 }}>
          {prices.map((p) => (
            <option key={p.id} value={p.id}>
              {money(p.unitAmountCents)}/mois · {p.commitment === 'annual' ? 'engagement annuel' : 'sans engagement'}
            </option>
          ))}
        </select>
        <button
          onClick={() => void handleCreateLink()}
          disabled={creating || !selectedPriceId}
          style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#0F1B2D', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          {creating ? 'Création…' : 'Créer un lien de paiement'}
        </button>
      </div>
      {error && <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--sg-danger)' }}>{error}</div>}
      {link && (
        <div style={{ marginTop: 12, padding: 12, background: '#FAF8F4', borderRadius: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Lien à transmettre au client :</div>
          <code style={{ fontSize: 12, wordBreak: 'break-all' }}>{link}</code>
        </div>
      )}
    </section>
  );
}
