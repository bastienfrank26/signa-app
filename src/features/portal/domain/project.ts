export const projectStatuses = [
  'awaiting_information',
  'content_review',
  'in_production',
  'private_review',
  'revisions',
  'approved',
  'launching',
  'live',
  'maintenance',
] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export const projectStatusLabels: Record<ProjectStatus, string> = {
  awaiting_information: 'En attente d’information',
  content_review: 'Révision du contenu',
  in_production: 'En production',
  private_review: 'Révision privée',
  revisions: 'Corrections en cours',
  approved: 'Approuvé',
  launching: 'Mise en ligne',
  live: 'En ligne',
  maintenance: 'Maintenance',
};

export interface WebProject {
  id: string;
  organizationId: string;
  status: ProjectStatus;
  targetLaunchDate: string | null;
  privatePreviewUrl: string | null;
}

export type StepStatus = 'pending' | 'in_progress' | 'done';

export interface ProjectStep {
  id: string;
  stepKey: string;
  label: string;
  position: number;
  status: StepStatus;
}

export interface ProjectFile {
  id: string;
  fileName: string;
  storagePath: string;
  category: 'logo' | 'photo' | 'text' | 'other';
  createdAt: string;
}

export const revisionPriorities = ['low', 'normal', 'high'] as const;
export type RevisionPriority = (typeof revisionPriorities)[number];

export const revisionStatuses = ['submitted', 'acknowledged', 'in_progress', 'ready_for_review', 'resolved', 'declined'] as const;
export type RevisionStatus = (typeof revisionStatuses)[number];

export const revisionStatusLabels: Record<RevisionStatus, string> = {
  submitted: 'Envoyée',
  acknowledged: 'Reçue',
  in_progress: 'En cours',
  ready_for_review: 'Prête pour révision',
  resolved: 'Résolue',
  declined: 'Refusée',
};

export interface RevisionRequest {
  id: string;
  pageOrUrl: string | null;
  description: string;
  priority: RevisionPriority;
  status: RevisionStatus;
  createdAt: string;
}

export interface Approval {
  id: string;
  versionLabel: string;
  createdAt: string;
}

export interface ProjectBundle {
  project: WebProject;
  steps: ProjectStep[];
  files: ProjectFile[];
  revisions: RevisionRequest[];
  approvals: Approval[];
}
