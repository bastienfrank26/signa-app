-- DEC-020 : tranche DEC-015/DEC-003 — retire l'inscription libre
-- (n'importe quel utilisateur authentifié pouvait créer sa propre
-- organisation). Seul le personnel Signa peut désormais créer une
-- organisation, via admin_create_organization_with_invitation
-- (migration 20260912200000). Le compte (auth.users) reste public,
-- seule la création d'organisation devient réservée au personnel.

drop policy organizations_insert_authenticated on public.organizations;

create policy organizations_insert_staff_admin
  on public.organizations for insert to authenticated
  with check (public.is_internal_admin());
