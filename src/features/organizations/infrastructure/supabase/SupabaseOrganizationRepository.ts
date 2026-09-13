import type { SupabaseClient } from '@supabase/supabase-js';
import type { OrganizationRepository } from '../../application/OrganizationRepository';

export function createSupabaseOrganizationRepository(client: SupabaseClient): OrganizationRepository {
  return {
    async acceptInvitation(token: string) {
      const { error } = await client.rpc('accept_invitation', { p_token: token });
      if (error) throw new Error(error.message);
    },
  };
}
