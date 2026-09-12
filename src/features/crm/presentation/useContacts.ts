import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../infrastructure/supabase/client';
import { createSupabaseCrmRepository } from '../infrastructure/supabase/SupabaseCrmRepository';
import type { Contact, NewContactInput } from '../domain/crm';

const repository = createSupabaseCrmRepository(supabase);

export function useContacts(organizationId: string | null) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!organizationId) {
      setContacts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await repository.listContacts(organizationId);
      setContacts(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createContact = useCallback(
    async (input: NewContactInput) => {
      if (!organizationId) return;
      await repository.createContact(organizationId, input);
      await reload();
    },
    [organizationId, reload],
  );

  return { contacts, loading, error, reload, createContact, repository };
}
