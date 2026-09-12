-- Phase 7 (partielle) — administration : Signa crée le compte du client
-- après paiement, avec invitation (doc 08-ADMINISTRATION-SIGNA.md,
-- MVP réel documenté depuis Phase 0 mais jamais construit : la table
-- invitations existait, rien ne l'utilisait).

-- Un premier utilisateur invité par Signa doit pouvoir devenir "owner"
-- de son organisation (comme un créateur en self-signup), pas seulement
-- admin/member/readonly. Corrige la contrainte d'une migration antérieure
-- par une nouvelle (règle "toute migration appliquée est immuable").
alter table public.invitations drop constraint invitations_role_check;
alter table public.invitations add constraint invitations_role_check
  check (role in ('owner', 'admin', 'member', 'readonly'));

-- Le personnel Signa qui crée une organisation pour un client ne doit
-- jamais en devenir membre lui-même (le trigger existant l'aurait fait
-- propriétaire automatiquement). Corrige handle_new_organization par une
-- nouvelle version plutôt que de modifier la migration d'origine.
create or replace function public.handle_new_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_internal_staff() then
    insert into public.memberships (organization_id, user_id, role, status)
    values (new.id, auth.uid(), 'owner', 'active');
  end if;
  return new;
end;
$$;

-- Le personnel Signa n'est pas membre de l'organisation cliente : il a
-- besoin d'une policy dédiée pour émettre une invitation (distincte de
-- invitations_insert_admin, qui exige is_org_admin).
create policy invitations_insert_staff_admin
  on public.invitations for insert to authenticated
  with check (public.is_internal_admin() and invited_by = auth.uid());

create policy invitations_select_staff
  on public.invitations for select to authenticated
  using (public.is_internal_staff());

-- RPC : crée l'organisation + l'invitation en une transaction, journalisée.
create or replace function public.admin_create_organization_with_invitation(
  p_name text,
  p_email text
)
returns table(organization_id uuid, invitation_token text)
language plpgsql
as $$
declare
  v_org_id uuid;
  v_token text;
begin
  if not public.is_internal_admin() then
    raise exception 'Action réservée au personnel Signa (opérations).';
  end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Le nom de l''organisation est requis.';
  end if;
  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'Le courriel du client est requis.';
  end if;

  insert into public.organizations (name) values (trim(p_name)) returning id into v_org_id;

  insert into public.invitations (organization_id, email, role, invited_by)
  values (v_org_id, lower(trim(p_email)), 'owner', auth.uid())
  returning token into v_token;

  insert into public.audit_events (actor_user_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'organization.created_with_invitation', 'organization', v_org_id::text, jsonb_build_object('email', lower(trim(p_email))));

  return query select v_org_id, v_token;
end;
$$;

grant execute on function public.admin_create_organization_with_invitation(text, text) to authenticated;

-- RPC : le client authentifié rachète son invitation (security definer :
-- il n'a encore aucune membership, donc aucune policy client ne le
-- couvrirait — même patron que handle_new_organization).
create or replace function public.accept_invitation(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.invitations%rowtype;
  v_email text;
begin
  select * into v_invitation from public.invitations where token = p_token;
  if v_invitation.id is null then
    raise exception 'Invitation introuvable.';
  end if;
  if v_invitation.status <> 'pending' then
    raise exception 'Cette invitation n''est plus valide.';
  end if;
  if v_invitation.expires_at < now() then
    update public.invitations set status = 'expired' where id = v_invitation.id;
    raise exception 'Cette invitation a expiré.';
  end if;

  select email into v_email from auth.users where id = auth.uid();
  if v_email is null or lower(v_email) <> v_invitation.email then
    raise exception 'Cette invitation ne correspond pas à votre compte.';
  end if;

  insert into public.memberships (organization_id, user_id, role, status)
  values (v_invitation.organization_id, auth.uid(), v_invitation.role, 'active')
  on conflict (organization_id, user_id) do update set role = excluded.role, status = 'active';

  update public.invitations set status = 'accepted', accepted_at = now() where id = v_invitation.id;
end;
$$;

grant execute on function public.accept_invitation(text) to authenticated;
