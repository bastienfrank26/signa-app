import type { AuditEvent, OrganizationDetail, OrganizationSummary } from '../domain/admin';

export interface AdminRepository {
  getStaffRole: () => Promise<string | null>;
  listOrganizations: () => Promise<OrganizationSummary[]>;
  getOrganizationDetail: (organizationId: string) => Promise<OrganizationDetail | null>;
  setOrganizationStatus: (organizationId: string, status: 'active' | 'suspended', reason: string) => Promise<void>;
  setProjectStatus: (projectId: string, status: string, reason: string) => Promise<void>;
  setStepStatus: (stepId: string, status: string) => Promise<void>;
  updateMembership: (membershipId: string, role: string, status: string, reason: string) => Promise<void>;
  listAuditEvents: () => Promise<AuditEvent[]>;
}
