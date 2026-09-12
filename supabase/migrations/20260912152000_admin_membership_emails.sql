-- Le client authentifié ne peut pas lire auth.users (schéma non exposé par
-- PostgREST). Cette fonction donne au personnel Signa la liste des membres
-- d'une organisation avec leur courriel, sans exposer auth.users plus
-- largement.

create or replace function public.admin_organization_memberships(p_org_id uuid)
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
            'id', m.id,
            'userId', m.user_id,
            'email', u.email,
            'role', m.role,
            'status', m.status
          )
          order by m.created_at
        )
        from public.memberships m
        join auth.users u on u.id = m.user_id
        where m.organization_id = p_org_id
      ),
      '[]'::jsonb
    )
  end;
$$;

grant execute on function public.admin_organization_memberships(uuid) to authenticated;
