-- RPC d'administration : chaque action sensible écrit son audit_events dans
-- la même transaction, avec motif obligatoire pour les actions à risque
-- (doc 08 : "Actions dangereuses ... demandent confirmation et motif").
-- Security invoker (par défaut) : la RLS de organizations/web_projects/
-- project_steps/memberships fait déjà le contrôle d'accès (is_internal_admin).
-- L'insertion dans audit_events est permise par une policy dédiée ci-dessous,
-- plus stricte qu'un accès direct par le client.

create policy audit_events_insert_staff_admin
  on public.audit_events for insert to authenticated
  with check (public.is_internal_admin() and actor_user_id = auth.uid());

create or replace function public.admin_set_organization_status(
  p_org_id uuid,
  p_status text,
  p_reason text
)
returns void
language plpgsql
as $$
begin
  if not public.is_internal_admin() then
    raise exception 'Action réservée au personnel Signa (opérations).';
  end if;
  if p_status not in ('active', 'suspended') then
    raise exception 'Statut invalide.';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Un motif est requis.';
  end if;

  update public.organizations set status = p_status where id = p_org_id;

  insert into public.audit_events (actor_user_id, action, target_type, target_id, reason)
  values (auth.uid(), 'organization.status_changed', 'organization', p_org_id::text, p_reason);
end;
$$;

grant execute on function public.admin_set_organization_status(uuid, text, text) to authenticated;

create or replace function public.admin_set_project_status(
  p_project_id uuid,
  p_status text,
  p_reason text
)
returns void
language plpgsql
as $$
begin
  if not public.is_internal_admin() then
    raise exception 'Action réservée au personnel Signa (opérations).';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Un motif est requis.';
  end if;

  update public.web_projects set status = p_status where id = p_project_id;

  insert into public.audit_events (actor_user_id, action, target_type, target_id, reason, metadata)
  values (auth.uid(), 'project.status_changed', 'web_project', p_project_id::text, p_reason, jsonb_build_object('status', p_status));
end;
$$;

grant execute on function public.admin_set_project_status(uuid, text, text) to authenticated;

create or replace function public.admin_set_step_status(
  p_step_id uuid,
  p_status text
)
returns void
language plpgsql
as $$
begin
  if not public.is_internal_admin() then
    raise exception 'Action réservée au personnel Signa (opérations).';
  end if;

  update public.project_steps
  set status = p_status, completed_at = case when p_status = 'done' then now() else null end
  where id = p_step_id;

  insert into public.audit_events (actor_user_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'project_step.status_changed', 'project_step', p_step_id::text, jsonb_build_object('status', p_status));
end;
$$;

grant execute on function public.admin_set_step_status(uuid, text) to authenticated;

create or replace function public.admin_update_membership(
  p_membership_id uuid,
  p_role text,
  p_status text,
  p_reason text
)
returns void
language plpgsql
as $$
begin
  if not public.is_internal_admin() then
    raise exception 'Action réservée au personnel Signa (opérations).';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Un motif est requis.';
  end if;

  update public.memberships set role = p_role, status = p_status where id = p_membership_id;

  insert into public.audit_events (actor_user_id, action, target_type, target_id, reason, metadata)
  values (auth.uid(), 'membership.updated', 'membership', p_membership_id::text, p_reason, jsonb_build_object('role', p_role, 'status', p_status));
end;
$$;

grant execute on function public.admin_update_membership(uuid, text, text, text) to authenticated;

-- Un compte suspendu bloque aussi l'approbation (pas seulement la
-- soumission de corrections et de fichiers déjà couvertes).

create or replace function public.approve_project_version(
  p_project_id uuid,
  p_version_label text,
  p_consent_text text
)
returns void
language plpgsql
as $$
declare
  current_status text;
  org_id uuid;
begin
  select status, organization_id into current_status, org_id from public.web_projects where id = p_project_id;
  if current_status is null then
    raise exception 'Projet introuvable.';
  end if;
  if not public.is_org_active(org_id) then
    raise exception 'Ce compte est suspendu.';
  end if;
  if current_status <> 'private_review' then
    raise exception 'Le projet n''est pas en révision privée.';
  end if;

  insert into public.approvals (web_project_id, approved_by, version_label, consent_text)
  values (p_project_id, auth.uid(), p_version_label, p_consent_text);

  update public.web_projects set status = 'approved' where id = p_project_id;
end;
$$;
