import type {
  Contact,
  ContactDetail,
  ContactFile,
  CrmBundle,
  DuplicateContactMatch,
  NewContactInput,
  NewProspectInput,
  NewTaskInput,
  OrgMember,
} from '../domain/crm';

export interface CrmRepository {
  getBundle: (organizationId: string) => Promise<CrmBundle>;
  createProspect: (organizationId: string, input: NewProspectInput) => Promise<void>;
  moveStage: (opportunityId: string, stageId: string) => Promise<void>;
  addActivityNote: (organizationId: string, opportunityId: string, contactId: string, note: string) => Promise<void>;
  toggleTask: (taskId: string, done: boolean) => Promise<void>;
  createTask: (organizationId: string, input: NewTaskInput) => Promise<void>;
  listContacts: (organizationId: string) => Promise<Contact[]>;
  createContact: (organizationId: string, input: NewContactInput) => Promise<void>;
  getContactDetail: (contactId: string) => Promise<ContactDetail>;
  addContactNote: (organizationId: string, contactId: string, note: string) => Promise<void>;
  listOrgMembers: (organizationId: string) => Promise<OrgMember[]>;
  findDuplicateContact: (organizationId: string, email?: string, phone?: string) => Promise<DuplicateContactMatch | null>;
  listContactFiles: (contactId: string) => Promise<ContactFile[]>;
  uploadContactFile: (organizationId: string, contactId: string, file: File) => Promise<void>;
  getContactFileUrl: (storagePath: string) => Promise<string>;
}
