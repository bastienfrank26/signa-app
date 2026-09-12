// Webhook Stripe entrant (doc 10-ABONNEMENTS-ET-PAIEMENTS.md). Signature
// vérifiée sur le corps brut, événement stocké de façon idempotente avant
// tout traitement, jamais de journalisation de secret ou de carte.
//
// Déploiement : `supabase functions deploy stripe-webhook --no-verify-jwt`
// (Stripe n'est pas un utilisateur Supabase authentifié).

import { createClient } from '@supabase/supabase-js';

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function signatureIsValid(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = header.split(',').map((p) => p.split('=', 2));
  const timestamp = parts.find(([k]) => k === 't')?.[1];
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(signed), (b) => b.toString(16).padStart(2, '0')).join('');
  return signatures.some((s) => safeEqual(s, expected));
}

interface StripeSubscriptionLike {
  id: string;
  customer: string;
  status: string;
  current_period_end?: number;
  cancel_at_period_end: boolean;
  metadata?: { organization_id?: string };
  items: { data: Array<{ price: { id: string }; current_period_end?: number }> };
}

async function upsertSubscription(supabase: ReturnType<typeof createClient>, sub: StripeSubscriptionLike) {
  const organizationId = sub.metadata?.organization_id;
  if (!organizationId) return; // événement hors périmètre Signa (pas notre metadata)

  const item = sub.items?.data?.[0];
  const priceId = item?.price?.id ?? null;
  let planPriceId: string | null = null;
  if (priceId) {
    const { data } = await supabase.from('plan_prices').select('id').eq('stripe_price_id', priceId).maybeSingle();
    planPriceId = (data?.id as string) ?? null;
  }

  // Stripe a déplacé current_period_end de la subscription vers l'item de
  // subscription dans les versions d'API récentes ; on couvre les deux.
  const periodEndSeconds = item?.current_period_end ?? sub.current_period_end ?? null;

  await supabase.from('subscriptions').upsert(
    {
      organization_id: organizationId,
      stripe_customer_id: sub.customer,
      stripe_subscription_id: sub.id,
      plan_price_id: planPriceId,
      status: sub.status,
      current_period_end: periodEndSeconds ? new Date(periodEndSeconds * 1000).toISOString() : null,
      cancel_at_period_end: sub.cancel_at_period_end,
    },
    { onConflict: 'organization_id' },
  );
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const secret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!secret || !supabaseUrl || !serviceRoleKey) return new Response('Configuration missing', { status: 500 });

  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';
  if (!(await signatureIsValid(payload, signature, secret))) {
    return new Response(JSON.stringify({ error: 'INVALID_SIGNATURE' }), { status: 400 });
  }

  let event: { id: string; type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response(JSON.stringify({ error: 'INVALID_PAYLOAD' }), { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  // Idempotence : un événement déjà stocké n'est jamais retraité, mais
  // Stripe reçoit quand même un 200 (sinon il continue de réessayer).
  const { data: existing } = await supabase
    .from('billing_events')
    .select('id, processed_at')
    .eq('stripe_event_id', event.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from('billing_events').insert({ stripe_event_id: event.id, event_type: event.type, payload: event as unknown as object });
  } else if (existing.processed_at) {
    return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
  }

  try {
    if (event.type.startsWith('customer.subscription.')) {
      await upsertSubscription(supabase, event.data.object as unknown as StripeSubscriptionLike);
    }
    // checkout.session.completed n'est pas traité séparément : la
    // subscription_data.metadata propagée à la Subscription créée déclenche
    // de toute façon un customer.subscription.created juste après.
  } catch (err) {
    // L'événement reste marqué reçu (billing_events) mais non traité
    // (processed_at nul) : Stripe réessaiera, sans jamais dupliquer l'insert.
    console.error('stripe-webhook processing error', err);
    return new Response(JSON.stringify({ received: true, error: 'PROCESSING_FAILED' }), { status: 200 });
  }

  await supabase.from('billing_events').update({ processed_at: new Date().toISOString() }).eq('stripe_event_id', event.id);
  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
