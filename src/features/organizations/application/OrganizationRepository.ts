export interface OrganizationRepository {
  acceptInvitation: (token: string) => Promise<void>;
}
