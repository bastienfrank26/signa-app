import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminRepository } from '../../application/AdminRepository';
import type { AuditEvent, OrganizationDetail, OrganizationSummary, Site } from '../../domain/admin';

export function createSupabaseAdminRepository(client: SupabaseClient): AdminRepository {
  return {
    async listSites(organizationId) {
      const { data, error } = await client.rpc('admin_list_sites', { p_org_id: organizationId });
      if (error) throw new Error('Les sites n’ont pas pu être chargés.');
      return ((data as unknown[]) ?? []).map((row) => {
        const r = row as Record<string, unknown>;
        return {
          id: r.id as string,
          name: r.name as string,
          status: r.status as Site['status'],
          allowedOrigins: (r.allowedOrigins as string[]) ?? [],
          keyPrefix: (r.keyPrefix as string | null) ?? null,
        };
      });
    },

    async createSite(organizationId, name, allowedOrigins) {
      const { data, error } = await client.rpc('admin_create_site', {
        p_org_id: organizationId,
        p_name: name,
        p_allowed_origins: allowedOrigins,
      });
      if (error) throw new Error(error.message);
      return { siteId: data.siteId as string, secret: data.secret as string };
    },

    async rotateSiteKey(siteId) {
      const { data, error } = await client.rpc('admin_rotate_site_key', { p_site_id: siteId });
      if (error) throw new Error(error.message);
      return { secret: data.secret as string };
    },

    async setSiteStatus(siteId, status, reason) {
      const { error } = await client.rpc('admin_set_site_status', { p_site_id: siteId, p_status: status, p_reason: reason });
      if (error) throw new Error(error.message);
    },

    async testSiteIntegration(siteId) {
      const { data, error } = await client.rpc('admin_test_site_integration', { p_site_id: siteId });
      if (error) throw new Error(error.message);
      return { submissionId: data.submissionId as string };
    },
    async getStaffRole() {
      const { data } = await client.rpc('current_staff_role');
      return (data as string | null) ?? null;
    },

    async listOrganizations() {
      const [orgsRes, membershipsRes, projectsRes] = await Promise.all([
        client.from('organizations').select('id, name, status').is('deleted_at', null).order('name'),
        client.from('memberships').select('organization_id'),
        client.from('web_projects').select('organization_id, status').is('deleted_at', null),
      ]);
      if (orgsRes.error) throw new Error('La liste des organisations n’a pas pu être chargée.');

      const memberCounts = new Map<string, number>();
      for (const m of membershipsRes.data ?? []) {
        const key = m.organization_id as string;
        memberCounts.set(key, (memberCounts.get(key) ?? 0) + 1);
      }
      const projectStatusByOrg = new Map<string, string>();
      for (const p of projectsRes.data ?? []) {
        projectStatusByOrg.set(p.organization_id as string, p.status as string);
      }

      const summaries: OrganizationSummary[] = (orgsRes.data ?? []).map((o) => ({
        id: o.id as string,
        name: o.name as string,
        status: o.status as OrganizationSummary['status'],
        memberCount: memberCounts.get(o.id as string) ?? 0,
        projectStatus: projectStatusByOrg.get(o.id as string) ?? null,
      }));
      return summaries;
    },

    async getOrganizationDetail(organizationId) {
      const [orgRes, membershipsRes, projectRes] = await Promise.all([
        client.from('organizations').select('*').eq('id', organizationId).maybeSingle(),
        client.rpc('admin_organization_memberships', { p_org_id: organizationId }),
        client.from('web_projects').select('id, status').eq('organization_id', organizationId).is('deleted_at', null).maybeSingle(),
      ]);
      if (orgRes.error || !orgRes.data) return null;

      let steps: OrganizationDetail['steps'] = [];
      if (projectRes.error) throw new Error('Les données de projet n’ont pas pu être chargées.');
      const project = projectRes.data;
      if (project) {
        const { data: stepsData, error: stepsErr } = await client
          .from('project_steps')
          .select('*')
          .eq('web_project_id', project.id)
          .order('position');
        if (stepsErr) throw new Error('Les étapes du projet n’ont pas pu être chargées.');
        steps = (stepsData ?? []).map((s) => ({
          id: s.id as string,
          stepKey: s.step_key as string,
          label: s.label as string,
          position: s.position as number,
          status: s.status as string,
        }));
      }

      const memberships = ((membershipsRes.data as unknown[]) ?? []).map((m) => {
        const row = m as Record<string, unknown>;
        return {
          id: row.id as string,
          userId: row.userId as string,
          email: row.email as string,
          role: row.role as string,
          status: row.status as string,
        };
      });

      return {
        id: orgRes.data.id as string,
        name: orgRes.data.name as string,
        status: orgRes.data.status as OrganizationDetail['status'],
        memberships,
        project: project ? { id: project.id as string, status: project.status as string } : null,
        steps,
      };
    },

    async setOrganizationStatus(organizationId, status, reason) {
      const { error } = await client.rpc('admin_set_organization_status', {
        p_org_id: organizationId,
        p_status: status,
        p_reason: reason,
      });
      if (error) throw new Error(error.message);
    },

    async setProjectStatus(projectId, status, reason) {
      const { error } = await client.rpc('admin_set_project_status', {
        p_project_id: projectId,
        p_status: status,
        p_reason: reason,
      });
      if (error) throw new Error(error.message);
    },

    async setStepStatus(stepId, status) {
      const { error } = await client.rpc('admin_set_step_status', { p_step_id: stepId, p_status: status });
      if (error) throw new Error(error.message);
    },

    async updateMembership(membershipId, role, status, reason) {
      const { error } = await client.rpc('admin_update_membership', {
        p_membership_id: membershipId,
        p_role: role,
        p_status: status,
        p_reason: reason,
      });
      if (error) throw new Error(error.message);
    },

    async listAuditEvents() {
      const { data, error } = await client.from('audit_events').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw new Error('Le journal d’audit n’a pas pu être chargé.');
      return (data ?? []).map((row) => ({
        id: row.id as string,
        actorUserId: (row.actor_user_id as string | null) ?? null,
        action: row.action as string,
        targetType: row.target_type as string,
        targetId: row.target_id as string,
        reason: (row.reason as string | null) ?? null,
        createdAt: row.created_at as string,
      })) satisfies AuditEvent[];
    },
  };
}
