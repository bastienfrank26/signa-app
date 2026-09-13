import { supabase } from '../supabase/client';

const baseUrl = import.meta.env.VITE_SIGNA_CORE_URL as string;

if (!baseUrl) {
  throw new Error('VITE_SIGNA_CORE_URL doit être défini (.env.local)');
}

export class SignaCoreError extends Error {}

export async function signaCoreFetch<T>(path: string): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new SignaCoreError('Session absente.');

  const res = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new SignaCoreError(`signa-core a répondu ${res.status} pour ${path}`);
  }

  return (await res.json()) as T;
}
