import { useEffect, useState } from 'react';
import { supabase } from '../../../infrastructure/supabase/client';
import { createSupabaseCrmRepository } from '../infrastructure/supabase/SupabaseCrmRepository';
import type { OrgMember } from '../domain/crm';

const repository = createSupabaseCrmRepository(supabase);

/** Résout un `owner_user_id` en courriel affichable — les membres ne sont pas visibles ailleurs que via l'annuaire de leur organisation. */
export function useOrgMembers(organizationId: string | null) {
  const [members, setMembers] = useState<OrgMember[]>([]);

  useEffect(() => {
    if (!organizationId) return;
    void repository.listOrgMembers(organizationId).then(setMembers);
  }, [organizationId]);

  function emailOf(userId: string | null): string | null {
    if (!userId) return null;
    return members.find((m) => m.userId === userId)?.email ?? null;
  }

  return { members, emailOf };
}
