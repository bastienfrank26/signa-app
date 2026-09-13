import type { SupabaseClient } from '@supabase/supabase-js';
import type { CrmRepository } from '../../application/CrmRepository';
import type {
  ActivityItem,
  Contact,
  ContactDetail,
  ContactFile,
  CrmBundle,
  DuplicateContactMatch,
  LifecycleStatus,
  NewContactInput,
  NewProspectInput,
  NewTaskInput,
  OrgMember,
  Prospect,
  Stage,
  Task,
} from '../../domain/crm';

function mapStage(row: Record<string, unknown>): Stage {
  return {
    id: row.id as string,
    key: row.stage_key as string,
    label: row.label as string,
    position: row.position as number,
    isWon: row.is_won as boolean,
    isLost: row.is_lost as boolean,
  };
}

function mapProspect(row: Record<string, unknown>): Prospect {
  const contact = row.contacts as Record<string, unknown> | null;
  return {
    id: row.id as string,
    contactId: row.contact_id as string,
    name: (contact?.name as string) ?? '',
    company: (contact?.company_name as string) ?? '',
    need: (row.need as string) ?? '',
    valueCents: row.value_cents as number,
    stageId: row.stage_id as string,
    source: (row.source as string) ?? (contact?.source as string) ?? '',
    email: (contact?.email as string) ?? '',
    phone: (contact?.phone as string) ?? '',
    nextFollowUpAt: (row.next_follow_up_at as string | null) ?? null,
    ownerUserId: (row.owner_user_id as string | null) ?? null,
    lifecycleStatus: ((contact?.lifecycle_status as LifecycleStatus | undefined) ?? 'prospect'),
    utmSource: (row.utm_source as string | null) ?? null,
    utmMedium: (row.utm_medium as string | null) ?? null,
    utmCampaign: (row.utm_campaign as string | null) ?? null,
    wonAt: (row.won_at as string | null) ?? null,
    lostAt: (row.lost_at as string | null) ?? null,
  };
}

function mapActivity(row: Record<string, unknown>): ActivityItem {
  const contact = row.contacts as Record<string, unknown> | null;
  return {
    id: row.id as string,
    opportunityId: (row.opportunity_id as string | null) ?? null,
    contactName: (contact?.name as string) ?? null,
    note: row.note as string,
    activityType: row.activity_type as string,
    createdAt: row.created_at as string,
  };
}

function mapContact(row: Record<string, unknown>): Contact {
  return {
    id: row.id as string,
    name: row.name as string,
    companyName: (row.company_name as string) ?? '',
    email: (row.email as string) ?? '',
    phone: (row.phone as string) ?? '',
    source: (row.source as string) ?? '',
    createdAt: row.created_at as string,
    ownerUserId: (row.owner_user_id as string | null) ?? null,
    lifecycleStatus: (row.lifecycle_status as LifecycleStatus | undefined) ?? 'prospect',
  };
}

function mapContactFile(row: Record<string, unknown>): ContactFile {
  return {
    id: row.id as string,
    fileName: row.file_name as string,
    storagePath: row.storage_path as string,
    mimeType: (row.mime_type as string | null) ?? null,
    sizeBytes: (row.size_bytes as number | null) ?? null,
    createdAt: row.created_at as string,
  };
}

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    label: row.label as string,
    description: (row.description as string) ?? '',
    dueDate: (row.due_date as string | null) ?? null,
    urgent: row.urgent as boolean,
    done: row.done as boolean,
  };
}

