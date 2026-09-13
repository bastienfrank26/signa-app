import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseRuntimeConfig {
  url: string;
  publishableKey: string;
}

// Session stockée en cookie (pas localStorage) pour être visible par toutes
// les applications Signa sous *.signaweb.ca (signa-docs Phase 2 — SSO).
// En local (localhost), le domaine du cookie est omis : un domaine ne
// correspondant pas à l'hôte courant serait simplement ignoré par le
// navigateur, ce qui casserait la persistance de session en dev.
function sharedCookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.location.hostname.endsWith('signaweb.ca') ? '.signaweb.ca' : undefined;
}

export function createSupabaseClient(config: SupabaseRuntimeConfig): SupabaseClient {
  return createBrowserClient(config.url, config.publishableKey, {
    cookieOptions: {
      domain: sharedCookieDomain(),
      path: '/',
      sameSite: 'lax',
      secure: typeof window === 'undefined' ? true : window.location.protocol === 'https:',
    },
  });
}

const url = import.meta.env.VITE_SUPABASE_URL as string;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !publishableKey) {
  throw new Error('VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY doivent être définis (.env.local)');
}

export const supabase = createSupabaseClient({ url, publishableKey });
