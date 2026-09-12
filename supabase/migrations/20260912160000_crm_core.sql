-- Phase 3 — noyau CRM (doc 06-MODULE-CRM.md, 03-MODELE-DE-DONNEES.md).
-- contacts, pipelines/pipeline_stages, opportunities, activities, tasks.
-- Isolation directe par organization_id (comme organizations elle-même),
-- réutilise is_org_member/is_org_admin/is_org_active (Phase 0/2).

-- Un membre "readonly" ne doit rien pouvoir écrire dans le CRM (doc :
-- "le rôle lecture seule consulte sans modifier").
create or replace function public.is_org_writer(target_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = target_org_id
      and user_id = auth.uid()
      and status = 'active'
      and role <> 'readonly'
  );
$$;

-- pipelines / pipeline_stages ------------------------------------------

create table public.pipelines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null default 'Principal',
  created_at timestamptz not null default now()
);

alter table public.pipelines enable row level security;

create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  stage_key text not null,
  label text not null,
  position smallint not null,
  is_won boolean not null default false,
  is_lost boolean not null default false,
  created_at timestamptz not null default now(),
  unique (pipeline_id, stage_key)
);

alter table public.pipeline_stages enable row level security;

create index pipeline_stages_pipeline_id_idx on public.pipeline_stages (pipeline_id);

create or replace function public.is_pipeline_member(target_pipeline_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.pipelines p
    where p.id = target_pipeline_id and public.is_org_member(p.organization_id)
  );
$$;

-- contacts ----------------------------------------------------------------

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  company_name text,
  email text,
  phone text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.contacts enable row level security;

create index contacts_organization_id_idx on public.contacts (organization_id);

create trigger trg_contacts_updated_at
  before update on public.contacts
  for each row execute function public.touch_updated_at();

-- opportunities -----------------------------------------------------------

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  stage_id uuid not null references public.pipeline_stages(id),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  need text,
  value_cents integer not null default 0,
  source text,
  next_follow_up_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.opportunities enable row level security;

create index opportunities_organization_id_idx on public.opportunities (organization_id);
create index opportunities_stage_id_idx on public.opportunities (stage_id);

create trigger trg_opportunities_updated_at
  before update on public.opportunities
  for each row execute function public.touch_updated_at();

-- activities ----------------------------------------------------------------

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  author_id uuid references auth.users(id),
  activity_type text not null default 'note',
  note text not null,
  created_at timestamptz not null default now()
);

alter table public.activities enable row level security;

create index activities_organization_id_idx on public.activities (organization_id, created_at desc);

-- tasks ---------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assignee_id uuid references auth.users(id),
  label text not null,
  description text,
  due_date date,
  urgent boolean not null default false,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create index tasks_organization_id_idx on public.tasks (organization_id);

create trigger trg_tasks_updated_at
  before update on public.tasks
  for each row execute function public.touch_updated_at();

-- Occasion gagnée/perdue produit une activité automatique (doc 06).

create or replace function public.log_opportunity_stage_activity()
returns trigger
language plpgsql
as $$
declare
  new_won boolean;
  new_lost boolean;
  contact_name text;
begin
  if new.stage_id = old.stage_id then
    return new;
  end if;
  select is_won, is_lost into new_won, new_lost from public.pipeline_stages where id = new.stage_id;
  if new_won or new_lost then
    select name into contact_name from public.contacts where id = new.contact_id;
    insert into public.activities (organization_id, opportunity_id, contact_id, author_id, activity_type, note)
    values (
      new.organization_id, new.id, new.contact_id, auth.uid(),
      case when new_won then 'won' else 'lost' end,
      case when new_won then 'Occasion gagnée : ' || coalesce(contact_name, '') else 'Occasion perdue : ' || coalesce(contact_name, '') end
    );
  end if;
  return new;
end;
$$;

create trigger trg_opportunities_stage_activity
  after update on public.opportunities
  for each row execute function public.log_opportunity_stage_activity();

-- Pipeline par défaut à la création d'une organisation (même patron que
-- web_projects en Phase 1).

create or replace function public.handle_new_organization_pipeline()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_pipeline_id uuid;
begin
  insert into public.pipelines (organization_id, name) values (new.id, 'Principal') returning id into new_pipeline_id;
  insert into public.pipeline_stages (pipeline_id, stage_key, label, position, is_won, is_lost) values
    (new_pipeline_id, 'nouveau', 'Nouveau', 1, false, false),
    (new_pipeline_id, 'a_contacter', 'À contacter', 2, false, false),
    (new_pipeline_id, 'qualifie', 'Qualifié', 3, false, false),
    (new_pipeline_id, 'proposition', 'Proposition', 4, false, false),
    (new_pipeline_id, 'gagne', 'Gagné', 5, true, false),
    (new_pipeline_id, 'perdu', 'Perdu', 6, false, true);
  return new;
end;
$$;

create trigger trg_organizations_pipeline
  after insert on public.organizations
  for each row execute function public.handle_new_organization_pipeline();

-- Policies ----------------------------------------------------------------

create policy pipelines_select_member on public.pipelines for select to authenticated
  using (public.is_org_member(organization_id));

create policy pipeline_stages_select_member on public.pipeline_stages for select to authenticated
  using (public.is_pipeline_member(pipeline_id));

create policy contacts_select_member on public.contacts for select to authenticated
  using (public.is_org_member(organization_id));
create policy contacts_write_member on public.contacts for insert to authenticated
  with check (public.is_org_writer(organization_id) and public.is_org_active(organization_id));
create policy contacts_update_member on public.contacts for update to authenticated
  using (public.is_org_writer(organization_id))
  with check (public.is_org_writer(organization_id));

create policy opportunities_select_member on public.opportunities for select to authenticated
  using (public.is_org_member(organization_id));
create policy opportunities_write_member on public.opportunities for insert to authenticated
  with check (public.is_org_writer(organization_id) and public.is_org_active(organization_id));
create policy opportunities_update_member on public.opportunities for update to authenticated
  using (public.is_org_writer(organization_id))
  with check (public.is_org_writer(organization_id));

create policy activities_select_member on public.activities for select to authenticated
  using (public.is_org_member(organization_id));
create policy activities_write_member on public.activities for insert to authenticated
  with check (public.is_org_writer(organization_id) and public.is_org_active(organization_id) and author_id = auth.uid());

create policy tasks_select_member on public.tasks for select to authenticated
  using (public.is_org_member(organization_id));
create policy tasks_write_member on public.tasks for insert to authenticated
  with check (public.is_org_writer(organization_id) and public.is_org_active(organization_id));
create policy tasks_update_member on public.tasks for update to authenticated
  using (public.is_org_writer(organization_id))
  with check (public.is_org_writer(organization_id));
