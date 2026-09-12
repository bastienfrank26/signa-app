import type { ProjectBundle, RevisionPriority } from '../domain/project';

export interface NewRevisionRequest {
  pageOrUrl: string;
  description: string;
  priority: RevisionPriority;
}

export interface ProjectRepository {
  getBundle: (organizationId: string) => Promise<ProjectBundle | null>;
  submitRevisionRequest: (webProjectId: string, request: NewRevisionRequest) => Promise<void>;
  approveVersion: (webProjectId: string, versionLabel: string, consentText: string) => Promise<void>;
  uploadFile: (organizationId: string, webProjectId: string, file: File) => Promise<void>;
  getFileUrl: (storagePath: string) => Promise<string>;
}
