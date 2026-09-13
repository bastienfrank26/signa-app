import { createSupabaseClient } from '@signa/sdk';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !publishableKey) {
  throw new Error('VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY doivent être définis (.env.local)');
}

export const supabase = createSupabaseClient({ url, publishableKey });
