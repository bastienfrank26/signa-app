import { useEffect, useState } from 'react';
import { supabase } from '../../../infrastructure/supabase/client';
import { createSupabaseAdminRepository } from '../infrastructure/supabase/SupabaseAdminRepository';

const repository = createSupabaseAdminRepository(supabase);

export function useStaffRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void repository
      .getStaffRole()
      .then((r) => {
        if (active) setRole(r);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { role, loading };
}

export { repository as adminRepository };
