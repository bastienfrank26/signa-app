export interface Stage {
  id: string;
  key: string;
  label: string;
  position: number;
  isWon: boolean;
  isLost: boolean;
}

export type LifecycleStatus = 'prospect' | 'client' | 'inactive';

export interface Prospect {
  id: string;
  contactId: string;
  name: string;
  company: string;
  need: string;
  valueCents: number;
  stageId: string;
  source: string;
  email: string;
  phone: string;
  nextFollowUpAt: string | null;
  ownerUserId: string | null;
  lifecycleStatus: LifecycleStatus;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  wonAt: string | null;
  lostAt: string | null;
}

export interface ActivityItem {
  id: string;
  opportunityId: string | null;
  contactName: string | null;
  note: string;
  activityType: string;
  createdAt: string;
}

export interface Task {
  id: string;
  label: string;
  description: string;
  dueDate: string | null;
  urgent: boolean;
  done: boolean;
}

export interface CrmBundle {
  stages: Stage[];
  prospects: Prospect[];
  activities: ActivityItem[];
  tasks: Task[];
}

export interface NewProspectInput {
  name: string;
  need: string;
  valueCents: number;
  email?: string;
  phone?: string;
  ownerUserId?: string;
}

export interface Contact {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  source: string;
  createdAt: string;
  ownerUserId: string | null;
  lifecycleStatus: LifecycleStatus;
}

export interface NewContactInput {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  ownerUserId?: string;
}

export interface DuplicateContactMatch {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
}

export interface OrgMember {
  userId: string;
  email: string;
}

export interface ContactFile {
  id: string;
  fileName: string;
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
}

export interface NewTaskInput {
  label: string;
  description?: string;
  dueDate?: string;
  urgent?: boolean;
}

export interface ContactDetail extends Contact {
  opportunities: Prospect[];
  activities: ActivityItem[];
}
