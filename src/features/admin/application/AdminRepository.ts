import type { AuditEvent, OrganizationDetail, OrganizationSummary, PilotMetrics, PlanPrice, Site, Subscription } from '../domain/admin';

export interface AdminRepository {
  listPlanPrices: () => Promise<PlanPrice[]>;
  getSubscription: (organizationId: string) => Promise<Subscription | null>;
  createCheckoutLink: (organizationId: string, stripePriceId: string) => Promise<string>;
  listSites: (organizationId: string) => Promise<Site[]>;
  createSite: (organizationId: string, name: string, allowedOrigins: string[]) => Promise<{ siteId: string; secret: string }>;
  rotateSiteKey: (siteId: string) => Promise<{ secret: string }>;
  setSiteStatus: (siteId: string, status: 'active' | 'suspended' | 'revoked', reason: string) => Promise<void>;
  testSiteIntegration: (siteId: string) => Promise<{ submissionId: string }>;
  getStaffRole: () => Promise<string | null>;
  listOrganizations: () => Promise<OrganizationSummary[]>;
  getOrganizationDetail: (organizationId: string) => Promise<OrganizationDetail | null>;
  setOrganizationStatus: (organizationId: string, status: 'active' | 'suspended', reason: string) => Promise<void>;
  setProjectStatus: (projectId: string, status: string, reason: string) => Promise<void>;
  setStepStatus: (stepId: string, status: string) => Promise<void>;
  updateMembership: (membershipId: string, role: string, status: string, reason: string) => Promise<void>;
  listAuditEvents: () => Promise<AuditEvent[]>;
  revokeUserSessions: (userId: string, reason: string) => Promise<void>;
  getPilotMetrics: () => Promise<PilotMetrics>;
}
