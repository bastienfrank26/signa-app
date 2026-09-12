-- current_app_session() : source unique pour le front (patron reca-app-v3),
-- adapté au multi-organisation (un utilisateur peut appartenir à plusieurs
-- organisations, contrairement à reca-app-v3 qui est mono-organisation).
-- Security definer pour lire memberships/organizations sans dépendre des
-- policies RLS déjà en place (elles s'appliquent quand même à toute autre
-- lecture faite par le client).

create or replace function public.current_app_session()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select case
    when auth.uid() is null then null
    else jsonb_build_object(
      'authUserId', auth.uid(),
      'email', (select email from auth.users where id = auth.uid()),
      'memberships', coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'organizationId', m.organization_id,
              'organizationName', o.name,
              'role', m.role
            )
            order by m.created_at
          )
          from public.memberships m
          join public.organizations o on o.id = m.organization_id
          where m.user_id = auth.uid()
            and m.status = 'active'
            and o.deleted_at is null
        ),
        '[]'::jsonb
      )
    )
  end;
$$;

grant execute on function public.current_app_session() to authenticated;
