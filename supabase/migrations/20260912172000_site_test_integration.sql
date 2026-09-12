-- Correctif : le bouton "Tester l'intégration" de la console admin appelait
-- l'Edge Function directement depuis le navigateur (origine app.signaweb.ca),
-- ce que la RLS d'origine du site rejette toujours par conception (CORS
-- "Failed to fetch"). capture_site_submission_v1 passe en security definer
-- pour être appelable directement par le personnel Signa (RPC ci-dessous),
-- sans dépendre du rôle de service ni d'une requête HTTP sortante.

create or replace function public.capture_site_submission_v1(
  p_site_id uuid,
  p_command jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
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

-- IMPORTANT : security definer rend cette fonction exécutable par
-- n'importe quel rôle sans passer par la vérification de clé secrète (faite
-- dans l'Edge Function, pas ici). Postgres accorde EXECUTE à PUBLIC par
-- défaut à la création d'une fonction — il faut le retirer explicitement,
-- sinon un membre authentifié quelconque pourrait créer des prospects dans
-- N'IMPORTE QUELLE organisation en appelant directement cette fonction.
revoke execute on function public.capture_site_submission_v1(uuid, jsonb) from public;
grant execute on function public.capture_site_submission_v1(uuid, jsonb) to service_role;

-- Appelable directement par le personnel Signa depuis la console admin, sans
-- passer par l'Edge Function (évite le blocage CORS attendu : l'admin n'est
-- pas l'origine déclarée du site). Security definer uniquement pour pouvoir
-- appeler capture_site_submission_v1 malgré le retrait ci-dessus (les deux
-- fonctions appartiennent au même rôle propriétaire) — la vérification
-- d'autorisation se fait explicitement ici, pas par la revocation seule.

create or replace function public.admin_test_site_integration(p_site_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_internal_staff() then
    raise exception 'Action réservée au personnel Signa.';
  end if;
  return public.capture_site_submission_v1(p_site_id, jsonb_build_object(
    'formKey', 'test-integration',
    'idempotencyKey', 'admin-test-' || gen_random_uuid()::text,
    'contact', jsonb_build_object('name', 'Test d''intégration Signa', 'email', 'test@signaweb.ca'),
    'message', 'Envoi de test depuis la console Signa.',
    'consent', jsonb_build_object('privacy', true)
  ));
end;
$$;

grant execute on function public.admin_test_site_integration(uuid) to authenticated;
