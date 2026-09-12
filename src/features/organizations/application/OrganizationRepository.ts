import type { Organization } from '../domain/organization';

export interface OrganizationRepository {
  create: (name: string) => Promise<Organization>;
  acceptInvitation: (token: string) => Promise<void>;
}
