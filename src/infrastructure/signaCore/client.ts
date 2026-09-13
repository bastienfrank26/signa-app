import { createSignaCoreClient } from '@signa/sdk';
import { supabase } from '../supabase/client';

const baseUrl = import.meta.env.VITE_SIGNA_CORE_URL as string;

if (!baseUrl) {
  throw new Error('VITE_SIGNA_CORE_URL doit être défini (.env.local)');
}

export const signaCore = createSignaCoreClient({ baseUrl, supabase });