export function createSupabaseCrmRepository(client: SupabaseClient): CrmRepository {
  return {
    async getBundle(organizationId) {
      const { data: pipeline, error: pipelineErr } = await client
        .from('pipelines')
        .select('id')
        .eq('organization_id', organizationId)
        .limit(1)
        .maybeSingle();
      if (pipelineErr) throw new Error('Le pipeline n’a pas pu être chargé.');

      const [stagesRes, opportunitiesRes, activitiesRes, tasksRes] = await Promise.all([
        pipeline
          ? client.from('pipeline_stages').select('*').eq('pipeline_id', pipeline.id).order('position')
          : Promise.resolve({ data: [], error: null }),
        client
          .from('opportunities')
          .select('*, contacts(name, company_name, email, phone, source, lifecycle_status)')
          .eq('organization_id', organizationId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false }),
        client
          .from('activities')
          .select('*, contacts(name)')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(300),
        client.from('tasks').select('*').eq('organization_id', organizationId).order('due_date', { ascending: true, nullsFirst: false }),
      ]);
      if (stagesRes.error || opportunitiesRes.error || activitiesRes.error || tasksRes.error) {
        throw new Error('Le CRM n’a pas pu être chargé complètement.');
      }

      return {
        stages: (stagesRes.data ?? []).map(mapStage),
        prospects: (opportunitiesRes.data ?? []).map(mapProspect),
        activities: (activitiesRes.data ?? []).map(mapActivity),
        tasks: (tasksRes.data ?? []).map(mapTask),
      };
    },

    async createProspect(organizationId, input: NewProspectInput) {
      const { data: pipeline, error: pipelineErr } = await client
        .from('pipelines')
        .select('id')
        .eq('organization_id', organizationId)
        .limit(1)
        .single();
      if (pipelineErr || !pipeline) throw new Error('Aucun pipeline trouvé pour cette organisation.');

      const { data: firstStage, error: stageErr } = await client
        .from('pipeline_stages')
        .select('id')
        .eq('pipeline_id', pipeline.id)
        .order('position')
        .limit(1)
        .single();
      if (stageErr || !firstStage) throw new Error('Aucune étape de pipeline trouvée.');

      const { data: contact, error: contactErr } = await client
        .from('contacts')
        .insert({
          organization_id: organizationId,
          name: input.name,
          company_name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          owner_user_id: input.ownerUserId || null,
          source: 'Création manuelle',
        })
        .select('id')
        .single();
      if (contactErr || !contact) throw new Error('Le contact n’a pas pu être créé.');

      const { error: oppErr } = await client.from('opportunities').insert({
        organization_id: organizationId,
        pipeline_id: pipeline.id,
        stage_id: firstStage.id,
        contact_id: contact.id,
        need: input.need || 'Nouvelle demande',
        value_cents: input.valueCents,
        owner_user_id: input.ownerUserId || null,
        source: 'Création manuelle',
      });
      if (oppErr) throw new Error('Le prospect n’a pas pu être ajouté.');
    },

    async moveStage(opportunityId, stageId) {
      const { error } = await client.from('opportunities').update({ stage_id: stageId }).eq('id', opportunityId);
      if (error) throw new Error('Impossible de changer l’étape.');
    },

    async addActivityNote(organizationId, opportunityId, contactId, note) {
      const { data: userData } = await client.auth.getUser();
      const { error } = await client.from('activities').insert({
        organization_id: organizationId,
        opportunity_id: opportunityId,
        contact_id: contactId,
        author_id: userData.user?.id,
        activity_type: 'note',
        note,
      });
      if (error) throw new Error('L’activité n’a pas pu être enregistrée.');
    },

    async toggleTask(taskId, done) {
      const { error } = await client.from('tasks').update({ done }).eq('id', taskId);
      if (error) throw new Error('La tâche n’a pas pu être mise à jour.');
    },

    async createTask(organizationId, input: NewTaskInput) {
      const { data: userData } = await client.auth.getUser();
      const { error } = await client.from('tasks').insert({
        organization_id: organizationId,
        assignee_id: userData.user?.id ?? null,
        label: input.label,
        description: input.description || null,
        due_date: input.dueDate || null,
        urgent: input.urgent ?? false,
      });
      if (error) throw new Error('La tâche n’a pas pu être créée.');
    },

    async listContacts(organizationId) {
      const { data, error } = await client
        .from('contacts')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw new Error('Les contacts n’ont pas pu être chargés.');
      return (data ?? []).map(mapContact);
    },

    async createContact(organizationId, input: NewContactInput) {
      const { error } = await client.from('contacts').insert({
        organization_id: organizationId,
        name: input.name,
        company_name: input.companyName || null,
        email: input.email || null,
        phone: input.phone || null,
        owner_user_id: input.ownerUserId || null,
        source: 'Création manuelle',
      });
      if (error) throw new Error('Le contact n’a pas pu être créé.');
    },

    async getContactDetail(contactId) {
      const [contactRes, opportunitiesRes, activitiesRes] = await Promise.all([
        client.from('contacts').select('*').eq('id', contactId).single(),
        client
          .from('opportunities')
          .select('*, contacts(name, company_name, email, phone, source, lifecycle_status)')
          .eq('contact_id', contactId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false }),
        client
          .from('activities')
          .select('*, contacts(name)')
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false })
          .limit(100),
      ]);
      if (contactRes.error || !contactRes.data) throw new Error('Le contact n’a pas pu être chargé.');
      if (opportunitiesRes.error || activitiesRes.error) throw new Error('La fiche du contact n’a pas pu être chargée complètement.');
      return {
        ...mapContact(contactRes.data),
        opportunities: (opportunitiesRes.data ?? []).map(mapProspect),
        activities: (activitiesRes.data ?? []).map(mapActivity),
      };
    },

    async addContactNote(organizationId, contactId, note) {
      const { data: userData } = await client.auth.getUser();
      const { error } = await client.from('activities').insert({
        organization_id: organizationId,
        contact_id: contactId,
        author_id: userData.user?.id,
        activity_type: 'note',
        note,
      });
      if (error) throw new Error('L’activité n’a pas pu être enregistrée.');
    },

    async listOrgMembers(organizationId) {
      const { data, error } = await client.rpc('org_member_directory', { p_organization_id: organizationId });
      if (error) throw new Error('Les membres de l’équipe n’ont pas pu être chargés.');
      return ((data as unknown[]) ?? []).map((row) => {
        const r = row as Record<string, unknown>;
        return { userId: r.user_id as string, email: r.email as string } satisfies OrgMember;
      });
    },

    async findDuplicateContact(organizationId, email, phone) {
      if (!email && !phone) return null;
      const { data, error } = await client
        .rpc('find_duplicate_contact', { p_organization_id: organizationId, p_email: email ?? null, p_phone: phone ?? null })
        .maybeSingle();
      if (error) throw new Error('La recherche de doublon a échoué.');
      if (!data) return null;
      const row = data as Record<string, unknown>;
      return {
        id: row.id as string,
        name: row.name as string,
        companyName: (row.company_name as string) ?? '',
        email: (row.email as string) ?? '',
        phone: (row.phone as string) ?? '',
      } satisfies DuplicateContactMatch;
    },

    async listContactFiles(contactId) {
      const { data, error } = await client
        .from('contact_files')
        .select('*')
        .eq('contact_id', contactId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw new Error('Les fichiers n’ont pas pu être chargés.');
      return (data ?? []).map(mapContactFile);
    },

    async uploadContactFile(organizationId, contactId, file) {
      const path = `${organizationId}/${contactId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await client.storage.from('crm-files').upload(path, file, {
        contentType: file.type || undefined,
      });
      if (uploadError) throw new Error('Le téléversement a échoué.');

      const { data: userData } = await client.auth.getUser();
      const { error: rowError } = await client.from('contact_files').insert({
        organization_id: organizationId,
        contact_id: contactId,
        uploaded_by: userData.user?.id,
        storage_path: path,
        file_name: file.name,
        mime_type: file.type || null,
        size_bytes: file.size,
      });
      if (rowError) throw new Error('Le fichier a été téléversé, mais son enregistrement a échoué.');
    },

    async getContactFileUrl(storagePath) {
      const { data, error } = await client.storage.from('crm-files').createSignedUrl(storagePath, 60);
      if (error || !data) throw new Error('Le lien de téléchargement n’a pas pu être créé.');
      return data.signedUrl;
    },
  };
}
