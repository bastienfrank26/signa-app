export interface Stage {
  id: string;
  key: string;
  label: string;
  position: number;
  isWon: boolean;
  isLost: boolean;
}

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
}
