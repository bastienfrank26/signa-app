import { useEffect, useState } from 'react';
import { useAuth } from '@signa/sdk';
import { fetchModules } from '../infrastructure/signaCore/SignaCoreModulesGateway';
import type { SignaModule } from '../domain/module';

interface ModulesState {
  modules: SignaModule[];
  loading: boolean;
  error: string | null;
}

export function useModules(): ModulesState {
  const { session } = useAuth();
  const organizationId = session?.memberships[0]?.organizationId ?? null;
  const [state, setState] = useState<ModulesState>({ modules: [], loading: true, error: null });

  useEffect(() => {
    if (!organizationId) {
      setState({ modules: [], loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchModules(organizationId)
      .then((modules) => {
        if (!cancelled) setState({ modules, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ modules: [], loading: false, error: err instanceof Error ? err.message : 'Le catalogue n’a pas pu être chargé.' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  return state;
}
