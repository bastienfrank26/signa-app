export const staffRoles = ['support', 'operations', 'billing_admin', 'super_admin'] as const;
export type StaffRole = (typeof staffRoles)[number];

export function canAdminister(role: StaffRole | null): boolean {
  return role === 'operations' || role === 'super_admin';
}

export const organizationStatuses = ['active', 'suspended'] as const;
export type OrganizationStatus = (typeof organizationStatuses)[number];

export interface OrganizationSummary {
  id: string;
  name: string;
  status: OrganizationStatus;
  memberCount: number;
  projectStatus: string | null;
}

export interface MembershipRow {
  id: string;
  userId: string;
  email: string;
  role: string;
  status: string;
}

export interface ProjectStepRow {
  id: string;
  stepKey: string;
  label: string;
  position: number;
  status: string;
}

export interface OrganizationDetail {
  id: string;
  name: string;
  status: OrganizationStatus;
  memberships: MembershipRow[];
  project: { id: string; status: string } | null;
  steps: ProjectStepRow[];
}

export const siteStatuses = ['active', 'suspended', 'revoked'] as const;
export type SiteStatus = (typeof siteStatuses)[number];

export interface Site {
  id: string;
  name: string;
  status: SiteStatus;
  allowedOrigins: string[];
  keyPrefix: string | null;
}

export interface PlanPrice {
  id: string;
  stripePriceId: string;
  commitment: 'annual' | 'none';
  unitAmountCents: number;
}

export interface Subscription {
  status: string;
  commitment: 'annual' | 'none' | null;
  unitAmountCents: number | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface AuditEvent {
  id: string;
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  createdAt: string;
}
