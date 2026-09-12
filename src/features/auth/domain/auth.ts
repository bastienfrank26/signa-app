export const membershipRoles = ['owner', 'admin', 'member', 'readonly'] as const;
export type MembershipRole = (typeof membershipRoles)[number];

export interface Membership {
  organizationId: string;
  organizationName: string;
  role: MembershipRole;
}

export interface AppSession {
  authUserId: string;
  email: string;
  memberships: Membership[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type AuthFailureCode = 'INVALID_CREDENTIALS' | 'UNEXPECTED';

export class AuthFailure extends Error {
  constructor(
    public readonly code: AuthFailureCode,
    message: string,
  ) {
    super(message);
    this.name = 'AuthFailure';
  }
}

export function isOrgAdmin(role: MembershipRole): boolean {
  return role === 'owner' || role === 'admin';
}
