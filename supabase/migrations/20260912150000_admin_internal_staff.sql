-- Phase 2 — administration Signa (doc 08-ADMINISTRATION-SIGNA.md).
-- Rôles internes distincts des rôles clients (doc : "Les rôles internes
-- sont distincts des rôles clients"). Une table à part, jamais mélangée
-- aux memberships d'organisation.

create table public.internal_staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('support', 'operations', 'billing_admin', 'super_admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.internal_staff enable row level security;

create trigger trg_internal_staff_updated_at
  before update on public.internal_staff
  for each row execute function public.touch_updated_at();

create or replace function public.is_internal_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.internal_staff
    where user_id = auth.uid() and status = 'active'
  );
$$;

-- "operations" et "super_admin" seuls peuvent agir (suspendre, changer un
-- statut de projet, gérer les accès). "support" et "billing_admin" ont
-- accès en lecture (audit inclus) mais pas ces actions, par moindre privilège.
create or replace function public.is_internal_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.internal_staff
    where user_id = auth.uid() and status = 'active' and role in ('operations', 'super_admin')
  );
$$;

create or replace function public.current_staff_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.internal_staff where user_id = auth.uid() and status = 'active';
$$;

grant execute on function public.current_staff_role() to authenticated;

create policy internal_staff_select_self_or_staff
  on public.internal_staff for select to authenticated
  using (user_id = auth.uid() or public.is_internal_staff());

-- audit_events -------------------------------------------------------------
-- Écrit uniquement par les RPC admin (jamais directement par le client),
-- pour garantir qu'une action sensible est toujours tracée avec son motif.

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  action text not null,
  target_type text not null,
  target_id text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_events enable row level security;

create index audit_events_target_idx on public.audit_events (target_type, target_id);
create index audit_events_created_at_idx on public.audit_events (created_at desc);

create policy audit_events_select_staff
  on public.audit_events for select to authenticated
  using (public.is_internal_staff());

-- organizations : statut de compte -----------------------------------------

alter table public.organizations
  add column status text not null default 'active' check (status in ('active', 'suspended'));

create or replace function public.is_org_active(target_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organizations
    where id = target_org_id and status = 'active' and deleted_at is null
  );
$$;

-- Visibilité et actions du personnel Signa, en plus des policies clients
-- existantes (jamais à la place : les deux coexistent).

create policy organizations_select_staff
  on public.organizations for select to authenticated
  using (public.is_internal_staff());

create policy organizations_update_staff_admin
  on public.organizations for update to authenticated
  using (public.is_internal_admin())
  with check (public.is_internal_admin());

create policy memberships_select_staff
  on public.memberships for select to authenticated
  using (public.is_internal_staff());

create policy memberships_write_staff_admin
  on public.memberships for update to authenticated
  using (public.is_internal_admin())
  with check (public.is_internal_admin());

create policy web_projects_select_staff
  on public.web_projects for select to authenticated
  using (public.is_internal_staff());

create policy web_projects_update_staff_admin
  on public.web_projects for update to authenticated
  using (public.is_internal_admin())
  with check (public.is_internal_admin());

create policy project_steps_select_staff
  on public.project_steps for select to authenticated
  using (public.is_internal_staff());

create policy project_steps_write_staff_admin
  on public.project_steps for update to authenticated
  using (public.is_internal_admin())
  with check (public.is_internal_admin());

create policy project_files_select_staff
  on public.project_files for select to authenticated
  using (public.is_internal_staff());

create policy revision_requests_select_staff
  on public.revision_requests for select to authenticated
  using (public.is_internal_staff());

create policy approvals_select_staff
  on public.approvals for select to authenticated
  using (public.is_internal_staff());

-- Un compte suspendu réduit l'accès du client sans effacer ses données
-- (doc 08) : les écritures suivantes exigent maintenant que l'organisation
-- soit active, en plus de la membership déjà requise.

drop policy revision_requests_insert_member on public.revision_requests;
create policy revision_requests_insert_member
  on public.revision_requests for insert to authenticated
  with check (
    public.is_project_member(web_project_id)
    and created_by = auth.uid()
    and exists (select 1 from public.web_projects wp where wp.id = web_project_id and public.is_org_active(wp.organization_id))
  );

drop policy project_files_insert_member on public.project_files;
create policy project_files_insert_member
  on public.project_files for insert to authenticated
  with check (
    public.is_project_member(web_project_id)
    and uploaded_by = auth.uid()
    and exists (select 1 from public.web_projects wp where wp.id = web_project_id and public.is_org_active(wp.organization_id))
  );
