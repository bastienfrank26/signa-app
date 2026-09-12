-- Phase 0 — noyau multi-organisation (doc 02-ARCHITECTURE, 03-MODELE-DE-DONNEES).
-- organizations / memberships / invitations : isolation stricte par organization_id,
-- imposée côté serveur via RLS (jamais confiance dans un id fourni par le navigateur).

create extension if not exists "pgcrypto";

-- Réutilisable pour maintenir updated_at à jour (patron reca-app-v3 set_audit_columns,
-- simplifié ici : ces tables n'ont pas de created_by/updated_by par colonne).
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- organizations ---------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.organizations enable row level security;

create trigger trg_organizations_updated_at
  before update on public.organizations
  for each row execute function public.touch_updated_at();

-- memberships -------------------------------------------------------------

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'readonly')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

alter table public.memberships enable row level security;

create index memberships_user_id_idx on public.memberships (user_id);

create trigger trg_memberships_updated_at
  before update on public.memberships
  for each row execute function public.touch_updated_at();

-- Fonctions "security definer" : évitent la récursion RLS en lisant
-- memberships hors du contexte de la policy qui protège memberships elle-même.
-- Patron équivalent à public.current_user_role() dans reca-app-v3.

create or replace function public.is_org_member(target_org_id uuid)
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
  );
$$;

create or replace function public.is_org_admin(target_org_id uuid)
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
      and role in ('owner', 'admin')
  );
$$;

-- Création d'une organisation : l'utilisateur authentifié qui la crée en
-- devient automatiquement propriétaire (contournement RLS via security definer,
-- seule façon propre d'insérer la première membership sans policy circulaire).

create or replace function public.handle_new_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.memberships (organization_id, user_id, role, status)
  values (new.id, auth.uid(), 'owner', 'active');
  return new;
end;
$$;

create trigger trg_organizations_owner_membership
  after insert on public.organizations
  for each row execute function public.handle_new_organization();

-- invitations ---------------------------------------------------------------

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'member', 'readonly')),
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  invited_by uuid references auth.users(id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.invitations enable row level security;

create index invitations_organization_id_idx on public.invitations (organization_id);

-- Policies --------------------------------------------------------------

create policy organizations_select_member
  on public.organizations for select to authenticated
  using (public.is_org_member(id));

create policy organizations_insert_authenticated
  on public.organizations for insert to authenticated
  with check (true);

create policy organizations_update_admin
  on public.organizations for update to authenticated
  using (public.is_org_admin(id))
  with check (public.is_org_admin(id));

create policy memberships_select_member
  on public.memberships for select to authenticated
  using (public.is_org_member(organization_id));

create policy memberships_insert_admin
  on public.memberships for insert to authenticated
  with check (public.is_org_admin(organization_id));

create policy memberships_update_admin
  on public.memberships for update to authenticated
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

create policy invitations_select_admin
  on public.invitations for select to authenticated
  using (public.is_org_admin(organization_id));

create policy invitations_insert_admin
  on public.invitations for insert to authenticated
  with check (public.is_org_admin(organization_id) and invited_by = auth.uid());

create policy invitations_update_admin
  on public.invitations for update to authenticated
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));
