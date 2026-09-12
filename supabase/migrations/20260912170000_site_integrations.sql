-- Phase 4 — intégration des sites clients (doc 07-INTEGRATION-DES-SITES.md).
-- sites / api_keys / form_submissions. Ces tables sont exclusives au
-- personnel Signa (doc : "Configuration interne : L'administration crée le
-- site") — aucun accès client, ni lecture ni écriture. L'ingestion publique
-- passe uniquement par l'Edge Function `site-submissions`, avec le rôle de
-- service (qui contourne RLS de toute façon).

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  allowed_origins text[] not null default '{}',
  destination text not null default 'crm' check (destination in ('crm')),
  status text not null default 'active' check (status in ('active', 'suspended', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sites enable row level security;

create index sites_organization_id_idx on public.sites (organization_id);

create trigger trg_sites_updated_at
  before update on public.sites
  for each row execute function public.touch_updated_at();

create policy sites_select_staff on public.sites for select to authenticated
  using (public.is_internal_staff());

-- api_keys -------------------------------------------------------------
-- Seul le hachage est conservé (doc : "Seul le hachage d'une clé est
-- stocké"). Le secret en clair n'est jamais relu après sa création.

create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  key_hash text not null,
  key_prefix text not null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table public.api_keys enable row level security;

create index api_keys_site_id_idx on public.api_keys (site_id);

create policy api_keys_select_staff on public.api_keys for select to authenticated
  using (public.is_internal_staff());

-- form_submissions ----------------------------------------------------------
-- organization_id est dénormalisé depuis sites pour simplifier RLS et audit,
-- même patron que activities/tasks.

create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  form_key text not null,
  idempotency_key text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  message text,
  consent_privacy boolean not null default false,
  consent_marketing boolean not null default false,
  page_url text,
  utm_source text,
  status text not null default 'received' check (status in ('received', 'duplicate', 'rejected')),
  created_contact_id uuid references public.contacts(id),
  created_opportunity_id uuid references public.opportunities(id),
  created_at timestamptz not null default now(),
  unique (site_id, idempotency_key)
);

alter table public.form_submissions enable row level security;

create index form_submissions_organization_id_idx on public.form_submissions (organization_id, created_at desc);

create policy form_submissions_select_staff on public.form_submissions for select to authenticated
  using (public.is_internal_staff());

-- Administration : créer un site, générer/faire pivoter sa clé,
-- suspendre/révoquer/rétablir. Toute action mute et écrit l'audit (doc :
-- "Actions dangereuses ... demandent confirmation et motif").

create or replace function public.admin_create_site(
  p_org_id uuid,
  p_name text,
  p_allowed_origins text[]
)
returns jsonb
language plpgsql
as $$
declare
  new_site_id uuid;
  secret text;
begin
  if not public.is_internal_admin() then
    raise exception 'Action réservée au personnel Signa (opérations).';
  end if;

  insert into public.sites (organization_id, name, allowed_origins)
  values (p_org_id, p_name, coalesce(p_allowed_origins, '{}'))
  returning id into new_site_id;

  secret := encode(gen_random_bytes(32), 'hex');
  insert into public.api_keys (site_id, key_hash, key_prefix)
  values (new_site_id, encode(digest(secret, 'sha256'), 'hex'), left(secret, 8));

  insert into public.audit_events (actor_user_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'site.created', 'site', new_site_id::text, jsonb_build_object('name', p_name));

  return jsonb_build_object('siteId', new_site_id, 'secret', secret);
end;
$$;

grant execute on function public.admin_create_site(uuid, text, text[]) to authenticated;

create or replace function public.admin_rotate_site_key(p_site_id uuid)
returns jsonb
language plpgsql
as $$
declare
  secret text;
begin
  if not public.is_internal_admin() then
    raise exception 'Action réservée au personnel Signa (opérations).';
  end if;

  update public.api_keys set status = 'revoked', revoked_at = now()
  where site_id = p_site_id and status = 'active';

  secret := encode(gen_random_bytes(32), 'hex');
  insert into public.api_keys (site_id, key_hash, key_prefix)
  values (p_site_id, encode(digest(secret, 'sha256'), 'hex'), left(secret, 8));

  insert into public.audit_events (actor_user_id, action, target_type, target_id)
  values (auth.uid(), 'site.key_rotated', 'site', p_site_id::text);

  return jsonb_build_object('secret', secret);
end;
$$;

grant execute on function public.admin_rotate_site_key(uuid) to authenticated;

create or replace function public.admin_set_site_status(
  p_site_id uuid,
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
  if p_status not in ('active', 'suspended', 'revoked') then
    raise exception 'Statut invalide.';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Un motif est requis.';
  end if;

  update public.sites set status = p_status where id = p_site_id;

  insert into public.audit_events (actor_user_id, action, target_type, target_id, reason, metadata)
  values (auth.uid(), 'site.status_changed', 'site', p_site_id::text, p_reason, jsonb_build_object('status', p_status));
end;
$$;

grant execute on function public.admin_set_site_status(uuid, text, text) to authenticated;

-- Liste des sites d'une organisation, avec l'identification de clé (jamais
-- le secret ni le hachage) — pour la fiche d'organisation.

create or replace function public.admin_list_sites(p_org_id uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select case
    when not public.is_internal_staff() then null
    else coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'status', s.status,
            'allowedOrigins', s.allowed_origins,
            'keyPrefix', (
              select k.key_prefix from public.api_keys k
              where k.site_id = s.id and k.status = 'active'
              order by k.created_at desc limit 1
            )
          )
          order by s.created_at
        )
        from public.sites s
        where s.organization_id = p_org_id
      ),
      '[]'::jsonb
    )
  end;
