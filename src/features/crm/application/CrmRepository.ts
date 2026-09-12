import type { Contact, ContactDetail, CrmBundle, NewContactInput, NewProspectInput } from '../domain/crm';

export interface CrmRepository {
  getBundle: (organizationId: string) => Promise<CrmBundle>;
  createProspect: (organizationId: string, input: NewProspectInput) => Promise<void>;
  moveStage: (opportunityId: string, stageId: string) => Promise<void>;
  addActivityNote: (organizationId: string, opportunityId: string, contactId: string, note: string) => Promise<void>;
  toggleTask: (taskId: string, done: boolean) => Promise<void>;
  listContacts: (organizationId: string) => Promise<Contact[]>;
  createContact: (organizationId: string, input: NewContactInput) => Promise<void>;
  getContactDetail: (contactId: string) => Promise<ContactDetail>;
  addContactNote: (organizationId: string, contactId: string, note: string) => Promise<void>;
}
