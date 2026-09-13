// Point d'entrée public des formulaires des sites clients (doc
// 07-INTEGRATION-DES-SITES.md). Chemin : POST /functions/v1/site-submissions/{siteId}
//
// Déploiement : `supabase functions deploy site-submissions --no-verify-jwt`,
// car l'appelant est le navigateur d'un visiteur du site client, jamais un
// utilisateur Supabase authentifié. L'authentification se fait par la clé de
// site (`X-Signa-Site-Key`), vérifiée ici par hachage — jamais par un jeton
// Supabase. Même patron que `capture-lead` (reca-app-v3) : validation stricte,
// délégation de l'écriture à une fonction Postgres exécutée avec le rôle de
// service, et une réponse qui ne distingue jamais un succès d'une répétition
// idempotente pour l'appelant.

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const MAX_BODY_BYTES = 16 * 1024;

const requestSchema = z
  .object({
    formKey: z.string().trim().min(1).max(100),
    idempotencyKey: z.string().trim().min(1).max(200),
    contact: z
      .object({
        name: z.string().trim().min(1).max(200),
        email: z.string().trim().email().max(200).optional(),
        phone: z.string().trim().max(40).optional(),
      })
      .refine((v) => Boolean(v.email ?? v.phone), { message: 'CONTACT_REQUIRED' }),
    message: z.string().trim().max(2000).optional(),
    consent: z.object({
      privacy: z.boolean(),
      marketing: z.boolean().optional(),
    }),
    context: z
      .object({
        pageUrl: z.string().trim().max(500).optional(),
        utmSource: z.string().trim().max(100).optional(),
        utmMedium: z.string().trim().max(100).optional(),
        utmCampaign: z.string().trim().max(100).optional(),
        utmContent: z.string().trim().max(100).optional(),
        utmTerm: z.string().trim().max(100).optional(),
      })
      .optional(),
    // Champ piège : un formulaire humain le laisse vide.
    website: z.string().max(200).optional(),
  })
  .strict();

function extractSiteId(url: URL): string | null {
  const parts = url.pathname.split('/').filter(Boolean);
  const id = parts[parts.length - 1];
  return id && id !== 'site-submissions' ? id : null;
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Vary: 'Origin',
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

Deno.serve(async (request) => {
  const url = new URL(request.url);
  const siteId = extractSiteId(url);
  const requestOrigin = request.headers.get('origin');

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'SERVER_CONFIGURATION_MISSING' }, 500, null);
  }
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  if (!siteId) return json({ error: 'SITE_NOT_FOUND' }, 404, requestOrigin);

  const { data: site } = await serviceClient
    .from('sites')
    .select('id, status, allowed_origins')
    .eq('id', siteId)
    .maybeSingle();

  // L'origine autorisée fait partie de la réponse CORS même pour un site
  // introuvable ou suspendu : sinon le préflight échoue avant même que le
  // corps de la réponse (qui, lui, ne révèle rien de plus) ne soit lu.
  const allowedOrigin =
    requestOrigin && site?.allowed_origins?.includes(requestOrigin) ? requestOrigin : null;

  if (request.method === 'OPTIONS') {
    if (!allowedOrigin) return json({ error: 'ORIGIN_NOT_ALLOWED' }, 403, null);
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'content-type, x-signa-site-key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
      },
    });
  }
  if (request.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405, allowedOrigin);
  if (!site || site.status !== 'active') return json({ error: 'SITE_NOT_FOUND' }, 404, allowedOrigin);
  if (requestOrigin && !allowedOrigin) return json({ error: 'ORIGIN_NOT_ALLOWED' }, 403, null);

  const providedKey = request.headers.get('x-signa-site-key');
  if (!providedKey) return json({ error: 'UNAUTHORIZED' }, 401, allowedOrigin);

  const { data: apiKey } = await serviceClient
    .from('api_keys')
    .select('key_hash')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!apiKey || !safeEqual(await sha256Hex(providedKey), apiKey.key_hash)) {
    return json({ error: 'UNAUTHORIZED' }, 401, allowedOrigin);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: 'PAYLOAD_TOO_LARGE' }, 413, allowedOrigin);

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(raw || 'null');
  } catch {
    return json({ error: 'INVALID_REQUEST' }, 400, allowedOrigin);
  }
  const parsed = requestSchema.safeParse(parsedBody);
  if (!parsed.success) return json({ error: 'INVALID_REQUEST' }, 400, allowedOrigin);

  if (!parsed.data.consent.privacy) {
    return json({ error: 'CONSENT_REQUIRED' }, 400, allowedOrigin);
  }

  // Un robot ayant rempli le champ piège reçoit une réponse indiscernable
  // d'un succès, sans qu'aucune donnée ne soit enregistrée.
  if (parsed.data.website && parsed.data.website.trim() !== '') {
    return json({ status: 'accepted' }, 202, allowedOrigin);
  }

  const { website: _honeypot, ...command } = parsed.data;
  const capture = await serviceClient.rpc('capture_site_submission_v1', {
    p_site_id: siteId,
    p_command: command,
  });

  if (capture.error) {
    if (capture.error.message.includes('SITE_NOT_FOUND')) return json({ error: 'SITE_NOT_FOUND' }, 404, allowedOrigin);
    if (capture.error.message.includes('RATE_LIMITED')) return json({ error: 'RATE_LIMITED' }, 429, allowedOrigin);
    return json({ error: 'SUBMISSION_FAILED' }, 502, allowedOrigin);
  }

  const submissionId = (capture.data as { submissionId?: string } | null)?.submissionId ?? null;
  return json({ status: 'accepted', submissionId }, 202, allowedOrigin);
});
