import type { SupabaseClient } from '@supabase/supabase-js';
import type { OrganizationRepository } from '../../application/OrganizationRepository';

export function createSupabaseOrganizationRepository(client: SupabaseClient): OrganizationRepository {
  return {
    async create(name: string) {
      const { data, error } = await client.from('organizations').insert({ name }).select('id, name').single();
      if (error || !data) {
        throw new Error('La création de l’organisation a échoué. Réessayez.');
      }
      return { id: data.id as string, name: data.name as string };
    },

    async acceptInvitation(token: string) {
      const { error } = await client.rpc('accept_invitation', { p_token: token });
      if (error) throw new Error(error.message);
    },
  };
}
