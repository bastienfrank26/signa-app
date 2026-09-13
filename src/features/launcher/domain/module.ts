export interface SignaModule {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  appUrl: string | null;
  status: 'active' | 'coming_soon' | 'disabled';
  requiredPlan: 'presence' | 'entreprise';
  included: boolean;
}