$$;

grant execute on function public.admin_list_sites(uuid) to authenticated;

-- Capture publique d'une soumission de formulaire (doc : traitement en 7
-- étapes). Appelée uniquement par l'Edge Function `site-submissions` avec le
-- rôle de service : la vérification du site/de la clé/des origines se fait
-- dans l'Edge Function *avant* cet appel, cette fonction se concentre sur la
-- déduplication, la limite de débit et la création des objets métier.

create or replace function public.capture_site_submission_v1(
  p_site_id uuid,
  p_command jsonb
)
returns jsonb
language plpgsql
as $$
declare
  v_org_id uuid;
  v_pipeline_id uuid;
  v_first_stage_id uuid;
  v_submission_id uuid;
  v_contact_id uuid;
  v_opportunity_id uuid;
  v_recent_count int;
  v_name text;
  v_email text;
  v_phone text;
begin
  select organization_id into v_org_id from public.sites where id = p_site_id and status = 'active';
  if v_org_id is null then
    raise exception 'SITE_NOT_FOUND';
  end if;

  select count(*) into v_recent_count from public.form_submissions
  where site_id = p_site_id and created_at > now() - interval '1 minute';
  if v_recent_count >= 20 then
    raise exception 'SITE_SUBMISSION_RATE_LIMITED';
  end if;

  -- Idempotence : une reprise avec la même clé ne crée rien de nouveau.
  select id into v_submission_id from public.form_submissions
  where site_id = p_site_id and idempotency_key = p_command->>'idempotencyKey';
  if v_submission_id is not null then
    return jsonb_build_object('submissionId', v_submission_id, 'duplicate', true);
  end if;

  v_name := nullif(trim(p_command #>> '{contact,name}'), '');
  v_email := nullif(trim(p_command #>> '{contact,email}'), '');
  v_phone := nullif(trim(p_command #>> '{contact,phone}'), '');

  select id into v_pipeline_id from public.pipelines where organization_id = v_org_id limit 1;
  if v_pipeline_id is not null then
    select id into v_first_stage_id from public.pipeline_stages
    where pipeline_id = v_pipeline_id order by position limit 1;
  end if;

  if v_pipeline_id is not null and v_first_stage_id is not null and v_name is not null then
    insert into public.contacts (organization_id, name, email, phone, source)
    values (v_org_id, v_name, v_email, v_phone, 'Formulaire du site')
    returning id into v_contact_id;

    insert into public.opportunities (organization_id, pipeline_id, stage_id, contact_id, need, source)
    values (v_org_id, v_pipeline_id, v_first_stage_id, v_contact_id, left(coalesce(p_command->>'message', 'Nouvelle demande'), 500), 'Formulaire du site')
    returning id into v_opportunity_id;

    insert into public.activities (organization_id, opportunity_id, contact_id, activity_type, note)
    values (v_org_id, v_opportunity_id, v_contact_id, 'note', 'Nouveau prospect reçu du site (formulaire ' || coalesce(p_command->>'formKey', '?') || ')');
  end if;

  insert into public.form_submissions (
    site_id, organization_id, form_key, idempotency_key, contact_name, contact_email, contact_phone,
    message, consent_privacy, consent_marketing, page_url, utm_source, created_contact_id, created_opportunity_id
  ) values (
    p_site_id, v_org_id, coalesce(p_command->>'formKey', 'contact'), p_command->>'idempotencyKey',
    v_name, v_email, v_phone, p_command->>'message',
    coalesce((p_command #>> '{consent,privacy}')::boolean, false),
    coalesce((p_command #>> '{consent,marketing}')::boolean, false),
    p_command #>> '{context,pageUrl}', p_command #>> '{context,utmSource}',
    v_contact_id, v_opportunity_id
  )
  returning id into v_submission_id;

  return jsonb_build_object('submissionId', v_submission_id, 'duplicate', false);
end;
$$;
