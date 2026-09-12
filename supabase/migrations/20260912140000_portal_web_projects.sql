-- Phase 1 — portail client (doc 05-PORTAIL-CLIENT.md).
-- web_projects / project_steps / project_files / revision_requests / approvals.
-- Isolation par organisation via web_project_id -> web_projects.organization_id,
-- réutilise is_org_member/is_org_admin (Phase 0).

create table public.web_projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  status text not null default 'awaiting_information' check (status in (
    'awaiting_information', 'content_review', 'in_production', 'private_review',
    'revisions', 'approved', 'launching', 'live', 'maintenance'
  )),
  target_launch_date date,
  private_preview_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.web_projects enable row level security;

create index web_projects_organization_id_idx on public.web_projects (organization_id);

create trigger trg_web_projects_updated_at
  before update on public.web_projects
  for each row execute function public.touch_updated_at();

-- project_steps -------------------------------------------------------------

create table public.project_steps (
  id uuid primary key default gen_random_uuid(),
  web_project_id uuid not null references public.web_projects(id) on delete cascade,
  step_key text not null,
  label text not null,
  position smallint not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  completed_at timestamptz,
  unique (web_project_id, step_key)
);

alter table public.project_steps enable row level security;

create index project_steps_web_project_id_idx on public.project_steps (web_project_id);

-- project_files ---------------------------------------------------------

create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  web_project_id uuid not null references public.web_projects(id) on delete cascade,
  uploaded_by uuid references auth.users(id),
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  category text not null default 'other' check (category in ('logo', 'photo', 'text', 'other')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.project_files enable row level security;

create index project_files_web_project_id_idx on public.project_files (web_project_id);

-- revision_requests -----------------------------------------------------

create table public.revision_requests (
  id uuid primary key default gen_random_uuid(),
  web_project_id uuid not null references public.web_projects(id) on delete cascade,
  created_by uuid references auth.users(id),
  page_or_url text,
  description text not null,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  status text not null default 'submitted' check (status in (
    'submitted', 'acknowledged', 'in_progress', 'ready_for_review', 'resolved', 'declined'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.revision_requests enable row level security;

create index revision_requests_web_project_id_idx on public.revision_requests (web_project_id);

create trigger trg_revision_requests_updated_at
  before update on public.revision_requests
  for each row execute function public.touch_updated_at();

-- approvals ---------------------------------------------------------------
-- Immuable : une fois créée, une approbation n'est jamais modifiée ni supprimée.

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  web_project_id uuid not null references public.web_projects(id) on delete cascade,
  approved_by uuid not null references auth.users(id),
  version_label text not null,
  consent_text text not null,
  created_at timestamptz not null default now()
);

alter table public.approvals enable row level security;

create index approvals_web_project_id_idx on public.approvals (web_project_id);

-- Helpers ----------------------------------------------------------------

create or replace function public.is_project_member(target_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.web_projects wp
    where wp.id = target_project_id
      and public.is_org_member(wp.organization_id)
  );
$$;

create or replace function public.is_project_admin(target_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.web_projects wp
    where wp.id = target_project_id
      and public.is_org_admin(wp.organization_id)
  );
$$;

-- Création automatique d'un projet web à la création d'une organisation
-- (doc 05 : "Paiement reçu -> Signa crée le compte et le projet"). En
-- attendant l'administration Signa (Phase 2), l'auto-création couvre le
-- même besoin pour le pilote technique.

create or replace function public.handle_new_organization_project()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_project_id uuid;
begin
  insert into public.web_projects (organization_id) values (new.id) returning id into new_project_id;
  insert into public.project_steps (web_project_id, step_key, label, position) values
    (new_project_id, 'informations', 'Informations', 1),
    (new_project_id, 'fichiers', 'Fichiers', 2),
    (new_project_id, 'creation', 'Création', 3),
    (new_project_id, 'revision', 'Révision', 4),
    (new_project_id, 'approbation', 'Approbation', 5),
    (new_project_id, 'en_ligne', 'En ligne', 6);
  return new;
end;
$$;

create trigger trg_organizations_web_project
  after insert on public.organizations
  for each row execute function public.handle_new_organization_project();

-- Policies ----------------------------------------------------------------

create policy web_projects_select_member
  on public.web_projects for select to authenticated
  using (public.is_org_member(organization_id));

create policy web_projects_update_admin
  on public.web_projects for update to authenticated
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

create policy project_steps_select_member
  on public.project_steps for select to authenticated
  using (public.is_project_member(web_project_id));

create policy project_files_select_member
  on public.project_files for select to authenticated
  using (public.is_project_member(web_project_id));

create policy project_files_insert_member
  on public.project_files for insert to authenticated
  with check (public.is_project_member(web_project_id) and uploaded_by = auth.uid());

create policy revision_requests_select_member
  on public.revision_requests for select to authenticated
  using (public.is_project_member(web_project_id));

create policy revision_requests_insert_member
  on public.revision_requests for insert to authenticated
  with check (public.is_project_member(web_project_id) and created_by = auth.uid());

create policy approvals_select_member
  on public.approvals for select to authenticated
  using (public.is_project_member(web_project_id));

create policy approvals_insert_admin
  on public.approvals for insert to authenticated
  with check (public.is_project_admin(web_project_id) and approved_by = auth.uid());
