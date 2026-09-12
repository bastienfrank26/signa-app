// Révoque toutes les sessions actives d'un utilisateur (doc 09-SECURITE :
// "expiration/révocation des sessions"). Réservé au personnel Signa
// (operations/super_admin). L'API admin GoTrue n'est accessible qu'avec le
// rôle de service, d'où l'Edge Function plutôt qu'un RPC Postgres.

import { createClient } from '@supabase/supabase-js';

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'SERVER_CONFIGURATION_MISSING' }), { status: 500 });
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: request.headers.get('Authorization') ?? '' } },
  });
  const { data: staffRole } = await callerClient.rpc('current_staff_role');
  if (staffRole !== 'operations' && staffRole !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'FORBIDDEN' }), { status: 403 });
  }

  let body: { userId?: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'INVALID_REQUEST' }), { status: 400 });
  }
  if (!body.userId || !body.reason?.trim()) {
    return new Response(JSON.stringify({ error: 'INVALID_REQUEST' }), { status: 400 });
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { error: signOutError } = await serviceClient.auth.admin.signOut(body.userId, 'global');
  if (signOutError) {
    return new Response(JSON.stringify({ error: 'REVOKE_FAILED', detail: signOutError.message }), { status: 502 });
  }

  const { data: caller } = await callerClient.auth.getUser();
  await serviceClient.from('audit_events').insert({
    actor_user_id: caller.user?.id,
    action: 'user.sessions_revoked',
    target_type: 'user',
    target_id: body.userId,
    reason: body.reason.trim(),
  });

  return new Response(JSON.stringify({ status: 'revoked' }), { status: 200 });
});
