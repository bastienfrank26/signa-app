-- Correctif : `insert(...).select()` sur organizations échouait pour RLS.
-- Cause : la policy SELECT dépendait de la membership insérée par le trigger
-- AFTER INSERT, non garantie visible à la vérification RETURNING de la même
-- commande. Ajout de created_by (visible immédiatement, sans dépendre du
-- trigger) comme second chemin d'accès à la policy SELECT.

alter table public.organizations
  add column created_by uuid references auth.users(id);

create or replace function public.set_organization_created_by()
returns trigger
language plpgsql
as $$
begin
  new.created_by := auth.uid();
  return new;
end;
$$;

create trigger trg_organizations_created_by
  before insert on public.organizations
  for each row execute function public.set_organization_created_by();

drop policy organizations_select_member on public.organizations;

create policy organizations_select_member
  on public.organizations for select to authenticated
  using (public.is_org_member(id) or created_by = auth.uid());
