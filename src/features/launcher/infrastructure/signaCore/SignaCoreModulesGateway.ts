import { signaCore } from '../../../../infrastructure/signaCore/client';
import type { SignaModule } from '../../domain/module';

interface ModulesResponse {
  modules: Array<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    icon: string | null;
    app_url: string | null;
    status: 'active' | 'coming_soon' | 'disabled';
    required_plan: 'presence' | 'entreprise';
    included?: boolean;
  }>;
}

export async function fetchModules(organizationId: string): Promise<SignaModule[]> {
  const res = await signaCore.get<ModulesResponse>(`/api/v1/modules?organizationId=${encodeURIComponent(organizationId)}`);
  return res.modules.map((m) => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    description: m.description,
    icon: m.icon,
    appUrl: m.app_url,
    status: m.status,
    requiredPlan: m.required_plan,
    included: m.included ?? false,
  }));
}
