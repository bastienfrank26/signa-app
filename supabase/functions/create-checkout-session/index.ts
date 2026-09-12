// Génère un lien de paiement Stripe Checkout pour une organisation (doc 10 :
// "Le client choisit engagement et module principal" ; en pratique pour le
// MVP, c'est le personnel Signa qui génère le lien et le transmet). Réservé
// aux rôles internes operations/super_admin.
//
// Déploiement : `supabase functions deploy create-checkout-session` (avec
// vérification du JWT Supabase — l'appelant est un membre du personnel
// Signa authentifié, pas un visiteur anonyme).

import { createClient } from '@supabase/supabase-js';

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const appUrl = Deno.env.get('APP_URL') ?? 'https://app.signaweb.ca';
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !stripeSecretKey) {
    return new Response(JSON.stringify({ error: 'SERVER_CONFIGURATION_MISSING' }), { status: 500 });
  }

  // Le client "au nom de l'appelant" respecte la RLS et sert uniquement à
  // vérifier son rôle interne — jamais à lire les données d'autrui.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: request.headers.get('Authorization') ?? '' } },
  });
  const { data: staffRole } = await callerClient.rpc('current_staff_role');
  if (staffRole !== 'operations' && staffRole !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'FORBIDDEN' }), { status: 403 });
  }

  let body: { organizationId?: string; stripePriceId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'INVALID_REQUEST' }), { status: 400 });
  }
  if (!body.organizationId || !body.stripePriceId) {
    return new Response(JSON.stringify({ error: 'INVALID_REQUEST' }), { status: 400 });
  }

  // Le rôle de service n'a pas de session utilisateur : les RPC gardées par
  // is_internal_staff()/auth.uid() renvoient toujours vide pour lui. On lit
  // donc directement memberships + auth.users (le rôle de service contourne
  // la RLS de toute façon).
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: ownerMembership } = await serviceClient
    .from('memberships')
    .select('user_id')
    .eq('organization_id', body.organizationId)
    .eq('role', 'owner')
    .maybeSingle();
  let ownerEmailAddress: string | null = null;
  if (ownerMembership?.user_id) {
    const { data: ownerUser } = await serviceClient.auth.admin.getUserById(ownerMembership.user_id as string);
    ownerEmailAddress = ownerUser?.user?.email ?? null;
  }

  const params = new URLSearchParams();
  params.set('mode', 'subscription');
  params.set('line_items[0][price]', body.stripePriceId);
  params.set('line_items[0][quantity]', '1');
  params.set('success_url', `${appUrl}/?paiement=succes`);
  params.set('cancel_url', `${appUrl}/?paiement=annule`);
  params.set('metadata[organization_id]', body.organizationId);
  params.set('subscription_data[metadata][organization_id]', body.organizationId);
  if (ownerEmailAddress) params.set('customer_email', ownerEmailAddress);

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  const session = await stripeRes.json();
  if (!stripeRes.ok) {
    return new Response(JSON.stringify({ error: 'STRIPE_ERROR', detail: session?.error?.message }), { status: 502 });
  }

  return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
