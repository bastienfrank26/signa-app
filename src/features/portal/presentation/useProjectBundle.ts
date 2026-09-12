import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../infrastructure/supabase/client';
import { createSupabaseProjectRepository } from '../infrastructure/supabase/SupabaseProjectRepository';
import type { ProjectBundle } from '../domain/project';

const repository = createSupabaseProjectRepository(supabase);

export function useProjectBundle(organizationId: string | null) {
  const [bundle, setBundle] = useState<ProjectBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!organizationId) {
      setBundle(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await repository.getBundle(organizationId);
      setBundle(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { bundle, loading, error, reload, repository };
}
