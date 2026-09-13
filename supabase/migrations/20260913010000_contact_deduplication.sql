-- Déduplication de contacts (docs 03/06/07, enrichis 2026-09-13).
-- Confirmé en pratique le jour même : un vrai test avec signa-web-barbier
-- a créé 3 contacts identiques pour la même personne (aucune détection
-- avant cette migration).

create or replace function public.normalize_email(p_email text)
returns text
language sql
immutable
as $$
  select nullif(lower(trim(p_email)), '');
$$;

-- Meilleur effort E.164 pour les numéros nord-américains (10 chiffres, ou
-- 11 chiffres commençant par 1). Les autres formats gardent seulement les
-- chiffres préfixés d'un "+", sans validation d'indicatif international.
create or replace function public.normalize_phone(p_phone text)
returns text
language sql
immutable
as $$
  select case
    when p_phone is null or length(trim(p_phone)) = 0 then null
    when length(regexp_replace(p_phone, '\D', '', 'g')) = 10
      then '+1' || regexp_replace(p_phone, '\D', '', 'g')
    when length(regexp_replace(p_phone, '\D', '', 'g')) = 11
      and left(regexp_replace(p_phone, '\D', '', 'g'), 1) = '1'
      then '+' || regexp_replace(p_phone, '\D', '', 'g')
    when length(regexp_replace(p_phone, '\D', '', 'g')) > 0
      then '+' || regexp_replace(p_phone, '\D', '', 'g')
    else null
  end;
$$;

alter table public.contacts add column email_normalized text;
alter table public.contacts add column phone_normalized text;

update public.contacts
set email_normalized = public.normalize_email(email),
    phone_normalized = public.normalize_phone(phone);

create or replace function public.contacts_set_normalized()
returns trigger
language plpgsql
as $$
begin
  new.email_normalized := public.normalize_email(new.email);
  new.phone_normalized := public.normalize_phone(new.phone);
  return new;
end;
$$;

create trigger trg_contacts_set_normalized
  before insert or update of email, phone on public.contacts
  for each row execute function public.contacts_set_normalized();

create index contacts_org_email_normalized_idx
  on public.contacts (organization_id, email_normalized) where email_normalized is not null;
create index contacts_org_phone_normalized_idx
  on public.contacts (organization_id, phone_normalized) where phone_normalized is not null;

-- Recherche de doublon, utilisable côté client (création manuelle) une fois
-- le formulaire enrichi de courriel/téléphone — voir memory/tasks.md.
-- Security invoker : la policy contacts_select_member fait déjà le filtre.
create or replace function public.find_duplicate_contact(
  p_organization_id uuid,
  p_email text,
  p_phone text
)
returns table(id uuid, name text, company_name text, email text, phone text)
language sql
stable
as $$
  select c.id, c.name, c.company_name, c.email, c.phone
  from public.contacts c
  where c.organization_id = p_organization_id
    and c.deleted_at is null
    and (
      (p_email is not null and c.email_normalized = public.normalize_email(p_email))
      or (p_phone is not null and c.phone_normalized = public.normalize_phone(p_phone))
    )
  order by c.created_at desc
  limit 1;
$$;

grant execute on function public.find_duplicate_contact(uuid, text, text) to authenticated;

-- capture_site_submission_v1 : réutilise un contact existant (courriel ou
-- téléphone normalisé) au lieu d'en créer un nouveau à chaque soumission.
-- Une nouvelle opportunité est toujours créée pour la demande (doc 07 :
-- "une nouvelle demande crée toujours une nouvelle opportunité lorsque
-- nécessaire") — jamais de fusion ni d'écrasement des coordonnées existantes.
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

    insert into public.opportunities (organization_id, pipeline_id, stage_id, contact_id, need, source)
    values (v_org_id, v_pipeline_id, v_first_stage_id, v_contact_id, left(coalesce(p_command->>'message', 'Nouvelle demande'), 500), 'Formulaire du site')
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
