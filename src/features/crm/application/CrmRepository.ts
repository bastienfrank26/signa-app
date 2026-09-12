import type { CrmBundle, NewProspectInput } from '../domain/crm';

export interface CrmRepository {
  getBundle: (organizationId: string) => Promise<CrmBundle>;
  createProspect: (organizationId: string, input: NewProspectInput) => Promise<void>;
  moveStage: (opportunityId: string, stageId: string) => Promise<void>;
  addActivityNote: (organizationId: string, opportunityId: string, contactId: string, note: string) => Promise<void>;
  toggleTask: (taskId: string, done: boolean) => Promise<void>;
}
