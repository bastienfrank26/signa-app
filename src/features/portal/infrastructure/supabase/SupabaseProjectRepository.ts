import type { SupabaseClient } from '@supabase/supabase-js';
import type { NewRevisionRequest, ProjectRepository } from '../../application/ProjectRepository';
import type {
  Approval,
  ProjectBundle,
  ProjectFile,
  ProjectStep,
  RevisionRequest,
  StepStatus,
  WebProject,
} from '../../domain/project';

function mapProject(row: Record<string, unknown>): WebProject {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    status: row.status as WebProject['status'],
    targetLaunchDate: (row.target_launch_date as string | null) ?? null,
    privatePreviewUrl: (row.private_preview_url as string | null) ?? null,
  };
}

function mapStep(row: Record<string, unknown>): ProjectStep {
  return {
    id: row.id as string,
    stepKey: row.step_key as string,
    label: row.label as string,
    position: row.position as number,
    status: row.status as StepStatus,
  };
}

function mapFile(row: Record<string, unknown>): ProjectFile {
  return {
    id: row.id as string,
    fileName: row.file_name as string,
    storagePath: row.storage_path as string,
    category: row.category as ProjectFile['category'],
    mimeType: (row.mime_type as string | null) ?? null,
    sizeBytes: (row.size_bytes as number | null) ?? null,
    createdAt: row.created_at as string,
  };
}

function mapRevision(row: Record<string, unknown>): RevisionRequest {
  return {
    id: row.id as string,
    pageOrUrl: (row.page_or_url as string | null) ?? null,
    description: row.description as string,
    priority: row.priority as RevisionRequest['priority'],
    status: row.status as RevisionRequest['status'],
    createdAt: row.created_at as string,
  };
}

function mapApproval(row: Record<string, unknown>): Approval {
  return {
    id: row.id as string,
    versionLabel: row.version_label as string,
    createdAt: row.created_at as string,
  };
}

export function createSupabaseProjectRepository(client: SupabaseClient): ProjectRepository {
  return {
    async getBundle(organizationId) {
      const { data: projectRow, error: projectErr } = await client
        .from('web_projects')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .maybeSingle();
      if (projectErr) throw new Error('Le projet n’a pas pu être chargé.');
      if (!projectRow) return null;

      const project = mapProject(projectRow);
      const [stepsRes, filesRes, revisionsRes, approvalsRes] = await Promise.all([
        client.from('project_steps').select('*').eq('web_project_id', project.id).order('position'),
        client.from('project_files').select('*').eq('web_project_id', project.id).is('deleted_at', null).order('created_at', { ascending: false }),
        client.from('revision_requests').select('*').eq('web_project_id', project.id).order('created_at', { ascending: false }),
        client.from('approvals').select('*').eq('web_project_id', project.id).order('created_at', { ascending: false }),
      ]);
      if (stepsRes.error || filesRes.error || revisionsRes.error || approvalsRes.error) {
        throw new Error('Le projet n’a pas pu être chargé complètement.');
      }
      return {
        project,
        steps: (stepsRes.data ?? []).map(mapStep),
        files: (filesRes.data ?? []).map(mapFile),
        revisions: (revisionsRes.data ?? []).map(mapRevision),
        approvals: (approvalsRes.data ?? []).map(mapApproval),
      };
    },

    async submitRevisionRequest(webProjectId, request: NewRevisionRequest) {
      const { data: userData } = await client.auth.getUser();
      const { error } = await client.from('revision_requests').insert({
        web_project_id: webProjectId,
        created_by: userData.user?.id,
        page_or_url: request.pageOrUrl || null,
        description: request.description,
        priority: request.priority,
      });
      if (error) throw new Error('La demande de correction n’a pas pu être envoyée.');
    },

    async approveVersion(webProjectId, versionLabel, consentText) {
      const { error } = await client.rpc('approve_project_version', {
        p_project_id: webProjectId,
        p_version_label: versionLabel,
        p_consent_text: consentText,
      });
      if (error) throw new Error(error.message);
    },

    async uploadFile(organizationId, webProjectId, file) {
      const path = `${organizationId}/${webProjectId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await client.storage.from('project-files').upload(path, file, {
        contentType: file.type || undefined,
      });
      if (uploadError) throw new Error('Le téléversement a échoué.');

      const { data: userData } = await client.auth.getUser();
      const { error: rowError } = await client.from('project_files').insert({
        web_project_id: webProjectId,
        uploaded_by: userData.user?.id,
        storage_path: path,
        file_name: file.name,
        mime_type: file.type || null,
        size_bytes: file.size,
        category: 'other',
      });
      if (rowError) throw new Error('Le fichier a été téléversé, mais son enregistrement a échoué.');
    },

    async getFileUrl(storagePath) {
      const { data, error } = await client.storage.from('project-files').createSignedUrl(storagePath, 60);
      if (error || !data) throw new Error('Le lien de téléchargement n’a pas pu être créé.');
      return data.signedUrl;
    },
  };
}
