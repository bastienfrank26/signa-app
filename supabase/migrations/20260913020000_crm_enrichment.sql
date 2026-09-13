-- Enrichissement CRM (docs 01/03/06/07, 2026-09-13) : responsable,
-- lifecycle_status (conversion prospect → client), UTM sur les
-- opportunités, fichiers attachés à une fiche contact.

-- Responsable -------------------------------------------------------------

alter table public.contacts add column owner_user_id uuid references auth.users(id);
alter table public.opportunities add column owner_user_id uuid references auth.users(id);

-- Annuaire des membres actifs d'une organisation, pour peupler un sélecteur
-- de responsable côté client (l'e-mail d'un membre n'est autrement visible
-- que du personnel Signa, via une RPC admin distincte).
create or replace function public.org_member_directory(p_organization_id uuid)
returns table(user_id uuid, email text)
language sql
security definer
set search_path = public
stable
as $$
  select m.user_id, u.email
  from public.memberships m
  join auth.users u on u.id = m.user_id
  where m.organization_id = p_organization_id
    and m.status = 'active'
    and public.is_org_member(p_organization_id);
$$;

grant execute on function public.org_member_directory(uuid) to authenticated;

-- lifecycle_status et conversion prospect → client -------------------------

alter table public.contacts add column lifecycle_status text not null default 'prospect'
  check (lifecycle_status in ('prospect', 'client', 'inactive'));

alter table public.opportunities add column won_at timestamptz;
alter table public.opportunities add column lost_at timestamptz;

-- Remplace la fonction de la migration crm_core : ajoute won_at/lost_at et
-- la conversion du contact en client (doc 06 : "ne jamais recréer une
-- deuxième fiche client identique" — un attribut sur le contact existant).
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
  if new_won then
    update public.opportunities set won_at = now() where id = new.id;
    update public.contacts set lifecycle_status = 'client' where id = new.contact_id and lifecycle_status <> 'client';
    insert into public.activities (organization_id, opportunity_id, contact_id, author_id, activity_type, note)
    values (new.organization_id, new.id, new.contact_id, auth.uid(), 'converted_to_client', coalesce(contact_name, '') || ' devient client.');
  elsif new_lost then
    update public.opportunities set lost_at = now() where id = new.id;
  end if;
  return new;
end;
$$;

-- UTM et provenance sur les opportunités ------------------------------------

alter table public.opportunities add column source_detail text;
alter table public.opportunities add column site_id uuid references public.sites(id);
alter table public.opportunities add column landing_page text;
alter table public.opportunities add column utm_source text;
alter table public.opportunities add column utm_medium text;
alter table public.opportunities add column utm_campaign text;
alter table public.opportunities add column utm_content text;
alter table public.opportunities add column utm_term text;

-- capture_site_submission_v1 : conserve la provenance complète (doc 07).
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
  v_reused_contact boolean := false;
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
    select id into v_contact_id
    from public.contacts
    where organization_id = v_org_id
      and deleted_at is null
      and (
        (v_email is not null and email_normalized = public.normalize_email(v_email))
        or (v_phone is not null and phone_normalized = public.normalize_phone(v_phone))
      )
    order by created_at desc
    limit 1;

    if v_contact_id is not null then
      v_reused_contact := true;
    else
      insert into public.contacts (organization_id, name, email, phone, source)
      values (v_org_id, v_name, v_email, v_phone, 'Formulaire du site')
      returning id into v_contact_id;
    end if;

    insert into public.opportunities (
      organization_id, pipeline_id, stage_id, contact_id, need, source,
      source_detail, site_id, landing_page, utm_source, utm_medium, utm_campaign, utm_content, utm_term
    )
    values (
      v_org_id, v_pipeline_id, v_first_stage_id, v_contact_id,
      left(coalesce(p_command->>'message', 'Nouvelle demande'), 500), 'Formulaire du site',
      p_command->>'formKey', p_site_id, p_command #>> '{context,pageUrl}',
      p_command #>> '{context,utmSource}', p_command #>> '{context,utmMedium}',
      p_command #>> '{context,utmCampaign}', p_command #>> '{context,utmContent}', p_command #>> '{context,utmTerm}'
    )
    returning id into v_opportunity_id;

    insert into public.activities (organization_id, opportunity_id, contact_id, activity_type, note)
    values (
      v_org_id, v_opportunity_id, v_contact_id, 'site_submission_received',
      case when v_reused_contact then 'Nouvelle demande reçue du site (contact existant, formulaire ' else 'Nouveau prospect reçu du site (formulaire ' end
        || coalesce(p_command->>'formKey', '?') || ')'
    );
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

-- Fichiers attachés à une fiche contact --------------------------------------

create table public.contact_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  uploaded_by uuid references auth.users(id),
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.contact_files enable row level security;

create index contact_files_contact_id_idx on public.contact_files (contact_id);

create policy contact_files_select_member
  on public.contact_files for select to authenticated
  using (public.is_org_member(organization_id));

create policy contact_files_insert_member
  on public.contact_files for insert to authenticated
  with check (public.is_org_writer(organization_id) and public.is_org_active(organization_id) and uploaded_by = auth.uid());

insert into storage.buckets (id, name, public)
values ('crm-files', 'crm-files', false)
on conflict (id) do nothing;

create policy crm_files_storage_select
  on storage.objects for select to authenticated
  using (bucket_id = 'crm-files' and public.is_org_member((storage.foldername(name))[1]::uuid));

create policy crm_files_storage_insert
  on storage.objects for insert to authenticated
  with check (bucket_id = 'crm-files' and public.is_org_writer((storage.foldername(name))[1]::uuid) and public.is_org_active((storage.foldername(name))[1]::uuid));
